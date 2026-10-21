'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import {
  articleSlugExists,
  cmsDb,
  cmsSettings,
  deleteCmsArticle,
  getAdminArticle,
  getAdminProduct,
  products,
  saveCmsArticle,
} from '@/lib/cms-db';

export type ArticleActionState = { error?: string };

function asText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function toSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export async function saveArticleAction(
  _previousState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  const user = await getAdminUser();
  if (!user) return { error: 'Sesi admin berakhir. Silakan masuk kembali.' };

  const id = asText(formData, 'id') || randomUUID();
  const title = asText(formData, 'title').slice(0, 180);
  const slug = toSlug(asText(formData, 'slug') || title);
  const excerpt = asText(formData, 'excerpt').slice(0, 320);
  const content = asText(formData, 'content');
  const coverImage = asText(formData, 'coverImage').slice(0, 2048);
  if (coverImage) {
    try {
      const imageUrl = new URL(coverImage);
      if (imageUrl.protocol !== 'https:') return { error: 'URL gambar harus menggunakan HTTPS.' };
    } catch {
      return { error: 'Masukkan URL gambar sampul yang valid.' };
    }
  }
  const seoTitle = asText(formData, 'seoTitle').slice(0, 70) || title;
  const seoDescription = asText(formData, 'seoDescription').slice(0, 170) || excerpt;
  const requestedStatus = asText(formData, 'status');
  const status = requestedStatus === 'published' ? 'published' : 'draft';

  if (title.length < 5 || slug.length < 3 || excerpt.length < 20 || content.length < 40) {
    return { error: 'Lengkapi judul, slug, ringkasan, dan isi artikel sebelum menyimpan.' };
  }
  if (status === 'published' && seoDescription.length < 40) {
    return { error: 'Deskripsi SEO artikel publik minimal 40 karakter.' };
  }
  if (await articleSlugExists(slug, asText(formData, 'id') || undefined)) {
    return { error: 'Slug sudah digunakan artikel lain. Ubah slug agar unik.' };
  }

  const previous = asText(formData, 'id') ? await getAdminArticle(id) : null;
  if (asText(formData, 'id') && !previous) return { error: 'Artikel tidak ditemukan.' };

  try {
    const now = new Date();
    await saveCmsArticle({
      id,
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      seoTitle,
      seoDescription,
      status,
      authorName: user.name?.trim() || user.email,
      publishedAt: status === 'published' ? previous?.publishedAt ?? now : null,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    });
  } catch {
    return { error: 'Artikel belum tersimpan. Periksa slug dan coba lagi.' };
  }

  revalidatePath('/insights');
  revalidatePath(`/insights/${slug}`);
  revalidatePath('/sitemap.xml');
  if (previous && previous.slug !== slug) revalidatePath(`/insights/${previous.slug}`);
  redirect('/admin/articles');
}

export async function deleteArticleAction(formData: FormData) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  const id = asText(formData, 'id');
  if (!id) redirect('/admin/articles');
  const article = await getAdminArticle(id);
  if (article) {
    await deleteCmsArticle(id);
    revalidatePath('/insights');
    revalidatePath(`/insights/${article.slug}`);
    revalidatePath('/sitemap.xml');
  }
  redirect('/admin/articles');
}

export async function saveSiteSettingsAction(formData: FormData) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  const siteTitle = asText(formData, 'siteTitle').slice(0, 90);
  const siteDescription = asText(formData, 'siteDescription').slice(0, 180);
  if (siteTitle.length < 5 || siteDescription.length < 40) redirect('/admin/settings?error=validation');

  const updatedAt = new Date();
  await Promise.all([
    cmsDb.insert(cmsSettings).values({ key: 'site_title', value: siteTitle, updatedAt }).onConflictDoUpdate({
      target: cmsSettings.key,
      set: { value: siteTitle, updatedAt },
    }),
    cmsDb.insert(cmsSettings).values({ key: 'site_description', value: siteDescription, updatedAt }).onConflictDoUpdate({
      target: cmsSettings.key,
      set: { value: siteDescription, updatedAt },
    }),
  ]);
  revalidatePath('/');
  redirect('/admin/settings?saved=1');
}

export async function updateCatalogProductAction(formData: FormData) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const id = asText(formData, 'id');
  if (!id || id.length > 120) redirect('/admin/products?error=not-found');
  const previous = await getAdminProduct(id);
  if (!previous) redirect('/admin/products?error=not-found');

  const name = asText(formData, 'name').slice(0, 180);
  const shortDesc = asText(formData, 'shortDesc').slice(0, 320);
  const description = asText(formData, 'description').slice(0, 5000);
  const rawPrice = asText(formData, 'price');
  const price = Number(rawPrice);
  const visibility = asText(formData, 'visibility');
  const image = asText(formData, 'images').slice(0, 2048);
  const featured = asText(formData, 'featured');

  if (
    name.length < 5 ||
    description.length < 20 ||
    !/^\\d{1,13}$/.test(rawPrice) ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    price > 1_000_000_000_000 ||
    !['listed', 'hidden'].includes(visibility) ||
    !['yes', 'no'].includes(featured)
  ) {
    redirect(`/admin/products/${encodeURIComponent(id)}?error=validation`);
  }

  if (image) {
    let isSecureUrl = false;
    try {
      isSecureUrl = new URL(image).protocol === 'https:';
    } catch {
      isSecureUrl = false;
    }
    if (!isSecureUrl) redirect(`/admin/products/${encodeURIComponent(id)}?error=image`);
  }

  const now = new Date();
  await cmsDb.update(products).set({
    name,
    shortDesc: shortDesc || null,
    description,
    price,
    images: image || null,
    inStock: visibility === 'listed',
    isFeatured: featured === 'yes',
    updatedAt: now,
  }).where((await import('drizzle-orm')).eq(products.id, id));

  revalidatePath('/');
  revalidatePath('/produk');
  revalidatePath(`/produk/${previous.slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/products');
  redirect(`/admin/products/${encodeURIComponent(id)}?saved=1`);
}
