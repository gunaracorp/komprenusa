import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink, PackageSearch, Search } from 'lucide-react';
import { getAdminProductsPage } from '@/lib/cms-db';
import { Input } from '@/components/ui/input';

export const metadata = { title: 'Produk katalog', robots: { index: false, follow: false } };

const PAGE_SIZE = 24;
const number = new Intl.NumberFormat('id-ID');
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
type PageProps = { searchParams: Promise<{ q?: string; page?: string; error?: string }> };

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim().slice(0, 100);
  const requestedPage = Number(params.page || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { products, total } = await getAdminProductsPage(query, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    next.set('page', String(targetPage));
    return `/admin/products?${next.toString()}`;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">CMS katalog</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Produk kompresor</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Kelola deskripsi, harga penawaran, visibilitas, dan foto. Harga 0 berarti belum ditetapkan dan ditampilkan sebagai permintaan penawaran.</p>
        </div>
        <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm">
          <span className="font-semibold">{number.format(total)}</span><span className="ml-1 text-muted-foreground">produk</span>
        </div>
      </header>

      {params.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Produk tidak ditemukan atau perubahan belum valid. Periksa kembali data produk.</p>}

      <form action="/admin/products" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="catalog-search">Cari model, merek, atau nama produk</label>
        <Input id="catalog-search" name="q" type="search" defaultValue={query} placeholder="Cari model, merek, atau nama produk" className="h-11 max-w-xl bg-white" />
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"><Search aria-hidden="true" className="size-4" /> Cari</button>
      </form>

      {products.length ? (
        <section aria-label="Daftar produk" className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="divide-y divide-border">
            {products.map(({ product, categoryName }) => (
              <article key={product.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                    {product.images ? <img src={product.images} alt="" className="size-full object-contain" /> : <PackageSearch aria-hidden="true" className="size-6 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{product.name}</h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{product.brand || 'Tanpa merek'}{product.model ? ` · ${product.model}` : ''} · {categoryName || 'Tanpa kategori'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2.5 py-1 font-medium ${product.inStock ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{product.inStock ? 'Tayang di katalog' : 'Disembunyikan'}</span>
                      <span className="text-muted-foreground">{product.price > 0 ? currency.format(product.price) : 'Harga melalui penawaran'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link href={`/produk/${product.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-teal-800"><ExternalLink aria-hidden="true" className="size-3.5" /> Lihat publik</Link>
                  <Link href={`/admin/products/${product.id}`} className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold transition hover:bg-muted">Kelola</Link>
                </div>
              </article>
            ))}
          </div>
          <nav aria-label="Halaman produk" className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
            <span className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-2">
              {page > 1 ? <Link href={pageHref(page - 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm hover:bg-muted"><ArrowLeft aria-hidden="true" className="size-4" /> Sebelumnya</Link> : <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground opacity-50"><ArrowLeft aria-hidden="true" className="size-4" /> Sebelumnya</span>}
              {page < totalPages ? <Link href={pageHref(page + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm hover:bg-muted">Berikutnya <ArrowRight aria-hidden="true" className="size-4" /></Link> : <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground opacity-50">Berikutnya <ArrowRight aria-hidden="true" className="size-4" /></span>}
            </div>
          </nav>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <PackageSearch aria-hidden="true" className="mx-auto size-9 text-teal-700" />
          <h2 className="mt-3 font-semibold">Produk tidak ditemukan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Coba kata kunci model atau merek yang berbeda.</p>
        </section>
      )}
    </div>
  );
}
