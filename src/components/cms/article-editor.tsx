'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { saveArticleAction, type ArticleActionState } from '@/app/admin/actions';
import type { CmsArticle } from '@/lib/cms-db';

const initialState: ArticleActionState = {};

export function ArticleEditor({ article }: { article?: CmsArticle | null }) {
  const [state, formAction, pending] = useActionState(saveArticleAction, initialState);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <input type="hidden" name="id" value={article?.id ?? ''} />
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Konten utama</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Tulis insight HVAC</h2>
            <p className="mt-1 text-sm text-muted-foreground">Gunakan Markdown sederhana untuk heading, tautan, daftar, dan penekanan teks.</p>
          </div>
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Judul artikel
              <input name="title" required minLength={5} maxLength={180} defaultValue={article?.title ?? ''} placeholder="Contoh: Cara memilih kapasitas AC untuk ruang komersial" className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Slug URL
              <input name="slug" maxLength={120} defaultValue={article?.slug ?? ''} placeholder="cara-memilih-kapasitas-ac" className="h-11 rounded-xl border border-input bg-background px-4 font-mono text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
              <span className="text-xs font-normal text-muted-foreground">URL publik: /insights/slug-artikel. Kosongkan agar dibuat dari judul.</span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Ringkasan artikel
              <textarea name="excerpt" required minLength={20} maxLength={320} rows={3} defaultValue={article?.excerpt ?? ''} placeholder="Ringkasan yang menjelaskan manfaat artikel dan tampil di halaman insight." className="resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Isi artikel
              <textarea name="content" required minLength={40} rows={18} defaultValue={article?.content ?? ''} placeholder={'## Mulai dari kebutuhan ruang\n\nJelaskan prinsip utama dengan bahasa yang mudah dipahami.\n\n- Pertimbangkan luas ruangan\n- Perhatikan paparan panas'} className="resize-y rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-7 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Optimasi pencarian</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Metadata SEO</h2>
          </div>
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Judul SEO
              <input name="seoTitle" maxLength={70} defaultValue={article?.seoTitle ?? ''} placeholder="Judul yang tampil pada hasil pencarian" className="h-11 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
              <span className="text-xs font-normal text-muted-foreground">Maksimal 70 karakter; otomatis memakai judul artikel jika kosong.</span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Deskripsi SEO
              <textarea name="seoDescription" maxLength={170} rows={3} defaultValue={article?.seoDescription ?? ''} placeholder="Deskripsi singkat artikel untuk hasil pencarian Google." className="resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
              <span className="text-xs font-normal text-muted-foreground">40–170 karakter untuk artikel yang diterbitkan.</span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              URL gambar sampul
              <input type="url" name="coverImage" maxLength={2048} defaultValue={article?.coverImage ?? ''} placeholder="https://…" className="h-11 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
              <span className="text-xs font-normal text-muted-foreground">Opsional. Gunakan URL gambar yang dapat diakses publik.</span>
            </label>
          </div>
        </section>
      </div>
      <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Publikasi</p>
          <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
            Status artikel
            <select name="status" defaultValue={article?.status ?? 'draft'} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="draft">Draft — belum publik</option>
              <option value="published">Terbitkan sekarang</option>
            </select>
          </label>
          <div className="mt-5 flex flex-col gap-3">
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
              {pending ? 'Menyimpan…' : article ? 'Simpan perubahan' : 'Simpan artikel'}
            </button>
            <Link href="/admin/articles" className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted">Kembali ke artikel</Link>
          </div>
          {state.error ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{state.error}</p> : null}
        </section>
        {article ? (
          <section className="rounded-2xl border border-border bg-muted/50 p-5 text-sm">
            <p className="font-semibold">Riwayat artikel</p>
            <p className="mt-3 text-muted-foreground">Dibuat {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(article.createdAt)}</p>
            <p className="mt-1 text-muted-foreground">Diperbarui {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(article.updatedAt)}</p>
            {article.status === 'published' ? <Link href={`/insights/${article.slug}`} target="_blank" className="mt-4 inline-flex font-medium text-teal-800 underline underline-offset-4">Lihat artikel publik</Link> : null}
          </section>
        ) : null}
      </aside>
    </form>
  );
}
