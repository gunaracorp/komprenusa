import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { deleteArticleAction } from '@/app/admin/actions';
import { ArticleEditor } from '@/components/cms/article-editor';
import { getAdminArticle } from '@/lib/cms-db';

export const metadata: Metadata = { title: 'Edit Artikel', robots: { index: false, follow: false } };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getAdminArticle(id);
  if (!article) notFound();
  return <div className="mx-auto flex max-w-7xl flex-col gap-7"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Konten editorial</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit artikel</h1><p className="mt-2 text-sm text-muted-foreground">Perbarui isi, publikasi, dan metadata artikel.</p></div><form action={deleteArticleAction}><input type="hidden" name="id" value={article.id} /><button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/30 px-4 text-sm font-medium text-destructive transition hover:bg-destructive/5">Hapus artikel</button></form></header><ArticleEditor article={article} /></div>;
}
