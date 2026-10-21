import Link from 'next/link';
import { ArrowUpRight, FilePlus2, FileText, Globe2, Package, Settings2 } from 'lucide-react';
import { getCmsDashboardData } from '@/lib/cms-db';

export const metadata = { title: 'Ringkasan CMS', robots: { index: false, follow: false } };

const number = new Intl.NumberFormat('id-ID');
const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

export default async function AdminDashboardPage() {
  const { counts, articles } = await getCmsDashboardData();
  const stats = [
    { label: 'Semua artikel', value: counts.articleCount, icon: FileText, note: 'Draft dan terbit' },
    { label: 'Artikel terbit', value: counts.publishedCount, icon: Globe2, note: 'Tampil untuk publik' },
    { label: 'Produk katalog', value: counts.productCount, icon: Package, note: 'Terhubung ke website' },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Pusat kendali editorial</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ringkasan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Kelola konten dan optimasi pencarian website Juragan Kompresor.</p>
        </div>
        <Link href="/admin/articles/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"><FilePlus2 aria-hidden="true" className="size-4" /> Tulis artikel</Link>
      </header>

      <section aria-label="Statistik CMS" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <article key={label} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-sm font-medium text-muted-foreground">{label}</p><span className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Icon aria-hidden="true" className="size-4" /></span></div>
            <p className="mt-5 text-3xl font-semibold tracking-tight">{number.format(value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><h2 className="font-semibold">Aktivitas artikel</h2><p className="mt-1 text-sm text-muted-foreground">Perubahan konten terbaru.</p></div>
          <Link href="/admin/articles" className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-950">Semua artikel <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
        {articles.length ? (
          <div className="divide-y divide-border">
            {articles.map((article) => (
              <Link key={article.id} href={`/admin/articles/${article.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{article.title || 'Tanpa judul'}</span><span className="mt-1 block truncate text-xs text-muted-foreground">/insights/{article.slug}</span></span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground"><span className={`rounded-full px-2.5 py-1 font-medium ${article.status === 'published' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{article.status === 'published' ? 'Terbit' : 'Draft'}</span><time dateTime={article.updatedAt.toISOString()}>{date.format(article.updatedAt)}</time></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center"><FileText aria-hidden="true" className="mx-auto size-8 text-teal-700" /><p className="mt-3 font-medium">Belum ada artikel</p><p className="mt-1 text-sm text-muted-foreground">Mulai dengan membuat insight pertama untuk pelanggan.</p><Link href="/admin/articles/new" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Buat artikel pertama <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>
        )}
      </section>
      <Link href="/admin/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-800"><Settings2 aria-hidden="true" className="size-4" /> Perbarui judul dan deskripsi SEO website</Link>
    </div>
  );
}
