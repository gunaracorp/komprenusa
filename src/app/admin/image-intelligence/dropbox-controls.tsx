'use client';

import { useState, useTransition } from 'react';
import { startDropboxAuthorizationAction } from './actions';

type Props = {
  status: 'connected' | 'authorization-required' | 'unavailable';
};

export function DropboxControls({ status }: Props) {
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function connect() {
    setConsentUrl(null);
    setError(null);
    startTransition(async () => {
      const result = await startDropboxAuthorizationAction();
      if (result.url) setConsentUrl(result.url);
      else setError(result.error ?? 'Otorisasi Dropbox belum dapat dimulai.');
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {status === 'connected' ? (
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900">
          <span aria-hidden="true" className="size-2 rounded-full bg-emerald-600" /> Akun Dropbox terhubung
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {status === 'authorization-required'
              ? 'Hubungkan Dropbox pribadi Anda untuk membaca daftar aset.'
              : 'Konektor belum dapat diakses. Otorisasi ulang atau periksa koneksi proyek.'}
          </p>
          <button
            type="button"
            onClick={connect}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? 'Menyiapkan koneksi…' : 'Hubungkan Dropbox'}
          </button>
          {consentUrl ? (
            <a
              href={consentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-teal-800 underline underline-offset-4"
            >
              Lanjutkan otorisasi Dropbox di tab baru
            </a>
          ) : null}
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        </>
      )}
    </div>
  );
}
