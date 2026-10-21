import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { getToken, startAuthorization, UserAuthorizationRequiredError } from '@vercel/connect';
import { del } from '@vercel/blob';
import { Dropbox, type files } from 'dropbox';
import {
  clearProductImageAssetPublication,
  clearProductImageIfMatches,
  cmsDb,
  cmsSettings,
  hasOtherApprovedProductImageAsset,
  markDropboxImageAssetsDeleted,
  upsertDropboxImageAssets,
} from '@/lib/cms-db';
import { eq } from 'drizzle-orm';

const CONNECTOR_UID = 'dropbox/digiman';
const DROPBOX_SCOPES = ['files.metadata.read', 'files.content.read', 'files.content.write'];
const BATCH_SIZE = 200;
const IMAGE_TYPES: Record<string, string> = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
};

type DropboxUser = { id: string };
type SyncState = { folderPath: string; cursor: string; hasMore: boolean };

async function getOrigin() {
  if (process.env.NODE_ENV !== 'production' && process.env.V0_RUNTIME_URL) return process.env.V0_RUNTIME_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  if (!host) throw new Error('Tidak dapat menentukan alamat aplikasi.');
  return `${requestHeaders.get('x-forwarded-proto') ?? 'https'}://${host}`;
}

function getSubject(user: DropboxUser) {
  return { type: 'user' as const, id: user.id };
}

export async function startDropboxAuthorization(user: DropboxUser) {
  const { url } = await startAuthorization(CONNECTOR_UID, {
    subject: getSubject(user),
    scopes: DROPBOX_SCOPES,
  }, {
    callbackUrl: `${await getOrigin()}/admin/image-intelligence?dropbox=connected`,
  });
  return url;
}

async function getDropboxClient(user: DropboxUser) {
  const accessToken = await getToken(CONNECTOR_UID, {
    subject: getSubject(user),
    scopes: DROPBOX_SCOPES,
  });
  return new Dropbox({ accessToken });
}

export async function getDropboxConnectionStatus(user: DropboxUser): Promise<'connected' | 'authorization-required' | 'unavailable'> {
  try {
    await getToken(CONNECTOR_UID, { subject: getSubject(user), scopes: DROPBOX_SCOPES });
    return 'connected';
  } catch (error) {
    if (error instanceof UserAuthorizationRequiredError) return 'authorization-required';
    return 'unavailable';
  }
}

export function normalizeDropboxFolderPath(value: string) {
  const path = value.trim();
  if (!path || path === '/') return '';
  if (path.length > 500 || path.includes('\\') || path.includes('\0') || path.split('/').some((part) => part === '..')) {
    throw new Error('Folder Dropbox tidak valid. Gunakan path seperti /Katalog/Produk.');
  }
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function getSyncSettingKey(userId: string, folderPath: string) {
  const key = createHash('sha256').update(`${userId}:${folderPath}`).digest('hex');
  return `dropbox_image_sync_${key}`;
}

async function readSyncState(key: string, folderPath: string): Promise<SyncState | null> {
  const [setting] = await cmsDb.select({ value: cmsSettings.value }).from(cmsSettings).where(eq(cmsSettings.key, key)).limit(1);
  if (!setting) return null;
  try {
    const value = JSON.parse(setting.value) as SyncState;
    return value.folderPath === folderPath && value.cursor ? value : null;
  } catch {
    return null;
  }
}

async function saveSyncState(key: string, state: SyncState) {
  const updatedAt = new Date();
  await cmsDb.insert(cmsSettings).values({ key, value: JSON.stringify(state), updatedAt }).onConflictDoUpdate({
    target: cmsSettings.key,
    set: { value: JSON.stringify(state), updatedAt },
  });
}

export async function syncDropboxImageFolder(user: DropboxUser, requestedPath: string) {
  const folderPath = normalizeDropboxFolderPath(requestedPath);
  const client = await getDropboxClient(user);
  const settingKey = getSyncSettingKey(user.id, folderPath);
  const previousState = await readSyncState(settingKey, folderPath);
  const response = previousState
    ? await client.filesListFolderContinue({ cursor: previousState.cursor })
    : await client.filesListFolder({ path: folderPath, recursive: true, limit: BATCH_SIZE });
  const result = response.result;
  const now = new Date();
  const deletedPaths = result.entries.flatMap((entry) => (
    entry['.tag'] === 'deleted' && 'path_lower' in entry && entry.path_lower
      ? [entry.path_lower]
      : []
  ));
  for (const path of deletedPaths) await markDropboxImageAssetsDeleted(user.id, path);

  const imageFiles = result.entries.flatMap((entry) => {
    if (entry['.tag'] !== 'file') return [];
    const file = entry as files.FileMetadata;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = IMAGE_TYPES[extension];
    if (!mimeType) return [];
    const sourcePath = file.path_display ?? `/${file.name}`;
    return [{
      id: randomUUID(),
      ownerUserId: user.id,
      sourceFileId: file.id,
      sourcePath,
      sourcePathLower: file.path_lower ?? sourcePath.toLowerCase(),
      fileName: file.name,
      mimeType,
      sizeBytes: file.size,
      revision: file.rev,
      providerContentHash: file.content_hash ?? null,
      sourceModifiedAt: file.server_modified ? new Date(file.server_modified) : null,
      rightsStatus: 'PENDING_REVIEW',
      rightsBasis: '',
      reviewedBy: null,
      reviewedAt: null,
      sourceDeletedAt: null,
      createdAt: now,
      updatedAt: now,
    }];
  });

  if (imageFiles.length) await upsertDropboxImageAssets(imageFiles);
  await saveSyncState(settingKey, { folderPath, cursor: result.cursor, hasMore: result.has_more });

  return {
    folderPath: folderPath || '/',
    pageEntries: result.entries.length,
    imagesDiscovered: imageFiles.length,
    hasMore: result.has_more,
  };
}

export function isDropboxAuthorizationRequired(error: unknown) {
  return error instanceof UserAuthorizationRequiredError;
}

export const PRODUCT_IMAGE_EXPERT_COUNCIL = [
  'Computer Vision Architect', 'Image Processing Engineer', 'Digital Asset Management', 'Visual Quality Engineer',
  'Image Forensics Specialist', 'Perceptual Hash Specialist', 'OCR Specialist', 'Image Metadata Specialist',
  'Copyright Specialist', 'Trademark Specialist', 'IP Counsel', 'Licensing Specialist', 'Contract Specialist',
  'Provenance Architect', 'Compliance Specialist', 'Privacy Specialist', 'Product Taxonomist',
  'Entity Resolution Specialist', 'Catalog Architect', 'Product Data Engineer', 'Information Retrieval Scientist',
  'Semantic Search Engineer', 'Vector Search Engineer', 'Search Quality Engineer', 'Distributed Systems Architect',
  'Queue/Worker Architect', 'Storage Architect', 'CDN Architect', 'Database Architect', 'Vercel Architect',
  'Dropbox Integration Engineer', 'API Integration Engineer', 'Security Engineer', 'Abuse/Fraud Engineer',
  'Reliability Engineer', 'Observability Engineer', 'Cost Optimization Engineer', 'E-commerce Architect',
  'Product UX Specialist', 'Accessibility Specialist', 'SEO/Google Search Specialist', 'Brand Governance Specialist',
  'Supplier Intelligence Specialist', 'Procurement Specialist', 'Business Intelligence Specialist',
  'Chief System Strategist',
] as const;

export type ProductImageReviewStatus = 'PENDING_REVIEW' | 'OWNED' | 'LICENSED' | 'SUPPLIER_AUTHORIZED' | 'MANUFACTURER_AUTHORIZED' | 'PARTNER_AUTHORIZED' | 'PUBLIC_REUSE_PERMITTED' | 'REJECTED';

export const PRODUCT_IMAGE_REVIEW_STATUSES: ProductImageReviewStatus[] = [
  'PENDING_REVIEW', 'OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED', 'REJECTED',
];

export function requiresRightsEvidence(status: ProductImageReviewStatus) {
  return ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED'].includes(status);
}

export function isProductImageReviewStatus(value: string): value is ProductImageReviewStatus {
  return PRODUCT_IMAGE_REVIEW_STATUSES.includes(value as ProductImageReviewStatus);
}

export async function disconnectDropbox(user: DropboxUser) {
  const { revokeToken } = await import('@vercel/connect');
  await revokeToken(CONNECTOR_UID, { subject: getSubject(user) });
}

export async function removeDropboxSyncState(userId: string, folderPath: string) {
  const key = getSyncSettingKey(userId, normalizeDropboxFolderPath(folderPath));
  await cmsDb.delete(cmsSettings).where(eq(cmsSettings.key, key));
}

export function isAuthRequiredError(error: unknown) {
  return error instanceof UserAuthorizationRequiredError;
}

export { BATCH_SIZE };

export function getDropboxErrorMessage(error: unknown) {
  if (isDropboxAuthorizationRequired(error)) return 'Hubungkan akun Dropbox untuk mulai menyinkronkan folder.';
  return 'Dropbox tidak dapat diakses saat ini. Periksa otorisasi dan coba lagi.';
}

export async function getDropboxClientForAdmin(user: DropboxUser) {
  return getDropboxClient(user);
}

export async function clearDropboxCursorForUser(userId: string, folderPath: string) {
  await removeDropboxSyncState(userId, folderPath);
}

export async function getDropboxStatusForAdmin(user: DropboxUser) {
  return getDropboxConnectionStatus(user);
}

export async function listProductImageAssets(userId: string) {
  const { getProductImageAssetsForReview } = await import('@/lib/cms-db');
  return getProductImageAssetsForReview(userId, 50);
}

export async function getProductImageAssetSummary(userId: string) {
  const { getProductImageAssetStats } = await import('@/lib/cms-db');
  return getProductImageAssetStats(userId);
}

export async function saveProductImageRightsReview(userId: string, assetId: string, status: ProductImageReviewStatus, rightsBasis: string) {
  const { updateProductImageRightsReview } = await import('@/lib/cms-db');
  return updateProductImageRightsReview(userId, assetId, status, rightsBasis);
}

export async function getDropboxConsentUrl(user: DropboxUser) {
  return startDropboxAuthorization(user);
}

export async function syncDropboxBatch(user: DropboxUser, folderPath: string) {
  try {
    return await syncDropboxImageFolder(user, folderPath);
  } catch (error) {
    if (isDropboxAuthorizationRequired(error)) throw error;
    throw error;
  }
}

export async function getDropboxFolderDisplayPath(value: string) {
  return normalizeDropboxFolderPath(value) || '/';
}

export async function getProductImageIntelligenceOverview(userId: string) {
  const [assets, stats] = await Promise.all([
    listProductImageAssets(userId),
    getProductImageAssetSummary(userId),
  ]);
  return { assets, stats };
}

export class ProductImagePublicationWithdrawalError extends Error {
  constructor() {
    super('Status aset tersimpan, tetapi penghapusan salinan publik gagal. Simpan ulang tinjauan untuk mencoba lagi.');
    this.name = 'ProductImagePublicationWithdrawalError';
  }
}

export async function updateProductImageReview(userId: string, assetId: string, status: ProductImageReviewStatus, rightsBasis: string) {
  if (!isProductImageReviewStatus(status)) throw new Error('Status review tidak valid.');
  if (requiresRightsEvidence(status) && rightsBasis.trim().length < 20) {
    throw new Error('Catatan dasar hak penggunaan harus berisi minimal 20 karakter.');
  }

  const previousPublication = await saveProductImageRightsReview(userId, assetId, status, rightsBasis.trim().slice(0, 2000));
  if (!previousPublication) return false;
  if (requiresRightsEvidence(status) || !previousPublication.storagePath) return true;

  try {
    const retainedByAnotherApprovedAsset = await hasOtherApprovedProductImageAsset(userId, assetId, previousPublication.storagePath);
    if (!retainedByAnotherApprovedAsset) {
      if (previousPublication.productId) {
        await clearProductImageIfMatches(previousPublication.productId, previousPublication.storagePath);
      }
      await del(previousPublication.storagePath);
    }
    await clearProductImageAssetPublication(userId, assetId, previousPublication.storagePath);
  } catch {
    throw new ProductImagePublicationWithdrawalError();
  }
  return true;
}
