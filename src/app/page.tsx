import type { Metadata } from 'next';
import { PageClient } from '@/components/kompresnusa/PageClient';
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
  const title = settings?.siteTitle ?? 'KompresNusa';
  const description = settings?.siteDescription ?? 'Distributor HVAC resmi sejak 2008 di Kawasan MM2100 Bekasi.';
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
      images: [{ url: '/images/hero/hero-1.png', alt: 'Sistem pendingin HVAC modern — PT KompresNusa' }],
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
      name: 'PT KompresNusa',
      alternateName: 'KompresNusa',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.svg`,
      image: `${SITE_URL}/images/hero/hero-1.png`,
      description: 'Distributor HVAC resmi sejak 2008 — pusat penjualan AC, kompresor, refrigerant, spare part, chiller, dan sistem pendingin gedung terlengkap di Indonesia.',
      foundingDate: '2008',
      email: 'kompresnusa@gmail.com',
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
      name: 'KompresNusa',
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
