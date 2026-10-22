import { AlertTriangle, Archive, Database, FileText } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { CMS_BACKUP_PUBLIC_TABLES } from '@/lib/cms-db';
import { getCmsDropboxBackupHistory } from '@/lib/cms-dropbox-backups';
import { getDropboxStatusForAdmin } from '@/lib/product-image-intelligence';
import { BackupControls } from './backup-controls';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cadangan CMS', robots: { index: false, follow: false } };

const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
const number = new Intl.NumberFormat('id-ID');

export default async function AdminBackupsPage() {
  const user = await requireAdmin();
  if (!user) redirect('/admin/login');

  const status = await getDropboxStatusForAdmin({ id: user.id });
  let backups: Awaited<ReturnType<typeof getCmsDropboxBackupHistory>> = [];
  let historyUnavailable = false;

  if (status === 'connected') {
    try {
      backups = await getCmsDropboxBackupHistory({ id: user.id });
    } catch {
      historyUnavailable = true;
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Keamanan dan pemulihan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cadangan CMS</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Simpan snapshot database CMS ke akun Dropbox yang sudah terhubung melalui konektor digiman.</p>
      </header>

      <BackupControls status={status} />

      <section aria-labelledby="backup-history-title" className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-5 py-5 sm:px-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Archive aria-hidden="true" className="size-4" /></span>
          <div>
            <h2 id="backup-history-title" className="font-semibold">Riwayat file backup</h2>
            <p className="mt-1 text-sm text-muted-foreground">Lokasi Dropbox: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/Kompresa-Kompresor-CMS-Backups</code></p>
          </div>
        </div>

        {historyUnavailable ? (
          <div role="status" className="flex gap-3 px-5 py-8 text-sm text-amber-900 sm:px-6"><AlertTriangle aria-hidden="true" className="size-5 shrink-0" /><p>Dropbox sedang tidak dapat menampilkan riwayat. Data CMS tidak diubah; coba muat ulang setelah koneksi pulih.</p></div>
        ) : backups.length ? (
          <ul className="divide-y divide-border">
            {backups.map((backup) => (
              <li key={backup.fileName} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="flex min-w-0 items-start gap-3"><FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-800" /><span className="min-w-0"><span className="block break-all text-sm font-medium">{backup.fileName}</span><time className="mt-1 block text-xs text-muted-foreground" dateTime={backup.modifiedAt}>{date.format(new Date(backup.modifiedAt))}</time></span></span>
                <span className="shrink-0 pl-7 text-xs text-muted-foreground sm:pl-0">{number.format(backup.sizeBytes)} byte</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center sm:px-6"><Database aria-hidden="true" className="mx-auto size-7 text-slate-500" /><p className="mt-3 text-sm font-medium">Belum ada file backup</p><p className="mt-1 text-sm text-muted-foreground">Setelah Dropbox diotorisasi, buat snapshot pertama dari panel di atas.</p></div>
        )}
      </section>

      <section aria-labelledby="backup-scope-title" className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2"><Database aria-hidden="true" className="size-4 text-teal-800" /><h2 id="backup-scope-title" className="font-semibold">Isi snapshot database</h2></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Snapshot konsisten transaksi ini mencakup {CMS_BACKUP_PUBLIC_TABLES.length} tabel pada skema <code>public</code>; tabel autentikasi <code>neon_auth</code> sengaja tidak disalin ke Dropbox.</p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Format JSON terkompresi menyimpan data, kolom, primary key, jumlah baris, dan versi format. Jika ada tabel publik baru, backup berhenti sampai cakupannya ditinjau.</p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-amber-950"><AlertTriangle aria-hidden="true" className="size-4" /><h2 className="font-semibold">Catatan file media</h2></div>
          <p className="mt-2 text-sm leading-6 text-amber-950">Snapshot menyimpan URL dan metadata gambar, bukan isi biner gambar Vercel Blob. Foto sumber yang sudah ada di Dropbox tetap di sana; file turunan Blob dan gambar dari URL eksternal perlu migrasi media terpisah sebelum pindah host.</p>
        </article>
      </section>

      <p className="text-xs leading-5 text-muted-foreground">Backup saat ini dijalankan manual. Pemulihan belum otomatis dan belum diuji pada database staging; jangan mengimpor snapshot langsung ke database produksi tanpa uji pemulihan terisolasi.</p>
    </div>
  );
}
