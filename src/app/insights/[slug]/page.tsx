import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowUpRight, Snowflake } from 'lucide-react';
import { getArticleBySlug } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel tidak ditemukan', robots: { index: false, follow: false } };
  const url = `/insights/${article.slug}`;
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.authorName],
      images: article.coverImage ? [{ url: article.coverImage, alt: article.title }] : undefined,
    },
    twitter: { card: article.coverImage ? 'summary_large_image' : 'summary', title: article.seoTitle || article.title, description: article.seoDescription || article.excerpt, images: article.coverImage ? [article.coverImage] : undefined },
  };
}

const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });
const siteUrl = 'https://www.juragankompresor.com';

export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const articleUrl = `${siteUrl}/insights/${article.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt,
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        author: { '@type': 'Organization', name: article.authorName },
        publisher: { '@type': 'Organization', name: 'PT Kompresa', url: siteUrl },
        mainEntityOfPage: articleUrl,
        image: article.coverImage ? [article.coverImage] : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Insight', item: `${siteUrl}/insights` },
          { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="border-b border-border bg-teal-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-xl bg-white/10"><Snowflake aria-hidden="true" className="size-5" /></span>Kompresa</Link><Link href="/insights" className="text-sm text-white/80 transition hover:text-white">Semua insight</Link></div>
      </header>
      <article>
        <header className="mx-auto max-w-4xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 transition hover:text-teal-950"><ArrowLeft aria-hidden="true" className="size-4" /> Kembali ke insight</Link>
          <p className="mt-9 text-sm font-medium text-teal-800">{article.publishedAt ? date.format(article.publishedAt) : 'Insight HVAC'}</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
          <p className="mt-6 text-sm text-muted-foreground">Ditulis oleh <span className="font-medium text-slate-900">{article.authorName}</span></p>
        </header>
        {article.coverImage ? <div className="relative mx-auto aspect-[16/8] max-h-[520px] max-w-6xl overflow-hidden bg-muted sm:rounded-3xl"><Image src={article.coverImage} alt={article.title} fill unoptimized priority sizes="100vw" className="object-cover" /></div> : null}
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="max-w-3xl text-[16px] leading-8 text-slate-700 [&_a]:font-medium [&_a]:text-teal-800 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-700 [&_blockquote]:pl-5 [&_blockquote]:italic [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-9 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-6 [&_strong]:font-semibold [&_strong]:text-slate-950 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6"><ReactMarkdown>{article.content}</ReactMarkdown></div>
          <aside className="h-fit rounded-2xl border border-border bg-[#f5faf9] p-5 lg:sticky lg:top-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Butuh konsultasi?</p><h2 className="mt-3 text-lg font-semibold">Diskusikan kebutuhan sistem pendingin Anda.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Tim kami siap membantu menemukan solusi HVAC yang tepat.</p><Link href="/#kontak" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Hubungi tim kami <ArrowUpRight aria-hidden="true" className="size-4" /></Link></aside>
        </div>
      </article>
      <footer className="border-t border-border bg-[#f7faf9]"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-7 text-sm sm:px-8"><Link href="/" className="font-medium">PT Kompresa</Link><Link href="/insights" className="text-muted-foreground hover:text-teal-800">Jelajahi insight lainnya</Link></div></footer>
    </main>
  );
}
