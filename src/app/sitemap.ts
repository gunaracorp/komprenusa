import type { MetadataRoute } from 'next';
import { getPublishedArticleSlugs, getPublishedCatalogSlugs } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.juragankompresor.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, products] = await Promise.all([getPublishedArticleSlugs(), getPublishedCatalogSlugs()]);
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/produk`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/insights`, changeFrequency: 'daily', priority: 0.8 },
    ...products.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/produk/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...articles.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/insights/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
