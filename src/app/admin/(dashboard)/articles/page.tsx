import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FilePlus2, FileText } from 'lucide-react';
import { getAdminArticles } from '@/lib/cms-db';

export const metadata: Metadata = { title: 'Artikel CMS', robots: { index: false, follow: false } };

const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Konten editorial</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Artikel</h1><p className="mt-2 text-sm text-muted-foreground">Tulis, optimalkan, dan publikasikan insight HVAC.</p></div>
        <Link href="/admin/articles/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"><FilePlus2 aria-hidden="true" className="size-4" /> Artikel baru</Link>
      </header>
      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6"><p className="text-sm font-medium">{articles.length} artikel</p><span className="text-xs text-muted-foreground">Diurutkan berdasarkan pembaruan</span></div>
        {articles.length ? <div className="divide-y divide-border">
          {articles.map((article) => <Link key={article.id} href={`/admin/articles/${article.id}`} className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="min-w-0"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{article.title}</span><ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" /></span><span className="mt-1 block truncate text-xs text-muted-foreground">/insights/{article.slug}</span><span className="mt-2 block line-clamp-1 text-sm text-muted-foreground">{article.excerpt}</span></span>
            <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground"><span className={`rounded-full px-2.5 py-1 font-medium ${article.status === 'published' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{article.status === 'published' ? 'Terbit' : 'Draft'}</span><time dateTime={article.updatedAt.toISOString()}>{date.format(article.updatedAt)}</time></span>
          </Link>)}
        </div> : <div className="px-6 py-16 text-center"><FileText aria-hidden="true" className="mx-auto size-9 text-teal-700" /><h2 className="mt-4 font-semibold">Belum ada artikel editorial</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Artikel yang disimpan sebagai draft tetap privat sampai siap diterbitkan.</p><Link href="/admin/articles/new" className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white hover:bg-teal-800"><FilePlus2 aria-hidden="true" className="size-4" /> Tulis artikel pertama</Link></div>}
      </section>
    </div>
  );
}
