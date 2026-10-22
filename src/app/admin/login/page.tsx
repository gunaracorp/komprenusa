import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Snowflake } from 'lucide-react';
import { AdminLoginForm } from '@/components/cms/admin-login-form';
import { authConfigured, getAdminUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login CMS',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [user, params] = await Promise.all([getAdminUser(), searchParams]);
  if (user) redirect('/admin');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5faf9] px-4 py-12">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-700" />
      <div aria-hidden="true" className="absolute -left-24 top-36 size-72 rounded-full bg-teal-500/20 blur-3xl" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white p-7 shadow-[0_32px_100px_-48px_rgba(4,47,46,0.45)] sm:p-9">
        <Link href="/" className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-teal-800">
          <ArrowLeft aria-hidden="true" className="size-4" /> Kembali ke website
        </Link>
        <div className="mb-7 flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
          <Snowflake aria-hidden="true" className="size-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">KompresNusa</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Masuk ke CMS</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Kelola insight, artikel, dan metadata website melalui satu workspace.</p>
        <div className="mt-8">
          {authConfigured() ? (
            <AdminLoginForm accessError={params.error === 'access'} />
          ) : (
            <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Login admin belum dikonfigurasi. Hubungi pengelola website untuk mengaktifkan Neon Auth dan email admin.
            </div>
          )}
        </div>
        <div className="mt-7 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-teal-700" /> Akses terbatas untuk admin terotorisasi.
        </div>
      </section>
    </main>
  );
}
