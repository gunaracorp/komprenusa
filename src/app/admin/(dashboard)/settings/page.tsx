import type { Metadata } from 'next';
import { CheckCircle2, SearchCheck } from 'lucide-react';
import { saveSiteSettingsAction } from '@/app/admin/actions';
import { getAdminSettings } from '@/lib/cms-db';

export const metadata: Metadata = { title: 'SEO Website', robots: { index: false, follow: false } };

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [settings, params] = await Promise.all([getAdminSettings(), searchParams]);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-7">
      <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Pengaturan website</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">SEO website</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Perbarui judul dan deskripsi utama yang digunakan mesin pencari untuk memahami website.</p></header>
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><SearchCheck aria-hidden="true" className="size-5" /></span><div><h2 className="font-semibold">Identitas hasil pencarian</h2><p className="mt-1 text-sm text-muted-foreground">Perubahan diterapkan ke metadata halaman utama.</p></div></div>
        {params.saved === '1' ? <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 aria-hidden="true" className="size-4" /> Pengaturan SEO berhasil disimpan.</p> : null}
        {params.error === 'validation' ? <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Judul minimal 5 karakter dan deskripsi minimal 40 karakter.</p> : null}
        <form action={saveSiteSettingsAction} className="mt-6 flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-medium">Judul website<input name="siteTitle" required minLength={5} maxLength={90} defaultValue={settings.siteTitle} className="h-12 rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" /><span className="text-xs font-normal text-muted-foreground">Nama utama yang muncul di tab browser dan hasil pencarian.</span></label>
          <label className="flex flex-col gap-2 text-sm font-medium">Deskripsi website<textarea name="siteDescription" required minLength={40} maxLength={180} rows={4} defaultValue={settings.siteDescription} className="resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" /><span className="text-xs font-normal text-muted-foreground">Gunakan 40–180 karakter. Jelaskan layanan dan cakupan bisnis secara spesifik.</span></label>
          <div><button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-900 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Simpan pengaturan</button></div>
        </form>
      </section>
    </div>
  );
}
