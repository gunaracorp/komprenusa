/**
 * INISIALISASI SKEMA POSTGRES (PGlite)
 * Membuat seluruh tabel yang dibutuhkan website Juragan Kompresor.
 * Aman dijalankan berulang (IF NOT EXISTS).
 */
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');

async function main() {
  console.log(`🔌 Membuka PGlite di: ${dataDir}`);
  const db = new PGlite(dataDir);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      short_desc TEXT,
      price DOUBLE PRECISION NOT NULL,
      original_price DOUBLE PRECISION,
      category_id TEXT NOT NULL REFERENCES categories(id),
      brand TEXT,
      model TEXT,
      specifications TEXT,
      images TEXT,
      in_stock BOOLEAN NOT NULL DEFAULT true,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_new BOOLEAN NOT NULL DEFAULT false,
      min_order INTEGER NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'unit',
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
    CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
    CREATE INDEX IF NOT EXISTS products_featured_idx ON products(is_featured);

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      position TEXT,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL,
      avatar TEXT,
      is_approved BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cms_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT,
      seo_title TEXT NOT NULL,
      seo_description TEXT NOT NULL,
      status TEXT NOT NULL,
      author_name TEXT NOT NULL,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT,
      seo_title TEXT NOT NULL,
      seo_description TEXT NOT NULL,
      status TEXT NOT NULL,
      author_name TEXT NOT NULL,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cms_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS product_image_assets (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL,
      source_file_id TEXT NOT NULL,
      source_path TEXT NOT NULL,
      source_path_lower TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes BIGINT NOT NULL,
      revision TEXT,
      provider_content_hash TEXT,
      source_modified_at TIMESTAMPTZ,
      rights_status TEXT NOT NULL,
      rights_basis TEXT,
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      source_deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      processing_status TEXT NOT NULL DEFAULT 'DISCOVERED',
      image_sha256 TEXT,
      perceptual_hash TEXT,
      width INTEGER,
      height INTEGER,
      storage_path TEXT,
      product_id TEXT,
      processing_error TEXT,
      processed_at TIMESTAMPTZ,
      quality_score DOUBLE PRECISION,
      watermark_status TEXT NOT NULL DEFAULT 'NOT_APPLIED',
      watermark_version TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS product_image_assets_owner_source_unique
      ON product_image_assets(owner_user_id, source_file_id);
  `);

  const tables = await db.query<{ table_name: string }>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name",
  );
  console.log(`✅ Skema siap. Tabel: ${tables.rows.map((r) => r.table_name).join(', ')}`);
  db.close();
}

main().catch((error) => {
  console.error('❌ Gagal inisialisasi skema:', error);
  process.exit(1);
});
