import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { and, eq, exists, inArray, isNull, lt, ne, notInArray, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { bigint, boolean, doublePrecision, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const cmsArticles = pgTable('cms_articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  seoTitle: text('seo_title').notNull(),
  seoDescription: text('seo_description').notNull(),
  status: text('status').notNull(),
  authorName: text('author_name').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const cmsSettings = pgTable('cms_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const productImageAssets = pgTable('product_image_assets', {
  id: text('id').primaryKey(),
  ownerUserId: text('owner_user_id').notNull(),
  sourceFileId: text('source_file_id').notNull(),
  sourcePath: text('source_path').notNull(),
  sourcePathLower: text('source_path_lower').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  revision: text('revision'),
  providerContentHash: text('provider_content_hash'),
  sourceModifiedAt: timestamp('source_modified_at', { withTimezone: true }),
  rightsStatus: text('rights_status').notNull(),
  rightsBasis: text('rights_basis').notNull(),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  sourceDeletedAt: timestamp('source_deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  processingStatus: text('processing_status').notNull().default('DISCOVERED'),
  imageSha256: text('image_sha256'),
  perceptualHash: text('perceptual_hash'),
  width: integer('width'),
  height: integer('height'),
  storagePath: text('storage_path'),
  productId: text('product_id'),
  processingError: text('processing_error'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  qualityScore: doublePrecision('quality_score'),
  watermarkStatus: text('watermark_status').notNull().default('NOT_APPLIED'),
  watermarkVersion: text('watermark_version'),
}, (table) => [
  uniqueIndex('product_image_assets_owner_source_unique').on(table.ownerUserId, table.sourceFileId),
]);

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  image: text('image'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  shortDesc: text('short_desc'),
  price: doublePrecision('price').notNull(),
  originalPrice: doublePrecision('original_price'),
  categoryId: text('category_id').notNull(),
  brand: text('brand'),
  model: text('model'),
  specifications: text('specifications'),
  images: text('images'),
  inStock: boolean('in_stock').notNull(),
  isFeatured: boolean('is_featured').notNull(),
  isNew: boolean('is_new').notNull(),
  minOrder: integer('min_order').notNull(),
  unit: text('unit').notNull(),
  viewCount: integer('view_count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  position: text('position'),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  avatar: text('avatar'),
  isApproved: boolean('is_approved').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

const globalForCms = globalThis as typeof globalThis & { cmsClient?: PGlite };

/**
 * PGlite — PostgreSQL asli (WASM) yang tertanam di dalam proses Node.
 * Data tersimpan permanen di disk sehingga aman untuk produksi ringan.
 */
function resolvePgliteDataDir(): string {
  const configured = process.env.PGLITE_DATA_DIR;
  if (configured && configured.length > 0) return configured;
  return path.join(process.cwd(), 'db', 'pglite-data');
}

const pglite = globalForCms.cmsClient ?? new PGlite(resolvePgliteDataDir());

if (process.env.NODE_ENV !== 'production') globalForCms.cmsClient = pglite;

/** Adapter ringan menyerupai client `pg.Pool` untuk pemakaian SQL mentah. */
export const rawCmsClient = {
  query: async <T = Record<string, unknown>>(text: string, params?: unknown[]) => {
    const result = await pglite.query<T>(text, params as unknown[]);
    return { rows: result.rows as T[], rowCount: result.affectedRows ?? result.rows.length };
  },
  release: () => undefined,
};

export const cmsDb = drizzle(pglite, { schema: { cmsArticles, cmsSettings, categories, products, testimonials, productImageAssets } });

export const CMS_BACKUP_PUBLIC_TABLES = [
  'articles',
  'categories',
  'cms_articles',
  'cms_settings',
  'product_image_assets',
  'products',
  'site_settings',
  'testimonials',
] as const;

export type CmsDatabaseBackupSnapshot = {
  format: 'juragan-kompresor-cms-backup';
  version: 1;
  capturedAt: string;
  database: 'postgres';
  schema: 'public';
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      default: string | null;
    }>;
    primaryKey: string[];
    rowCount: number;
    rows: Record<string, unknown>[];
  }>;
};

function quotePostgresIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

export async function exportCmsDatabaseSnapshot(): Promise<CmsDatabaseBackupSnapshot> {
  const client = rawCmsClient;
  const capturedAt = new Date().toISOString();
  let transactionOpen = false;

  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    transactionOpen = true;

    const { rows: liveTables } = await client.query<{ table_name: string }>(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = $2 ORDER BY table_name',
      ['public', 'BASE TABLE'],
    );
    const liveTableNames = new Set(liveTables.map(({ table_name }) => table_name));
    const expectedTableNames = new Set<string>(CMS_BACKUP_PUBLIC_TABLES);
    const missingTables = CMS_BACKUP_PUBLIC_TABLES.filter((tableName) => !liveTableNames.has(tableName));
    const unexpectedTables = liveTables.map(({ table_name }) => table_name).filter((tableName) => !expectedTableNames.has(tableName));

    if (missingTables.length || unexpectedTables.length) {
      throw new Error(`CMS_BACKUP_SCHEMA_MISMATCH: missing=${missingTables.join(',')} unexpected=${unexpectedTables.join(',')}`);
    }

    const tables: CmsDatabaseBackupSnapshot['tables'] = [];

    for (const tableName of CMS_BACKUP_PUBLIC_TABLES) {
      const [{ rows: columnRows }, { rows: keyRows }, { rows }] = await Promise.all([
        client.query<{
          column_name: string;
          data_type: string;
          is_nullable: 'YES' | 'NO';
          column_default: string | null;
        }>(
          'SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position',
          ['public', tableName],
        ),
        client.query<{ column_name: string }>(
          'SELECT key_column_usage.column_name FROM information_schema.table_constraints JOIN information_schema.key_column_usage USING (constraint_catalog, constraint_schema, constraint_name, table_name) WHERE table_constraints.table_schema = $1 AND table_constraints.table_name = $2 AND table_constraints.constraint_type = $3 ORDER BY key_column_usage.ordinal_position',
          ['public', tableName, 'PRIMARY KEY'],
        ),
        client.query<Record<string, unknown>>(`SELECT * FROM "public".${quotePostgresIdentifier(tableName)}`),
      ]);

      tables.push({
        name: tableName,
        columns: columnRows.map((column) => ({
          name: column.column_name,
          type: column.data_type,
          nullable: column.is_nullable === 'YES',
          default: column.column_default,
        })),
        primaryKey: keyRows.map(({ column_name }) => column_name),
        rowCount: rows.length,
        rows,
      });
    }

    await client.query('COMMIT');
    transactionOpen = false;

    return {
      format: 'juragan-kompresor-cms-backup',
      version: 1,
      capturedAt,
      database: 'postgres',
      schema: 'public',
      tables,
    };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertDropboxImageAssets(assets: (typeof productImageAssets.$inferInsert)[]) {
  if (assets.length === 0) return;
  await cmsDb.insert(productImageAssets).values(assets).onConflictDoUpdate({
    target: [productImageAssets.ownerUserId, productImageAssets.sourceFileId],
    set: {
      sourcePath: sql`excluded.source_path`,
      sourcePathLower: sql`excluded.source_path_lower`,
      fileName: sql`excluded.file_name`,
      mimeType: sql`excluded.mime_type`,
      sizeBytes: sql`excluded.size_bytes`,
      revision: sql`excluded.revision`,
      providerContentHash: sql`excluded.provider_content_hash`,
      sourceModifiedAt: sql`excluded.source_modified_at`,
      rightsStatus: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN 'PENDING_REVIEW' ELSE product_image_assets.rights_status END`,
      rightsBasis: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN '' ELSE product_image_assets.rights_basis END`,
      reviewedBy: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.reviewed_by END`,
      reviewedAt: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.reviewed_at END`,
      processingStatus: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN 'DISCOVERED' ELSE product_image_assets.processing_status END`,
      imageSha256: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.image_sha256 END`,
      perceptualHash: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.perceptual_hash END`,
      width: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.width END`,
      height: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.height END`,
      storagePath: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.storage_path END`,
      productId: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.product_id END`,
      processingError: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.processing_error END`,
      processedAt: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.processed_at END`,
      qualityScore: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.quality_score END`,
      watermarkStatus: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN 'NOT_APPLIED' ELSE product_image_assets.watermark_status END`,
      watermarkVersion: sql`CASE WHEN product_image_assets.provider_content_hash IS DISTINCT FROM excluded.provider_content_hash OR product_image_assets.revision IS DISTINCT FROM excluded.revision THEN NULL ELSE product_image_assets.watermark_version END`,
      sourceDeletedAt: null,
      updatedAt: sql`excluded.updated_at`,
    },
  });
}

export async function markDropboxImageAssetsDeleted(ownerUserId: string, pathLower: string) {
  const now = new Date();
  await cmsDb.update(productImageAssets).set({ sourceDeletedAt: now, updatedAt: now }).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    sql`(${productImageAssets.sourcePathLower} = ${pathLower} OR ${productImageAssets.sourcePathLower} LIKE ${pathLower.replace(/[\\%_]/g, '\\$&')} || '/%')`,
  ));
}

export async function getProductImageAssetsForReview(ownerUserId: string, limit = 50) {
  return cmsDb.select().from(productImageAssets).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    sql`${productImageAssets.sourceDeletedAt} IS NULL`,
  )).orderBy(sql`${productImageAssets.sourceModifiedAt} DESC NULLS LAST`).limit(Math.min(Math.max(limit, 1), 100));
}

export async function getProductImageAssetStats(ownerUserId: string) {
  const approvedStatuses = ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED'];
  const [rightsRows, processingRows, actionableRows] = await Promise.all([
    cmsDb.select({ status: productImageAssets.rightsStatus, count: sql<number>`count(*)::int` })
      .from(productImageAssets)
      .where(and(eq(productImageAssets.ownerUserId, ownerUserId), isNull(productImageAssets.sourceDeletedAt)))
      .groupBy(productImageAssets.rightsStatus),
    cmsDb.select({ status: productImageAssets.processingStatus, count: sql<number>`count(*)::int` })
      .from(productImageAssets)
      .where(and(eq(productImageAssets.ownerUserId, ownerUserId), isNull(productImageAssets.sourceDeletedAt)))
      .groupBy(productImageAssets.processingStatus),
    cmsDb.select({ status: productImageAssets.processingStatus, count: sql<number>`count(*)::int` })
      .from(productImageAssets)
      .where(and(
        eq(productImageAssets.ownerUserId, ownerUserId),
        isNull(productImageAssets.sourceDeletedAt),
        inArray(productImageAssets.rightsStatus, approvedStatuses),
        inArray(productImageAssets.processingStatus, ['DISCOVERED', 'FAILED']),
      ))
      .groupBy(productImageAssets.processingStatus),
  ]);
  const rights = Object.fromEntries(rightsRows.map(({ status, count }) => [status, count]));
  const processing = Object.fromEntries(processingRows.map(({ status, count }) => [status, count]));
  const actionable = Object.fromEntries(actionableRows.map(({ status, count }) => [status, count]));
  return {
    total: Object.values(rights).reduce((sum, count) => sum + count, 0),
    pending: rights.PENDING_REVIEW ?? 0,
    approved: ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED'].reduce((sum, status) => sum + (rights[status] ?? 0), 0),
    rejected: rights.REJECTED ?? 0,
    ready: actionable.DISCOVERED ?? 0,
    retryable: actionable.FAILED ?? 0,
    processed: processing.PROCESSED ?? 0,
    failed: processing.FAILED ?? 0,
    invalid: processing.INVALID ?? 0,
    duplicates: processing.DUPLICATE ?? 0,
    processing: processing.PROCESSING ?? 0,
  };
}

export async function claimProductImageAssets(ownerUserId: string, limit = 10, retryFailed = false) {
  const staleBefore = new Date(Date.now() - 20 * 60 * 1000);
  const claimableStatuses = retryFailed ? ['DISCOVERED', 'FAILED'] : ['DISCOVERED'];
  return cmsDb.transaction(async (transaction) => {
    const assets = await transaction.select().from(productImageAssets).where(and(
      eq(productImageAssets.ownerUserId, ownerUserId),
      isNull(productImageAssets.sourceDeletedAt),
      inArray(productImageAssets.rightsStatus, ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']),
      or(
        inArray(productImageAssets.processingStatus, claimableStatuses),
        and(eq(productImageAssets.processingStatus, 'PROCESSING'), lt(productImageAssets.updatedAt, staleBefore)),
      ),
    )).orderBy(productImageAssets.createdAt).limit(Math.min(Math.max(limit, 1), 10)).for('update', { skipLocked: true });

    if (assets.length) {
      await transaction.update(productImageAssets).set({ processingStatus: 'PROCESSING', processingError: null, updatedAt: new Date() })
        .where(and(eq(productImageAssets.ownerUserId, ownerUserId), inArray(productImageAssets.id, assets.map((asset) => asset.id))));
    }
    return assets;
  });
}

export async function findProductImageBySha256(ownerUserId: string, imageSha256: string, excludeAssetId: string) {
  const [asset] = await cmsDb.select().from(productImageAssets).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    eq(productImageAssets.imageSha256, imageSha256),
    eq(productImageAssets.watermarkVersion, 'jk-product-catalog-v1'),
    isNull(productImageAssets.sourceDeletedAt),
    inArray(productImageAssets.rightsStatus, ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']),
    sql`${productImageAssets.storagePath} IS NOT NULL`,
    sql`${productImageAssets.id} <> ${excludeAssetId}`,
  )).limit(1);
  return asset ?? null;
}

export async function saveProductImageProcessingResult(
  ownerUserId: string,
  assetId: string,
  expectedRevision: string | null,
  result: Partial<typeof productImageAssets.$inferInsert>,
) {
  const revisionFilter = expectedRevision === null
    ? isNull(productImageAssets.revision)
    : eq(productImageAssets.revision, expectedRevision);
  const [updated] = await cmsDb.update(productImageAssets).set({ ...result, updatedAt: new Date() }).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    eq(productImageAssets.id, assetId),
    eq(productImageAssets.processingStatus, 'PROCESSING'),
    revisionFilter,
    isNull(productImageAssets.sourceDeletedAt),
    inArray(productImageAssets.rightsStatus, ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']),
  )).returning({ id: productImageAssets.id });
  return Boolean(updated);
}

export async function findProductByExactSlug(slug: string) {
  const [product] = await cmsDb.select({ id: products.id, images: products.images }).from(products).where(eq(products.slug, slug)).limit(1);
  return product ?? null;
}

export async function setProductImageIfEmpty(productId: string, imageUrl: string, ownerUserId: string, assetId: string) {
  const eligibleAsset = cmsDb.select({ id: productImageAssets.id }).from(productImageAssets).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    eq(productImageAssets.id, assetId),
    eq(productImageAssets.productId, productId),
    eq(productImageAssets.storagePath, imageUrl),
    inArray(productImageAssets.rightsStatus, ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']),
    inArray(productImageAssets.processingStatus, ['PROCESSED', 'DUPLICATE']),
    isNull(productImageAssets.sourceDeletedAt),
  )).limit(1);
  const [updated] = await cmsDb.update(products).set({ images: imageUrl, updatedAt: new Date() }).where(and(
    eq(products.id, productId),
    or(isNull(products.images), eq(products.images, '')),
    exists(eligibleAsset),
  )).returning({ id: products.id });
  return Boolean(updated);
}

export async function updateProductImageRightsReview(ownerUserId: string, assetId: string, rightsStatus: string, rightsBasis: string) {
  const now = new Date();
  const approved = ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED'].includes(rightsStatus);
  return cmsDb.transaction(async (transaction) => {
    const [current] = await transaction.select({
      storagePath: productImageAssets.storagePath,
      productId: productImageAssets.productId,
    }).from(productImageAssets).where(and(
      eq(productImageAssets.ownerUserId, ownerUserId),
      eq(productImageAssets.id, assetId),
      isNull(productImageAssets.sourceDeletedAt),
    )).for('update');
    if (!current) return null;

    await transaction.update(productImageAssets).set({
      rightsStatus,
      rightsBasis,
      reviewedBy: ownerUserId,
      reviewedAt: now,
      ...(approved ? { processingError: null } : {
        processingStatus: 'DISCOVERED',
        processingError: current.storagePath ? 'Hak penggunaan dicabut; salinan publik sedang ditarik.' : null,
      }),
      updatedAt: now,
    }).where(and(eq(productImageAssets.ownerUserId, ownerUserId), eq(productImageAssets.id, assetId)));
    return current;
  });
}

export async function hasOtherApprovedProductImageAsset(ownerUserId: string, assetId: string, storagePath: string) {
  const [asset] = await cmsDb.select({ id: productImageAssets.id }).from(productImageAssets).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    ne(productImageAssets.id, assetId),
    eq(productImageAssets.storagePath, storagePath),
    inArray(productImageAssets.rightsStatus, ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']),
    isNull(productImageAssets.sourceDeletedAt),
  )).limit(1);
  return Boolean(asset);
}

export async function clearProductImageIfMatches(productId: string, imageUrl: string) {
  await cmsDb.update(products).set({ images: null, updatedAt: new Date() }).where(and(
    eq(products.id, productId),
    eq(products.images, imageUrl),
  ));
}

export async function clearProductImageAssetPublication(ownerUserId: string, assetId: string, storagePath: string) {
  await cmsDb.update(productImageAssets).set({
    storagePath: null,
    productId: null,
    processingStatus: 'DISCOVERED',
    processingError: null,
    processedAt: null,
    watermarkStatus: 'NOT_APPLIED',
    watermarkVersion: null,
    updatedAt: new Date(),
  }).where(and(
    eq(productImageAssets.ownerUserId, ownerUserId),
    eq(productImageAssets.id, assetId),
    eq(productImageAssets.storagePath, storagePath),
    notInArray(productImageAssets.rightsStatus, ['OWNED', 'LICENSED', 'SUPPLIER_AUTHORIZED', 'MANUFACTURER_AUTHORIZED', 'PARTNER_AUTHORIZED', 'PUBLIC_REUSE_PERMITTED']),
  ));
}

export type CmsArticle = typeof cmsArticles.$inferSelect;
export type CmsCategory = typeof categories.$inferSelect;
export type CmsProduct = typeof products.$inferSelect;

export async function getCmsSetting(key: string) {
  const [setting] = await cmsDb.select({ value: cmsSettings.value }).from(cmsSettings).where((await import('drizzle-orm')).eq(cmsSettings.key, key)).limit(1);
  return setting?.value ?? null;
}

export async function getSiteSeoSettings() {
  const settings = await cmsDb.select().from(cmsSettings);
  const values = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  return {
    siteTitle: values.site_title || 'Juragan Kompresor',
    siteDescription: values.site_description || 'Distributor HVAC resmi sejak 2008 di Kawasan MM2100 Bekasi. Pusat penjualan AC, kompresor, refrigerant, spare part, chiller, VRV/VRF, dan sistem pendingin gedung terlengkap.',
  };
}

export async function getPublishedArticles() {
  return cmsDb.select().from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published')).orderBy((await import('drizzle-orm')).desc(cmsArticles.publishedAt));
}

export async function getApprovedTestimonials() {
  return cmsDb.select({
    id: testimonials.id,
    name: testimonials.name,
    company: testimonials.company,
    position: testimonials.position,
    content: testimonials.content,
    rating: testimonials.rating,
  }).from(testimonials).where((await import('drizzle-orm')).eq(testimonials.isApproved, true)).orderBy((await import('drizzle-orm')).desc(testimonials.createdAt));
}

export async function getArticleBySlug(slug: string) {
  const { and, eq } = await import('drizzle-orm');
  const [article] = await cmsDb.select().from(cmsArticles).where(and(eq(cmsArticles.slug, slug), eq(cmsArticles.status, 'published'))).limit(1);
  return article ?? null;
}

export async function getPublishedArticleSlugs() {
  return cmsDb.select({ slug: cmsArticles.slug, updatedAt: cmsArticles.updatedAt }).from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published'));
}

export async function getAdminArticles() {
  return cmsDb.select().from(cmsArticles).orderBy((await import('drizzle-orm')).desc(cmsArticles.updatedAt));
}

export async function getAdminArticle(id: string) {
  const [article] = await cmsDb.select().from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.id, id)).limit(1);
  return article ?? null;
}

export async function articleSlugExists(slug: string, excludingId?: string) {
  const { and, eq, ne } = await import('drizzle-orm');
  const predicate = excludingId
    ? and(eq(cmsArticles.slug, slug), ne(cmsArticles.id, excludingId))
    : eq(cmsArticles.slug, slug);
  const [article] = await cmsDb.select({ id: cmsArticles.id }).from(cmsArticles).where(predicate).limit(1);
  return Boolean(article);
}

export async function saveCmsArticle(article: typeof cmsArticles.$inferInsert) {
  await cmsDb.insert(cmsArticles).values(article).onConflictDoUpdate({
    target: cmsArticles.id,
    set: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      status: article.status,
      authorName: article.authorName,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    },
  });
}

export async function deleteCmsArticle(id: string) {
  await cmsDb.delete(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.id, id));
}

export async function getAdminOverview() {
  const [{ count: articleCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles);
  const [{ count: publishedCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published'));
  const [{ count: productCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(products);
  return { articleCount, publishedCount, productCount };
}

export async function getAdminCategories() {
  return cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getAdminProduct(id: string) {
  const [product] = await cmsDb.select().from(products).where((await import('drizzle-orm')).eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getAdminProducts() {
  return cmsDb.select({ product: products, categoryName: categories.name }).from(products).leftJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).orderBy((await import('drizzle-orm')).desc(products.updatedAt));
}

export async function getPublishedCatalog() {
  return cmsDb.select({ product: products, category: { id: categories.id, name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where((await import('drizzle-orm')).eq(products.inStock, true)).orderBy((await import('drizzle-orm')).desc(products.createdAt));
}

export async function getFeaturedCatalog() {
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where((await import('drizzle-orm')).eq(products.isFeatured, true)).orderBy((await import('drizzle-orm')).desc(products.createdAt)).limit(8);
}

export async function getCategoryList() {
  return cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getAdminCategory(id: string) {
  const [category] = await cmsDb.select().from(categories).where((await import('drizzle-orm')).eq(categories.id, id)).limit(1);
  return category ?? null;
}

export async function getCategoryProductCounts() {
  return cmsDb.select({ category: categories, count: (await import('drizzle-orm')).count(products.id) }).from(categories).leftJoin(products, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).groupBy(categories.id).orderBy(categories.sortOrder, categories.name);
}

export async function getPublicProductsBySlug(slug: string) {
  const { and, eq } = await import('drizzle-orm');
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where(and(eq(products.slug, slug), eq(products.inStock, true))).limit(1);
}

export async function incrementPublicProductView(id: string) {
  const { eq, sql } = await import('drizzle-orm');
  await cmsDb.update(products).set({ viewCount: sql`${products.viewCount} + 1` }).where(eq(products.id, id));
}

export async function getPublishedCatalogSlugs() {
  return cmsDb.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true));
}

export async function getCatalogSearchResults(query: string) {
  const { and, eq, ilike, or } = await import('drizzle-orm');
  const search = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(and(eq(products.inStock, true), or(ilike(products.name, search), ilike(products.shortDesc, search), ilike(products.brand, search)))).orderBy(products.name).limit(50);
}

export async function getCatalogSummary() {
  const [{ count: categoriesCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(categories);
  const [{ count: productsCount }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(products);
  return { categoriesCount, productsCount };
}

export async function getCatalogCategory(slug: string) {
  const { eq } = await import('drizzle-orm');
  const [category] = await cmsDb.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return category ?? null;
}

export async function getCatalogProductsByCategory(slug: string) {
  const { eq } = await import('drizzle-orm');
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(eq(categories.slug, slug)).orderBy(products.name);
}

export async function getProductPriceRange() {
  const [{ min, max }] = await cmsDb.select({ min: (await import('drizzle-orm')).min(products.price), max: (await import('drizzle-orm')).max(products.price) }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true));
  return { min: min ?? 0, max: max ?? 0 };
}

export async function getCatalogFilterOptions() {
  const [brands, categoriesList] = await Promise.all([
    cmsDb.selectDistinct({ brand: products.brand }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true)),
    cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name),
  ]);
  return { brands: brands.flatMap(({ brand }) => brand ? [brand] : []), categories: categoriesList };
}

export async function getCatalogProductCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(products).where((await import('drizzle-orm')).eq(products.inStock, true));
  return count;
}

export async function getCatalogCategoryCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(categories);
  return count;
}

export async function getFeaturedProductSlugs() {
  return cmsDb.select({ slug: products.slug }).from(products).where((await import('drizzle-orm')).eq(products.isFeatured, true));
}

export async function getCatalogBreadcrumb(slug: string) {
  const { eq } = await import('drizzle-orm');
  const [category] = await cmsDb.select({ name: categories.name, slug: categories.slug }).from(categories).where(eq(categories.slug, slug)).limit(1);
  return category ?? null;
}

export async function getCmsRuntimeConfig() {
  return `pglite://${resolvePgliteDataDir()}`;
}

export async function getCatalogProduct(id: string) {
  const [product] = await cmsDb.select().from(products).where((await import('drizzle-orm')).eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getPublicCategories() {
  return cmsDb.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getPublicFeaturedProducts() {
  return cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id)).where((await import('drizzle-orm')).and((await import('drizzle-orm')).eq(products.isFeatured, true), (await import('drizzle-orm')).eq(products.inStock, true))).orderBy((await import('drizzle-orm')).desc(products.createdAt)).limit(8);
}

export async function getProductDetails(slug: string) {
  const { eq } = await import('drizzle-orm');
  const [row] = await cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCatalogLastModified() {
  const [{ updatedAt }] = await cmsDb.select({ updatedAt: (await import('drizzle-orm')).max(products.updatedAt) }).from(products);
  return updatedAt ?? new Date();
}

export async function getCatalogPageData() {
  const [categoriesList, productsList] = await Promise.all([
    getPublicCategories(),
    getPublishedCatalog(),
  ]);
  return { categories: categoriesList, products: productsList };
}

export async function getAdminSettings() {
  const [siteTitle, siteDescription] = await Promise.all([getCmsSetting('site_title'), getCmsSetting('site_description')]);
  return { siteTitle: siteTitle ?? 'Juragan Kompresor', siteDescription: siteDescription ?? 'Distributor HVAC resmi sejak 2008 di Kawasan MM2100 Bekasi.' };
}

export async function getArticleTotalCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles);
  return count;
}

export async function getPublicArticleTotalCount() {
  const [{ count }] = await cmsDb.select({ count: (await import('drizzle-orm')).count() }).from(cmsArticles).where((await import('drizzle-orm')).eq(cmsArticles.status, 'published'));
  return count;
}

export async function getCmsRecentArticles(limit = 5) {
  return cmsDb.select().from(cmsArticles).orderBy((await import('drizzle-orm')).desc(cmsArticles.updatedAt)).limit(limit);
}

export async function getCmsSettings() {
  return cmsDb.select().from(cmsSettings);
}

export async function getCmsDashboardData() {
  const [counts, articles, settings, productsList, categoriesList] = await Promise.all([
    getAdminOverview(), getCmsRecentArticles(5), getAdminSettings(), getAdminProducts(), getAdminCategories(),
  ]);
  return { counts, articles, settings, products: productsList, categories: categoriesList };
}

export async function getAdminCatalog() {
  const [productsList, categoriesList] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return { products: productsList, categories: categoriesList };
}

export async function getCatalogProductsPage(
  query: string,
  categorySlug: string,
  pageSize: number,
  offset: number,
) {
  const { and, count, eq, ilike, or } = await import('drizzle-orm');
  const predicates = [eq(products.inStock, true)];
  const normalizedQuery = query.trim().slice(0, 100);
  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replace(/[\\%_]/g, '\\$&');
    const search = `%${escapedQuery}%`;
    predicates.push(or(
      ilike(products.name, search),
      ilike(products.model, search),
      ilike(products.brand, search),
      ilike(products.shortDesc, search),
    )!);
  }
  if (categorySlug) {
    predicates.push(eq(categories.slug, categorySlug));
  }

  const where = and(...predicates);
  const [rows, [{ total }]] = await Promise.all([
    cmsDb.select({ product: products, category: { name: categories.name, slug: categories.slug } })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(products.name)
      .limit(Math.min(Math.max(pageSize, 1), 48))
      .offset(Math.max(offset, 0)),
    cmsDb.select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  return { products: rows, total: Number(total) };
}

export async function getAdminProductsPage(query: string, pageSize: number, offset: number) {
  const { count, ilike, or } = await import('drizzle-orm');
  const normalizedQuery = query.trim().slice(0, 100);
  const escapedQuery = normalizedQuery.replace(/[\\%_]/g, '\\$&');
  const search = `%${escapedQuery}%`;
  const where = normalizedQuery
    ? or(
        ilike(products.name, search),
        ilike(products.model, search),
        ilike(products.brand, search),
        ilike(products.shortDesc, search),
      )
    : undefined;
  const [rows, [{ total }]] = await Promise.all([
    cmsDb.select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id))
      .where(where)
      .orderBy((await import('drizzle-orm')).desc(products.updatedAt), products.name)
      .limit(Math.min(Math.max(pageSize, 1), 100))
      .offset(Math.max(offset, 0)),
    cmsDb.select({ total: count() }).from(products).where(where),
  ]);

  return { products: rows, total: Number(total) };
}

export async function getHomepageCatalogPreview() {
  return cmsDb.select({
    product: products,
    category: { id: categories.id, name: categories.name, slug: categories.slug },
  })
    .from(products)
    .innerJoin(categories, (await import('drizzle-orm')).eq(products.categoryId, categories.id))
    .where((await import('drizzle-orm')).eq(products.inStock, true))
    .orderBy((await import('drizzle-orm')).desc(products.createdAt), products.name)
    .limit(48);
}
