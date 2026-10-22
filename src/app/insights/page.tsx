import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Snowflake } from 'lucide-react';
import { getPublishedArticles } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Insight HVAC dan Pendingin Udara',
  description: 'Panduan praktis HVAC, pendingin udara, refrigerasi, dan pemilihan produk dari tim KompresNusa.',
  alternates: { canonical: '/insights' },
  openGraph: { type: 'website', title: 'Insight HVAC | KompresNusa', description: 'Panduan praktis HVAC dan sistem pendingin dari tim KompresNusa.' },
};

const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });

export default async function InsightsPage() {
  const articles = await getPublishedArticles();
  const [featured, ...rest] = articles;

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <header className="border-b border-white/10 bg-teal-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-2.5 font-semibold tracking-tight"><Image src="/images/logo.svg" alt="Logo KompresNusa" width={36} height={36} unoptimized className="rounded-xl shadow-md shadow-black/20 ring-1 ring-white/20 transition duration-300 group-hover:ring-amber-400/70" /><span className="font-extrabold tracking-tight">KOMPRESNUSA <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent">KOMPRESOR</span></span></Link>
          <nav aria-label="Navigasi insight" className="flex items-center gap-4 text-sm"><Link href="/" className="text-white/75 transition hover:text-white">Beranda</Link><Link href="/admin/login" className="rounded-lg border border-white/20 px-3 py-2 font-medium text-white transition hover:bg-white/10">Admin</Link></nav>
        </div>
      </header>
      <section className="relative overflow-hidden bg-teal-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.23),transparent_44%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:py-24">
          <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200"><BookOpen aria-hidden="true" className="size-4" /> Pusat pengetahuan HVAC</p><h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Insight untuk sistem pendingin yang lebih andal.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-teal-50/80">Panduan teknis, wawasan produk, dan praktik terbaik untuk membantu setiap keputusan HVAC.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"><p className="text-sm font-medium text-teal-100">Dari praktisi untuk praktisi</p><p className="mt-2 text-sm leading-6 text-white/70">Informasi yang jelas untuk kontraktor, teknisi, tim pengadaan, dan pemilik usaha.</p><Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 hover:text-white">Kenali layanan kami <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        {featured ? <div className="grid overflow-hidden rounded-3xl border border-border bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <Link href={`/insights/${featured.slug}`} className="group relative min-h-64 overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-700 lg:min-h-[390px]">
            {featured.coverImage ? <Image src={featured.coverImage} alt="" fill unoptimized sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" /> : <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(153,246,228,0.35),transparent_24%),linear-gradient(135deg,transparent,rgba(4,47,46,0.58))]" />}
            <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">Artikel pilihan</span>
          </Link>
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12"><p className="text-sm font-medium text-teal-800">{featured.publishedAt ? date.format(featured.publishedAt) : 'Insight terbaru'}</p><Link href={`/insights/${featured.slug}`} className="mt-4 text-2xl font-semibold leading-tight tracking-tight transition hover:text-teal-800 sm:text-3xl">{featured.title}</Link><p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground">{featured.excerpt}</p><div className="mt-7 text-xs text-muted-foreground">Oleh {featured.authorName}</div><Link href={`/insights/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">Baca artikel <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
        </div> : null}
        {rest.length ? <div className="mt-14"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Perluas wawasan</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Artikel terbaru</h2></div><span className="text-sm text-muted-foreground">{articles.length} artikel</span></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{rest.map((article) => <article key={article.id} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Link href={`/insights/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-teal-900 to-emerald-700">{article.coverImage ? <Image src={article.coverImage} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(153,246,228,0.3),transparent_28%)]" />}</Link><div className="p-5"><p className="text-xs font-medium text-teal-800">{article.publishedAt ? date.format(article.publishedAt) : 'Insight'}</p><Link href={`/insights/${article.slug}`} className="mt-3 block text-lg font-semibold leading-snug tracking-tight group-hover:text-teal-800">{article.title}</Link><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p><Link href={`/insights/${article.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Baca selengkapnya <ArrowRight aria-hidden="true" className="size-4" /></Link></div></article>)}</div></div> : null}
        {!articles.length ? <div className="rounded-3xl border border-dashed border-teal-900/20 bg-white px-6 py-16 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><BookOpen aria-hidden="true" className="size-6" /></span><h2 className="mt-5 text-xl font-semibold">Insight baru sedang disiapkan</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Kunjungi kembali untuk membaca panduan produk, HVAC, dan sistem pendingin dari tim kami.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Kembali ke beranda <ArrowRight aria-hidden="true" className="size-4" /></Link></div> : null}
      </section>
      <footer className="border-t border-border bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link href="/" className="font-medium text-slate-900">PT KompresNusa</Link><p>Informasi HVAC dan pendingin udara dari tim kami.</p><Link href="/admin/login" className="hover:text-teal-800">Masuk admin</Link></div></footer>
    </main>
  );
}
