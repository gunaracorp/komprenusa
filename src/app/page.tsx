import type { Metadata } from 'next';
import { PageClient } from '@/components/kompresa/PageClient';
import {
  getApprovedTestimonials,
  getCategoryProductCounts,
  getHomepageCatalogPreview,
  getPublicFeaturedProducts,
  getSiteSeoSettings,
} from '@/lib/cms-db';

const SITE_URL = 'https://www.juragankompresor.com';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSeoSettings().catch(() => null);
  const title = settings?.siteTitle ?? 'Jual Kompresor AC & Spare Part Pendingin | KOMPRESA';
  const description = settings?.siteDescription ?? 'Pusat Kompresor AC dan Spare Part Pendingin Indonesia — distributor HVAC resmi sejak 2008. Periksa spesifikasi, kecocokan produk, harga, dan informasi pemesanan.';
  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: '/',
      siteName: title,
      locale: 'id_ID',
      title,
      description,
      images: [{ url: '/images/hero/hero-1.png', alt: 'Sistem pendingin HVAC modern — PT Kompresa' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/images/hero/hero-1.png'] },
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'LocalBusiness'],
      '@id': `${SITE_URL}/#organization`,
      name: 'PT Kompresa',
      alternateName: 'Kompresa',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.svg`,
      image: `${SITE_URL}/images/hero/hero-1.png`,
      description: 'Distributor HVAC resmi sejak 2008 — pusat penjualan AC, kompresor, refrigerant, spare part, chiller, dan sistem pendingin gedung terlengkap di Indonesia.',
      foundingDate: '2008',
      email: 'kompresa@gmail.com',
      telephone: '+62-21-2268-2617',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kawasan Industri MM2100',
        addressLocality: 'Bekasi',
        addressRegion: 'Jawa Barat',
        addressCountry: 'ID',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-813-5000-3423',
        contactType: 'sales',
        areaServed: 'ID',
        availableLanguage: ['id'],
      },
      areaServed: { '@type': 'Country', name: 'Indonesia' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'KOMPRESA',
      alternateName: 'Kompresa',
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default async function HomePage() {
  const [categoryRows, featuredRows, catalogRows, testimonials] = await Promise.all([
    getCategoryProductCounts(),
    getPublicFeaturedProducts(),
    getHomepageCatalogPreview(),
    getApprovedTestimonials(),
  ]);

  const categories = categoryRows.map(({ category, count }) => ({
    ...category,
    _count: { products: Number(count) },
  }));
  const featuredProducts = featuredRows.map(({ product, category }) => ({ ...product, category }));
  const allProducts = catalogRows.map(({ product, category }) => ({ ...product, category }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageClient categories={categories} featuredProducts={featuredProducts} allProducts={allProducts} testimonials={testimonials} />
    </>
  );
}
