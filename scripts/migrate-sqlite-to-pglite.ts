/**
 * MIGRASI DATA: SQLite (Prisma) → PostgreSQL (PGlite)
 * Memindahkan kategori, produk, dan testimoni original ke database utama website.
 */
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { PrismaClient } from '@prisma/client';

const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
const prisma = new PrismaClient();

function ts(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

async function main() {
  console.log(`🔌 PGlite: ${dataDir}`);
  const db = new PGlite(dataDir);

  // Cegah duplikasi saat migrasi diulang
  await db.exec('DELETE FROM products; DELETE FROM categories; DELETE FROM testimonials;');

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  const products = await prisma.product.findMany();
  const testimonials = await prisma.testimonial.findMany();

  console.log(`📦 Sumber: ${categories.length} kategori, ${products.length} produk, ${testimonials.length} testimoni`);

  for (const c of categories) {
    await db.query(
      `INSERT INTO categories (id, name, slug, description, image, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [c.id, c.name, c.slug, c.description, c.image, c.sortOrder, ts(c.createdAt), ts(c.updatedAt)],
    );
  }

  let inserted = 0;
  for (const p of products) {
    await db.query(
      `INSERT INTO products (id, name, slug, description, short_desc, price, original_price, category_id, brand, model, specifications, images, in_stock, is_featured, is_new, min_order, unit, view_count, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        p.id, p.name, p.slug, p.description, p.shortDesc, p.price, p.originalPrice,
        p.categoryId, p.brand, p.model, p.specifications, p.images,
        p.inStock, p.isFeatured, p.isNew, p.minOrder, p.unit, p.viewCount,
        ts(p.createdAt), ts(p.updatedAt),
      ],
    );
    inserted++;
  }

  for (const t of testimonials) {
    await db.query(
      `INSERT INTO testimonials (id, name, company, position, content, rating, avatar, is_approved, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [t.id, t.name, t.company, t.position, t.content, t.rating, t.avatar, t.isApproved, ts(t.createdAt)],
    );
  }

  const [{ count: productCount }] = (await db.query<{ count: number }>('SELECT count(*)::int AS count FROM products')).rows;
  const [{ count: categoryCount }] = (await db.query<{ count: number }>('SELECT count(*)::int AS count FROM categories')).rows;
  console.log(`✅ Migrasi selesai → PGlite: ${categoryCount} kategori, ${productCount} produk, ${testimonials.length} testimoni`);

  await prisma.$disconnect();
  db.close();
}

main().catch((error) => {
  console.error('❌ Migrasi gagal:', error);
  process.exit(1);
});
