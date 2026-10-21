'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { processNextProductImageBatch } from '@/lib/product-image-processing';
import {
  ProductImagePublicationWithdrawalError,
  disconnectDropbox,
  getDropboxConsentUrl,
  isProductImageReviewStatus,
  normalizeDropboxFolderPath,
  syncDropboxBatch,
  updateProductImageReview,
} from '@/lib/product-image-intelligence';

const PAGE_PATH = '/admin/image-intelligence';

export async function startDropboxAuthorizationAction() {
  const user = await getAdminUser();
  if (!user) return { error: 'Sesi admin berakhir. Silakan masuk kembali.' };

  try {
    const url = await getDropboxConsentUrl({ id: user.id });
    return { url };
  } catch {
    return { error: 'Dropbox belum siap untuk otorisasi. Coba lagi sebentar.' };
  }
}

export async function syncDropboxBatchAction(formData: FormData) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const rawPath = formData.get('folderPath');
  const folderPath = typeof rawPath === 'string' ? rawPath.slice(0, 500) : '';
  let result: Awaited<ReturnType<typeof syncDropboxBatch>>;
  try {
    result = await syncDropboxBatch({ id: user.id }, folderPath);
  } catch {
    redirect(`${PAGE_PATH}?error=sync&folder=${encodeURIComponent(folderPath || '/')}`);
  }

  revalidatePath(PAGE_PATH);
  redirect(`${PAGE_PATH}?synced=1&hasMore=${result.hasMore ? '1' : '0'}&scanned=${result.pageEntries}&images=${result.imagesDiscovered}&folder=${encodeURIComponent(folderPath || '/')}`);
}

export async function saveProductImageReviewAction(formData: FormData) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const assetId = formData.get('assetId');
  const rawStatus = formData.get('status');
  const rawRightsBasis = formData.get('rightsBasis');
  const rawFolder = formData.get('folderPath');
  const folderPath = typeof rawFolder === 'string' ? rawFolder.slice(0, 500) : '/';
  if (typeof assetId !== 'string' || assetId.length > 120 || typeof rawStatus !== 'string' || !isProductImageReviewStatus(rawStatus)) {
    redirect(`${PAGE_PATH}?error=review`);
  }

  try {
    normalizeDropboxFolderPath(folderPath);
    const saved = await updateProductImageReview(
      user.id,
      assetId,
      rawStatus,
      typeof rawRightsBasis === 'string' ? rawRightsBasis.slice(0, 2000) : '',
    );
    if (!saved) redirect(`${PAGE_PATH}?error=review&folder=${encodeURIComponent(folderPath)}`);
  } catch (error) {
    if (error instanceof ProductImagePublicationWithdrawalError) {
      redirect(`${PAGE_PATH}?error=withdraw&folder=${encodeURIComponent(folderPath)}`);
    }
    redirect(`${PAGE_PATH}?error=review&folder=${encodeURIComponent(folderPath)}`);
  }

  revalidatePath(PAGE_PATH);
  revalidatePath('/');
  revalidatePath('/produk');
  revalidatePath('/produk/[slug]', 'page');
  redirect(`${PAGE_PATH}?reviewed=1&folder=${encodeURIComponent(folderPath)}`);
}

export async function processProductImageBatchAction(formData: FormData) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const retryFailed = formData.get('retryFailed') === '1';
  let result: Awaited<ReturnType<typeof processNextProductImageBatch>>;
  try {
    result = await processNextProductImageBatch(user.id, retryFailed);
  } catch {
    redirect(`${PAGE_PATH}?error=process`);
  }

  revalidatePath(PAGE_PATH);
  revalidatePath('/');
  revalidatePath('/produk');
  revalidatePath('/produk/[slug]', 'page');
  const query = new URLSearchParams({
    processed: '1',
    attempted: String(result.attempted),
    completed: String(result.processed),
    duplicates: String(result.duplicates),
    failed: String(result.failed),
    invalid: String(result.invalid),
    remaining: String(result.remaining),
  });
  redirect(`${PAGE_PATH}?${query.toString()}`);
}

export async function disconnectDropboxAction() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  try {
    await disconnectDropbox({ id: user.id });
  } catch {
    redirect(`${PAGE_PATH}?error=disconnect`);
  }
  revalidatePath(PAGE_PATH);
  redirect(`${PAGE_PATH}?disconnected=1`);
}
