import 'server-only';

import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import {
  claimProductImageAssets,
  findProductByExactSlug,
  findProductImageBySha256,
  getProductImageAssetStats,
  saveProductImageProcessingResult,
  setProductImageIfEmpty,
} from '@/lib/cms-db';
import { getDropboxClientForAdmin } from '@/lib/product-image-intelligence';

const MAX_BATCH_SIZE = 10;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const OUTPUT_EDGE = 1600;
const WATERMARK_VERSION = 'jk-product-catalog-v1';
const WATERMARK_LABEL = 'JURAGAN KOMPRESOR · PRODUCT CATALOG';
const APPROVED_RIGHTS = new Set(['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']);
const EXPECTED_FORMATS: Record<string, string> = {
  avif: 'avif', bmp: 'bmp', gif: 'gif', jpeg: 'jpeg', jpg: 'jpeg', png: 'png', tif: 'tiff', tiff: 'tiff', webp: 'webp',
};

class InvalidImageError extends Error {}

function createWatermarkSvg(width: number) {
  const height = Math.max(42, Math.round(width * 0.13));
  const fontSize = Math.max(12, Math.round(width * 0.034));
  const safeLabel = WATERMARK_LABEL.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return {
    height,
    input: Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="10" fill="#102b28" fill-opacity="0.76"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="0.5" fill="#fff">${safeLabel}</text></svg>`),
  };
}

async function createPerceptualHash(input: Buffer) {
  const { data } = await sharp(input, { limitInputPixels: MAX_PIXELS }).rotate().resize(9, 8, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let hash = BigInt(0);
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      hash = (hash << BigInt(1)) | (data[row * 9 + column] > data[row * 9 + column + 1] ? BigInt(1) : BigInt(0));
    }
  }
  return hash.toString(16).padStart(16, '0');
}

function getProductSlugFromFilename(fileName: string) {
  const stem = fileName.replace(/\.[^.]+$/, '');
  return stem.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
}

function calculateQualityScore(width: number, height: number) {
  const minimumEdgeScore = Math.min(1, Math.min(width, height) / 900);
  const pixelScore = Math.min(1, Math.sqrt(width * height) / 1400);
  const aspectRatio = width / height;
  const aspectScore = Math.max(0.7, 1 - Math.abs(Math.log(aspectRatio)) / 5);
  return Math.round(100 * (minimumEdgeScore * 0.5 + pixelScore * 0.3 + aspectScore * 0.2));
}

async function processAsset(userId: string, asset: Awaited<ReturnType<typeof claimProductImageAssets>>[number]) {
  if (!APPROVED_RIGHTS.has(asset.rightsStatus) || asset.sourceDeletedAt) {
    throw new Error('Hak penggunaan belum disetujui atau sumber sudah dihapus.');
  }
  if (asset.sizeBytes > MAX_FILE_BYTES) {
    throw new InvalidImageError('Ukuran file melewati batas pemrosesan 20 MB.');
  }

  const client = await getDropboxClientForAdmin({ id: userId });
  const download = await client.filesDownload({ path: asset.sourceFileId });
  const fileBinary = download.result.fileBinary;
  if (!fileBinary) throw new InvalidImageError('Dropbox tidak mengembalikan isi berkas gambar.');
  const input = Buffer.from(fileBinary);
  if (!input.length || input.length > MAX_FILE_BYTES) {
    throw new InvalidImageError('File kosong atau melebihi batas pemrosesan 20 MB.');
  }

  const inputImage = sharp(input, { failOn: 'error', limitInputPixels: MAX_PIXELS, animated: false });
  const metadata = await inputImage.metadata();
  const extension = asset.fileName.split('.').pop()?.toLowerCase() ?? '';
  if (!metadata.format || !metadata.width || !metadata.height || metadata.pages && metadata.pages > 1 || EXPECTED_FORMATS[extension] !== metadata.format) {
    throw new InvalidImageError('Format, dimensi, atau isi file tidak cocok dengan gambar raster yang didukung.');
  }

  const normalized = await inputImage.clone().rotate().resize({ width: OUTPUT_EDGE, height: OUTPUT_EDGE, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86, effort: 4 }).toBuffer({ resolveWithObject: true });
  const outputWidth = normalized.info.width;
  const outputHeight = normalized.info.height;
  const overlayWidth = Math.min(Math.max(220, Math.round(outputWidth * 0.48)), 560, outputWidth);
  const watermark = createWatermarkSvg(overlayWidth);
  const finalImage = await sharp(normalized.data).composite([{
    input: watermark.input,
    left: Math.max(0, outputWidth - overlayWidth - Math.max(16, Math.round(outputWidth * 0.025))),
    top: Math.max(0, outputHeight - watermark.height - Math.max(16, Math.round(outputHeight * 0.025))),
  }]).webp({ quality: 86, effort: 4 }).toBuffer();
  const imageSha256 = createHash('sha256').update(input).digest('hex');
  const perceptualHash = await createPerceptualHash(input);
  const qualityScore = calculateQualityScore(metadata.width, metadata.height);
  const dimensions = { width: metadata.width, height: metadata.height };

  const duplicate = await findProductImageBySha256(userId, imageSha256, asset.id);
  const slug = getProductSlugFromFilename(asset.fileName);
  const product = slug ? await findProductByExactSlug(slug) : null;
  if (duplicate?.storagePath) {
    const saved = await saveProductImageProcessingResult(userId, asset.id, asset.revision, {
      processingStatus: 'DUPLICATE', imageSha256, perceptualHash, ...dimensions,
      storagePath: duplicate.storagePath, productId: product?.id ?? duplicate.productId,
      processedAt: new Date(), qualityScore, watermarkStatus: 'APPLIED', watermarkVersion: WATERMARK_VERSION,
    });
    if (!saved) throw new Error('Sumber berubah saat diproses; jalankan batch berikutnya untuk revisi terbaru.');
    if (product) await setProductImageIfEmpty(product.id, duplicate.storagePath, userId, asset.id);
    return 'duplicate' as const;
  }

  const ownerFolder = createHash('sha256').update(userId).digest('hex').slice(0, 24);
  const blob = await put(`product-catalog/${ownerFolder}/${imageSha256.slice(0, 2)}/${imageSha256}-${WATERMARK_VERSION}.webp`, finalImage, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'image/webp',
    cacheControlMaxAge: 31_536_000,
  });
  const saved = await saveProductImageProcessingResult(userId, asset.id, asset.revision, {
    processingStatus: 'PROCESSED', imageSha256, perceptualHash, ...dimensions,
    storagePath: blob.url, productId: product?.id ?? null,
    processedAt: new Date(), qualityScore, watermarkStatus: 'APPLIED', watermarkVersion: WATERMARK_VERSION,
  });
  if (!saved) throw new Error('Sumber berubah saat diproses; jalankan batch berikutnya untuk revisi terbaru.');
  if (product) await setProductImageIfEmpty(product.id, blob.url, userId, asset.id);
  return 'processed' as const;
}

export async function processNextProductImageBatch(userId: string, retryFailed = false) {
  const assets = await claimProductImageAssets(userId, MAX_BATCH_SIZE, retryFailed);
  const result = { attempted: assets.length, processed: 0, duplicates: 0, failed: 0, invalid: 0 };

  for (const asset of assets) {
    try {
      const status = await processAsset(userId, asset);
      if (status === 'duplicate') result.duplicates += 1;
      else result.processed += 1;
    } catch (error) {
      const invalid = error instanceof InvalidImageError;
      const message = error instanceof Error ? error.message.slice(0, 1000) : 'Pemrosesan gambar gagal.';
      const saved = await saveProductImageProcessingResult(userId, asset.id, asset.revision, {
        processingStatus: invalid ? 'INVALID' : 'FAILED',
        processingError: message,
        processedAt: null,
      });
      if (saved) {
        if (invalid) result.invalid += 1;
        else result.failed += 1;
      }
      console.error('[v0] Product image processing failed', { assetId: asset.id, error: message });
    }
  }

  const stats = await getProductImageAssetStats(userId);
  return { ...result, remaining: retryFailed ? stats.ready + stats.retryable : stats.ready };
}

export const PRODUCT_IMAGE_WATERMARK_VERSION = WATERMARK_VERSION;
export const PRODUCT_IMAGE_BATCH_SIZE = MAX_BATCH_SIZE;
export const PRODUCT_IMAGE_MAX_FILE_BYTES = MAX_FILE_BYTES;
export const PRODUCT_IMAGE_MAX_PIXELS = MAX_PIXELS;
export const PRODUCT_IMAGE_OUTPUT_EDGE = OUTPUT_EDGE;
export const PRODUCT_IMAGE_SUPPORTED_EXTENSIONS = Object.keys(EXPECTED_FORMATS);
export const PRODUCT_IMAGE_FORMATS = EXPECTED_FORMATS;
export const PRODUCT_IMAGE_STATUS_LABELS = {
  DISCOVERED: 'Siap diproses', PROCESSING: 'Sedang diproses', PROCESSED: 'Selesai', DUPLICATE: 'Duplikat', FAILED: 'Gagal', INVALID: 'Tidak valid',
} as const;
