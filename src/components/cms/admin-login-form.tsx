'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInAction } from '@/lib/auth-actions';

export function AdminLoginForm({ accessError = false }: { accessError?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(accessError ? 'Akun ini tidak memiliki akses ke workspace admin.' : '');

  async function submit(formData: FormData) {
    setPending(true);
    setError('');
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const result = await signInAction(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Login belum dapat diproses. Silakan coba kembali.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Email admin
        <input name="email" type="email" autoComplete="username" required className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" placeholder="nama@perusahaan.co.id" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Kata sandi
        <input name="password" type="password" autoComplete="current-password" minLength={8} required className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" placeholder="Masukkan kata sandi" />
      </label>
      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center rounded-xl bg-teal-800 px-4 font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
        {pending ? 'Memverifikasi…' : 'Masuk ke CMS'}
      </button>
    </form>
  );
}
