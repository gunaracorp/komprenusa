'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/auth';
import { createCmsDropboxBackup, CmsDropboxBackupError } from '@/lib/cms-dropbox-backups';
import { isAuthRequiredError } from '@/lib/product-image-intelligence';

export type CreateCmsDropboxBackupResult =
  | { ok: true; backup: Awaited<ReturnType<typeof createCmsDropboxBackup>> }
  | { ok: false; error: string };

export async function createCmsDropboxBackupAction(): Promise<CreateCmsDropboxBackupResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: 'Sesi admin berakhir. Silakan masuk kembali.' };

  try {
    const backup = await createCmsDropboxBackup({ id: user.id });
    revalidatePath('/admin/backups');
    return { ok: true, backup };
  } catch (error) {
    if (isAuthRequiredError(error)) {
      return { ok: false, error: 'Akun Dropbox belum memberi izin tulis. Hubungkan ulang Dropbox, lalu coba lagi.' };
    }
    if (error instanceof CmsDropboxBackupError) return { ok: false, error: error.message };
    console.error('[v0] CMS Dropbox backup failed');
    return { ok: false, error: 'Cadangan gagal dibuat. Data database belum dinyatakan tersimpan di Dropbox; coba lagi setelah koneksi pulih.' };
  }
}
