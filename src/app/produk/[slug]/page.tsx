import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, BadgeCheck, MessageCircle, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { getProductDetails, getCatalogProductsByCategory } from '@/lib/cms-db';
import { Button } from '@/components/ui/button';
import { formatRupiah as formatIDR } from '@/lib/format';

const SITE_URL = 'https://www.juragankompresor.com';
type RouteProps = { params: Promise<{ slug: string }> };
type ProductSpecs = Record<string, string>;

const specLabels: Record<string, string> = {
  family: 'Seri',
  compressor_type: 'Tipe kompresor',
  kompresor_type: 'Tipe kompresor',
  teknologi: 'Teknologi',
  technology: 'Teknologi',
  refrigerant: 'Refrigeran',
  power_supply: 'Catu daya',
  horsepower: 'Daya kuda',
  kapasitas: 'Kapasitas pendinginan',
  kapasitas_pk: 'Kapasitas (PK)',
  perpindahan_cm3_rev: 'Perpindahan (cm³/putaran)',
  cop: 'COP (efisiensi)',
  tegangan: 'Tegangan',
  oil: 'Oli kompresor',
  aplikasi: 'Aplikasi',
  garansi: 'Garansi',
  kemasan: 'Kondisi',
  displacement: 'Perpindahan volume',
  displacement_m3_h: 'Perpindahan (m³/jam)',
  displacement_cm3_rev: 'Perpindahan (cm³/putaran)',
  application: 'Aplikasi',
  test_application: 'Aplikasi pengujian',
  test_standard: 'Standar pengujian',
  motor_type: 'Tipe motor',
  starting_torque: 'Torsi awal',
  regional_listing: 'Wilayah pada katalog',
  rotation: 'Rotasi',
  bare_part_numbers: 'Nomor suku cadang',
  kit: 'Kit',
};

function readSpecs(value: string | null | undefined): ProductSpecs {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as ProductSpecs
      : {};
  } catch {
    return {};
  }
}

function productMeta(product: NonNullable<Awaited<ReturnType<typeof getProductDetails>>>['product'], categoryLabel: string) {
  const specs = readSpecs(product.specifications);
  const identity = [product.brand, product.model].filter(Boolean).join(' ');
  const typeLabel = specs.kompresor_type || specs.compressor_type || 'Kompresor AC';
  const refrigerant = specs.refrigerant || '';
  const title = `Jual ${identity || product.name} — ${typeLabel} Original Ready Stock`;
  const description = `${identity || product.name} ${typeLabel} original untuk ${categoryLabel}. ${product.shortDesc || ''} Harga distributor termurah, garansi resmi, kirim ke seluruh Indonesia. Konsultasi & quote cepat!`.slice(0, 300);
  const keywords = [
    `jual ${typeLabel.toLowerCase()} ${product.brand?.toLowerCase() ?? ''}`.trim(),
    `kompresor ${product.brand?.toLowerCase() ?? ''} ${product.model?.toLowerCase() ?? ''}`.trim(),
    refrigerant ? `kompresor ac ${refrigerant.toLowerCase()}` : 'kompresor ac',
    'kompresor ac murah',
    'distributor kompresor indonesia',
    'harga kompresor ac',
    'juragan kompresor',
  ].filter(Boolean);
  return { title, description, keywords, typeLabel };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductDetails(slug);
  if (!result?.product.inStock) return { title: 'Produk tidak ditemukan', robots: { index: false, follow: false } };

  const { title, description, keywords } = productMeta(result.product, result.category.name);
  const url = `${SITE_URL}/produk/${result.product.slug}`;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/produk/${result.product.slug}` },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: result.product.images ? [{ url: result.product.images, alt: result.product.name }] : undefined,
    },
    twitter: {
      card: result.product.images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: result.product.images ? [result.product.images] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const result = await getProductDetails(slug);
  if (!result?.product.inStock) notFound();

  const { product, category } = result;
  const [relatedRaw] = await Promise.all([getCatalogProductsByCategory(category.slug)]);
  const related = relatedRaw
    .filter((row) => row.product.id !== product.id)
    .slice(0, 6);

  const specs = readSpecs(product.specifications);
  const sourceUrl = specs._sourceUrl;
  const sourceName = specs._sourceName || 'Katalog resmi produsen';
  const displaySpecs = Object.entries(specs).filter(([key, value]) => !key.startsWith('_') && typeof value === 'string');
  const { title, description, typeLabel } = productMeta(product, category.name);
  const canonicalUrl = `${SITE_URL}/produk/${product.slug}`;
  const quoteMessage = `Halo, saya ingin menanyakan harga dan ketersediaan ${product.brand || ''} ${product.model || product.name}. Mohon bantu cek kecocokan produk ini untuk kebutuhan saya.`;

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPct = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        sku: product.model || product.slug,
        mpn: product.model || undefined,
        model: product.model || undefined,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        category: `${category.name} > ${typeLabel}`,
        description: (product.description || product.shortDesc || product.name).slice(0, 900),
        image: product.images ? [`${SITE_URL}${product.images}`] : undefined,
        url: canonicalUrl,
        additionalProperty: displaySpecs.map(([name, value]) => ({
          '@type': 'PropertyValue',
          name: specLabels[name] || name.replaceAll('_', ' '),
          value,
        })),
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'IDR',
          price: product.price,
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'PT Juragan Kompresor', url: SITE_URL },
          areaServed: 'ID',
          priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Katalog produk', item: `${SITE_URL}/produk` },
          { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/produk?category=${encodeURIComponent(category.slug)}` },
          { '@type': 'ListItem', position: 4, name: product.model || product.name, item: canonicalUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Berapa harga ${typeLabel.toLowerCase()} ${product.brand || ''} ${product.model || ''}?`.replace(/\s+/g, ' ').trim(),
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Harga ${product.name} mulai dari ${formatIDR(product.price)} untuk pembelian distributor. Harga spesial tersedia untuk proyek dan pembelian volume — hubungi tim sales untuk penawaran resmi.`,
            },
          },
          {
            '@type': 'Question',
            name: `Apakah ${product.brand || 'kompresor ini'} ready stock dan bisa dikirim ke seluruh Indonesia?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ya, unit tersedia di gudang Kawasan Industri MM2100, Bekasi, dan dikirim ke 34 provinsi Indonesia dengan packing aman berdasarkan standar logistik HVAC.',
            },
          },
          {
            '@type': 'Question',
            name: `Kompresor ini cocok untuk aplikasi apa saja?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${product.name} dengan refrigerant ${specs.refrigerant || 'standar industri'} direkomendasikan untuk ${specs.aplikasi || 'sistem pendingin komersial dan industri'}. Konsultasikan kapasitas dan kelistrikan Anda ke tim teknis kami secara gratis.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="inline-flex items-center gap-2 transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Katalog
          </Link>
          <span aria-hidden="true">/</span>
          <span>{category.name}</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="max-w-[14rem] truncate font-medium text-slate-900">{product.model || product.name}</span>
        </nav>

        <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex min-h-72 items-center justify-center bg-white p-6 sm:min-h-[32rem] sm:p-10">
            {product.images ? (
              <img src={product.images} alt={`${product.name} — ${typeLabel} original ready stock`} className="max-h-[28rem] w-full object-contain" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-500">Foto model belum tersedia</div>
            )}
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-200 p-6 sm:p-9 lg:border-l lg:border-t-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">{product.brand || 'Kompresor'} · {category.name}</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{product.description || product.shortDesc}</p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-2xl font-bold text-teal-950">{formatIDR(product.price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-slate-500 line-through">{formatIDR(product.originalPrice!)}</span>
                    <span className="rounded-full bg-teal-900 px-2 py-0.5 text-xs font-semibold text-white">Hemat {discountPct}%</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-sm leading-5 text-teal-900">Harga distributor spesial untuk kontraktor & volume besar. Konfirmasikan stok, kelistrikan, dan kecocokan aplikasi kepada tim sebelum pemesanan.</p>
            </div>

            <ul className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <li className="flex items-center gap-2"><BadgeCheck aria-hidden="true" className="size-4 text-teal-700" /> 100% Original Distributor Resmi</li>
              <li className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-teal-700" /> Garansi resmi 1 tahun</li>
              <li className="flex items-center gap-2"><PackageCheck aria-hidden="true" className="size-4 text-teal-700" /> Ready stock MM2100 Bekasi</li>
              <li className="flex items-center gap-2"><Truck aria-hidden="true" className="size-4 text-teal-700" /> Kirim ke 34 provinsi Indonesia</li>
            </ul>

            <div>
              <h2 className="text-sm font-semibold">Spesifikasi katalog</h2>
              <dl className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {displaySpecs.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] gap-4 px-4 py-3 text-sm even:bg-slate-50">
                    <dt className="text-slate-600">{specLabels[key] || key.replaceAll('_', ' ')}</dt>
                    <dd className="break-words font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
                {!displaySpecs.length && product.model && (
                  <div className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"><dt className="text-slate-600">Model</dt><dd className="font-medium">{product.model}</dd></div>
                )}
              </dl>
            </div>

            {sourceUrl && (
              <p className="text-xs leading-5 text-slate-600">
                Referensi teknis: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-800 underline underline-offset-2">{sourceName}<ArrowUpRight aria-hidden="true" className="ml-1 inline size-3.5" /></a>. Spesifikasi dan foto mengacu pada katalog produsen; ketersediaan di Indonesia perlu dikonfirmasi.
              </p>
            )}

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 flex-1 bg-teal-900 text-white hover:bg-teal-800">
                <a href={`https://wa.me/6281350003423?text=${encodeURIComponent(quoteMessage)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle data-icon="inline-start" /> Tanyakan harga & stok
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 border-slate-300">
                <Link href="/#produk">Kembali ke katalog</Link>
              </Button>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section aria-labelledby="related-products" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="related-products" className="text-lg font-semibold text-slate-900">Produk {category.name} lainnya</h2>
                <p className="mt-1 text-sm text-slate-600">Pilihan populer dari kategori yang sama — stok gudang Bekasi.</p>
              </div>
              <Link href={`/produk?category=${encodeURIComponent(category.slug)}`} className="text-sm font-semibold text-teal-800 hover:underline">
                Lihat semua {category.name} →
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {related.map(({ product: item }) => (
                <Link
                  key={item.id}
                  href={`/produk/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex aspect-square items-center justify-center bg-slate-50 p-3">
                    {item.images ? (
                      <img src={item.images} alt={`${item.name} harga distributor`} className="max-h-28 w-full object-contain transition group-hover:scale-105" loading="lazy" />
                    ) : (
                      <span className="text-xs text-slate-400">Tanpa foto</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 border-t border-slate-100 p-3">
                    <p className="line-clamp-2 text-xs font-medium leading-4 text-slate-800">{item.name}</p>
                    <p className="mt-auto text-xs font-semibold text-teal-800">{formatIDR(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <h2 className="sr-only">{title}</h2>
        <p className="sr-only">{description}</p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData).replace(/</g, '\\u003c') }} />
    </main>
  );
}
