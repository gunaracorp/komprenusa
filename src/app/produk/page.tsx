import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { getCatalogProductsPage, getPublicCategories } from '@/lib/cms-db';

const SITE_URL = 'https://www.juragankompresor.com';
const PAGE_SIZE = 24;
const number = new Intl.NumberFormat('id-ID');
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
type PageProps = { searchParams: Promise<{ q?: string; category?: string; page?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const isFiltered = Boolean(params.q || params.category || params.page);
  return {
    title: 'Katalog Kompresor AC Terlengkap — Rotary, Scroll, Piston & Screw Original',
    description: 'Katalog 500+ kompresor AC dari 25 brand ternama: Copeland, Daikin, Panasonic, LG, Gree, Bitzer, Danfoss, dst. Filter berdasarkan tipe, refrigerant, dan catu daya. Harga distributor, garansi resmi, kirim seluruh Indonesia.',
    keywords: ['katalog kompresor', 'jual kompresor ac', 'kompresor rotary', 'kompresor scroll', 'kompresor piston', 'kompresor screw', 'harga kompresor ac', 'distributor kompresor'],
    alternates: { canonical: '/produk' },
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/produk`,
      title: 'Katalog Kompresor AC Terlengkap | Juragan Kompresor',
      description: 'Jelajahi 500+ varian kompresor dari 25 brand ternama — bandingkan spesifikasi dan minta penawaran distributor.',
    },
  };
}

export const dynamic = 'force-dynamic';

function specsFor(value: string | null) {
  if (!value) return {} as Record<string, string>;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, string>
      : {};
  } catch {
    return {} as Record<string, string>;
  }
}

export default async function ProductCatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim().slice(0, 100);
  const requestedPage = Number(params.page || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const categories = (await getPublicCategories()).filter((item) => item.slug.startsWith('kompresor-') && item.slug !== 'kompresor');
  const category = categories.some((item) => item.slug === params.category) ? params.category || '' : '';
  const { products, total } = await getCatalogProductsPage(query, category, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (category) next.set('category', category);
    if (targetPage > 1) next.set('page', String(targetPage));
    const search = next.toString();
    return search ? `/produk?${search}` : '/produk';
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Katalog kompresor AC Juragan Kompresor',
    numberOfItems: total,
    itemListElement: products.map(({ product }, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * PAGE_SIZE + index + 1,
      url: `${SITE_URL}/produk/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <main className="min-h-screen bg-[#f5f8f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <Image
              src="/images/logo.svg"
              alt="Logo Juragan Kompresor"
              width={36}
              height={36}
              unoptimized
              className="rounded-lg shadow-sm ring-1 ring-black/10 transition duration-300 group-hover:ring-amber-400/60"
            />
            <span className="font-extrabold tracking-tight text-slate-900">
              JURAGAN <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 bg-clip-text text-transparent">KOMPRESOR</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-teal-950 px-2 py-1.5 font-bold text-sm text-teal-50 tracking-wide">JK</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-teal-800 sm:block">Katalog Teknis Kompresor</span>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Kompresor AC · Distributor Resmi Sejak 2010</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Katalog Kompresor Terlengkap — Pilih Berdasarkan Model & Spesifikasi.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Jelajahi 500+ varian kompresor rotary, scroll, piston, semi-hermetik, dan screw dari 25 brand ternama dunia. Semua unit original dengan garansi resmi — minta penawaran untuk pemeriksaan stok dan kecocokan aplikasi.
            </p>
          </div>
          <div className="flex items-baseline gap-2 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4 text-teal-950">
            <span className="text-3xl font-semibold tabular-nums">{number.format(total)}</span>
            <span className="text-sm">varian terdaftar</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold"><SlidersHorizontal aria-hidden="true" className="size-4 text-teal-800" /> Temukan model</div>
          <form action="/produk" method="get" className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Kata kunci
              <span className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input name="q" type="search" maxLength={100} defaultValue={query} placeholder="Model, refrigeran…" className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15" />
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Tipe kompresor
              <select name="category" defaultValue={category} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15">
                <option value="">Semua tipe</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Terapkan filter</button>
            {(query || category) && <Link href="/produk" className="text-center text-sm font-medium text-teal-800 underline underline-offset-4">Hapus filter</Link>}
          </form>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Harga, stok, dan kompatibilitas perlu dikonfirmasi oleh tim sebelum pemesanan.</p>
        </aside>

        <section aria-label="Daftar kompresor" className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600" aria-live="polite">Menampilkan <span className="font-semibold text-slate-900">{number.format(products.length)}</span> dari {number.format(total)} varian</p>
            {query && <p className="text-sm text-slate-600">Kata kunci: <span className="font-semibold text-slate-900">{query}</span></p>}
          </div>

          {products.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map(({ product, category: productCategory }) => {
                const specs = specsFor(product.specifications);
                return (
                  <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg">
                    <Link href={`/produk/${product.slug}`} className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-white p-5" aria-label={`Lihat spesifikasi ${product.name}`}>
                      {product.images ? <img src={product.images} alt={`Kompresor ${product.brand || ''} ${product.model || product.name} original`} loading="lazy" className="size-full object-contain transition duration-300 group-hover:scale-[1.03]" /> : <span className="text-sm text-slate-500">Foto model belum tersedia</span>}
                    </Link>
                    <div className="flex flex-1 flex-col border-t border-slate-100 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">{product.brand || 'Kompresor'}</p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{productCategory.name.replace(/^Kompresor\s+/i, '')}</span>
                      </div>
                      <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-slate-950">{product.model || product.name}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{product.shortDesc || product.description || 'Spesifikasi model tersedia pada halaman detail.'}</p>
                      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                        <div><dt className="text-slate-500">Refrigeran</dt><dd className="mt-1 font-semibold text-slate-800">{specs.refrigerant || 'Lihat detail'}</dd></div>
                        <div><dt className="text-slate-500">Catu daya</dt><dd className="mt-1 font-semibold text-slate-800">{specs.power_supply || 'Lihat detail'}</dd></div>
                      </dl>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <span className="text-sm font-semibold text-slate-800">{product.price > 0 ? currency.format(product.price) : 'Harga melalui penawaran'}</span>
                        <Link href={`/produk/${product.slug}`} className="inline-flex h-9 items-center gap-1 rounded-lg bg-teal-900 px-3 text-xs font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Spesifikasi <ArrowRight aria-hidden="true" className="size-3.5" /></Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-slate-900">Tidak ada model yang cocok</h2>
              <p className="mt-2 text-sm text-slate-600">Coba kata kunci model, refrigeran, atau tipe kompresor yang lain.</p>
              <Link href="/produk" className="mt-5 inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Tampilkan semua model</Link>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Halaman katalog" className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              {page > 1 ? <Link rel="prev" href={pageHref(page - 1)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><ArrowLeft aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Sebelumnya</span></Link> : <span />}
              <span className="text-xs font-medium text-slate-600">Halaman {page} dari {totalPages}</span>
              {page < totalPages ? <Link rel="next" href={pageHref(page + 1)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><span className="hidden sm:inline">Berikutnya</span><ArrowRight aria-hidden="true" className="size-4" /></Link> : <span />}
            </nav>
          )}
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }} />
    </main>
  );
}
