import type { Metadata } from 'next';
import { ArticleEditor } from '@/components/cms/article-editor';

export const metadata: Metadata = { title: 'Artikel Baru', robots: { index: false, follow: false } };

export default function NewArticlePage() {
  return <div className="mx-auto flex max-w-7xl flex-col gap-7"><header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Konten editorial</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Artikel baru</h1><p className="mt-2 text-sm text-muted-foreground">Susun insight yang berguna dan mudah ditemukan pelanggan.</p></header><ArticleEditor /></div>;
}
