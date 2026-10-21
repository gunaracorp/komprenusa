'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, CloudUpload, ExternalLink, LoaderCircle, ShieldCheck } from 'lucide-react';
import { startDropboxAuthorizationAction } from '@/app/admin/image-intelligence/actions';
import { createCmsDropboxBackupAction, type CreateCmsDropboxBackupResult } from './actions';

type Props = {
  status: 'connected' | 'authorization-required' | 'unavailable';
};

const number = new Intl.NumberFormat('id-ID');
const bytes = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

function formatBytes(size: number) {
  if (size < 1024) return `${number.format(size)} byte`;
  if (size < 1024 * 1024) return `${bytes.format(size / 1024)} KB`;
  return `${bytes.format(size / (1024 * 1024))} MB`;
}

export function BackupControls({ status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<CreateCmsDropboxBackupResult | { ok: false; error: string } | null>(null);

  function connectDropbox() {
    setFeedback(null);
    setConsentUrl(null);
    startTransition(async () => {
      const result = await startDropboxAuthorizationAction();
      if (!result.url) {
        setFeedback({ ok: false, error: result.error ?? 'Otorisasi Dropbox belum dapat dimulai.' });
        return;
      }

      setConsentUrl(result.url);
      if (window.self !== window.top) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = result.url;
      }
    });
  }

  function createBackup() {
    setFeedback(null);
    startTransition(async () => {
      const result = await createCmsDropboxBackupAction();
      setFeedback(result);
      if (result.ok) router.refresh();
    });
  }

  return (
    <section aria-labelledby="backup-action-title" className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-900"><Archive aria-hidden="true" className="size-5" /></span>
          <div>
            <h2 id="backup-action-title" className="font-semibold">Snapshot database CMS</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Membuat salinan konsisten dari tabel CMS, mengompresnya, lalu memverifikasi hash file setelah diunggah ke Dropbox.</p>
          </div>
        </div>
        {status === 'connected' ? (
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"><span aria-hidden="true" className="size-2 rounded-full bg-emerald-600" /> Dropbox siap</span>
        ) : null}
      </div>

      {status !== 'connected' ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-950">
            {status === 'authorization-required'
              ? 'Dropbox perlu dihubungkan ulang agar CMS memperoleh izin membaca dan mengunggah cadangan.'
              : 'Konektor Dropbox belum dapat diakses. Coba otorisasi ulang setelah koneksi proyek pulih.'}
          </p>
          <button type="button" onClick={connectDropbox} disabled={pending} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
            {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <CloudUpload aria-hidden="true" className="size-4" />}
            {pending ? 'Menyiapkan otorisasi…' : 'Hubungkan Dropbox'}
          </button>
          {consentUrl ? (
            <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <a href={consentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-900 underline underline-offset-4">Buka izin Dropbox <ExternalLink aria-hidden="true" className="size-3.5" /></a>
              <button type="button" onClick={() => router.refresh()} className="text-sm font-medium text-teal-900 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">Saya sudah menyetujui, periksa lagi</button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={createBackup} disabled={pending} aria-busy={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
            {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <CloudUpload aria-hidden="true" className="size-4" />}
            {pending ? 'Membuat dan memverifikasi…' : 'Buat backup sekarang'}
          </button>
          <p className="text-xs leading-5 text-muted-foreground">Proses ini manual; tidak ada jadwal otomatis atau layanan baru yang diaktifkan.</p>
        </div>
      )}

      {feedback ? (
        feedback.ok ? (
          <div role="status" aria-live="polite" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="flex items-center gap-2 font-semibold"><CheckCircle2 aria-hidden="true" className="size-4 shrink-0" /> Backup terunggah dan hash Dropbox cocok.</p>
            <p className="mt-2 break-all font-mono text-xs">{feedback.backup.fileName}</p>
            <p className="mt-2 text-xs">{number.format(feedback.backup.tableCount)} tabel · {number.format(feedback.backup.rowCount)} baris · {formatBytes(feedback.backup.sizeBytes)}</p>
          </div>
        ) : (
          <p role="alert" aria-live="assertive" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{feedback.error}</p>
        )
      ) : null}

      <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-800" />
        <p>Hanya admin yang masuk dapat memulai backup. Token Dropbox tetap di server dan identitas konektor berasal dari sesi admin, bukan input browser.</p>
      </div>
    </section>
  );
}
