import { createHash } from 'node:crypto';
import { Pool } from 'pg';

const CATALOG_URL = 'https://products.embraco.com/compressors';
const GRAPH_URL = 'https://mpgujzzqph.us-east-1.awsapprunner.com/graph';
const TARGET_COUNT = 1_000;
const IMAGE_BASE_URL = 'https://em00db0003.s3.amazonaws.com/thumbs_compressor';
const QUERY = `
  query CompressorsQuery($measurement: MeasurementSystem!, $unit: UnitSystem) {
    compressorsList(measurement: $measurement) {
      CAP(unit: $unit)
      COP(unit: $unit)
      photo
      test_application
      standard
      refrigerant
      starting_torque
      motor_type
      regionsList
      displacement(measurement_system: $measurement)
      displacement_m3_h(measurement_system: $measurement)
      displacement_cm3_rev(measurement_system: $measurement)
      displacement_trusted(measurement_system: $measurement)
      power_supply
      power_supply_filtered
      technology
      application
      horse_power_label
      horse_power
      family
      model
      type
      bareList
      rotation
      rotation_trusted
      kit
    }
  }
`;

type Compressor = {
  CAP?: (number | null)[] | null;
  COP?: (number | null)[] | null;
  photo?: string | null;
  test_application?: string | null;
  standard?: string | null;
  refrigerant?: string | null;
  starting_torque?: string | null;
  motor_type?: string | null;
  regionsList?: string[][] | null;
  displacement?: string | null;
  displacement_m3_h?: string | null;
  displacement_cm3_rev?: string | null;
  displacement_trusted?: string | null;
  power_supply?: string | null;
  power_supply_filtered?: string[] | null;
  technology?: string | null;
  application?: string | null;
  horse_power_label?: string | null;
  horse_power?: number | null;
  family?: string | null;
  model?: string | null;
  type?: string | null;
  bareList?: string[] | null;
  rotation?: string[] | null;
  rotation_trusted?: string[] | null;
  kit?: string[] | null;
};

function stableHash(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 20);
}

function slugPart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function text(value: string | null | undefined) {
  return value?.trim() || 'Tidak dicantumkan pada katalog resmi';
}

function arrayText(value: string[] | null | undefined) {
  const uniqueValues = value ? [...new Set(value)] : [];
  return uniqueValues.length ? uniqueValues.join(', ') : 'Tidak dicantumkan pada katalog resmi';
}

function preferenceScore(row: Compressor) {
  const supply = row.power_supply?.toLowerCase() ?? '';
  return (
    (supply.includes('50 hz') ? 8 : 0) +
    (/(220|230|240)/.test(supply) ? 5 : 0) +
    (row.standard?.toLowerCase() === 'ashrae' ? 3 : 0) +
    (row.test_application === row.application ? 1 : 0)
  );
}

function categoryFor(row: Compressor) {
  const type = text(row.type);
  const slug = `kompresor-${slugPart(type) || 'refrigerasi'}`;
  return {
    id: `category-${stableHash(slug)}`,
    name: `Kompresor ${type}`,
    slug,
    description: `Katalog referensi kompresor ${type.toLowerCase()} dari Embraco. Spesifikasi model mengikuti katalog resmi produsen; konfirmasi kompatibilitas dan ketersediaan sebelum pemesanan.`,
    image: row.photo ? `${IMAGE_BASE_URL}/${row.photo.toLowerCase()}.jpg` : null,
    sortOrder: 20,
  };
}

function productFor(row: Compressor, categoryId: string) {
  const model = text(row.model);
  const refrigerant = text(row.refrigerant);
  const supply = text(row.power_supply);
  const key = [model, refrigerant, supply].join('|');
  const slug = `embraco-${slugPart(key)}-${stableHash(key)}`;
  const capacityValues = [...new Set(row.CAP?.filter((value): value is number => value !== null) ?? [])];
  const copValues = [...new Set(row.COP?.filter((value): value is number => value !== null) ?? [])];
  const type = text(row.type);
  const family = text(row.family);
  const photo = row.photo
    ? `${IMAGE_BASE_URL}/${row.photo.toLowerCase()}.jpg`
    : null;
  const sourceSpecs = {
    family,
    compressor_type: type,
    technology: text(row.technology),
    refrigerant,
    power_supply: supply,
    horsepower: text(row.horse_power_label),
    capacity_values_w: capacityValues.length ? capacityValues.join(', ') : 'Tidak dicantumkan pada katalog resmi',
    cop_values: copValues.length ? copValues.join(', ') : 'Tidak dicantumkan pada katalog resmi',
    displacement: text(row.displacement_trusted ?? row.displacement),
    displacement_m3_h: text(row.displacement_m3_h),
    displacement_cm3_rev: text(row.displacement_cm3_rev),
    application: text(row.application),
    test_application: text(row.test_application),
    test_standard: text(row.standard),
    motor_type: text(row.motor_type),
    starting_torque: text(row.starting_torque),
    regional_listing: arrayText(row.regionsList?.flat()),
    rotation: arrayText(row.rotation_trusted ?? row.rotation),
    bare_part_numbers: arrayText(row.bareList),
    kit: arrayText(row.kit),
    _sourceName: 'Embraco Product Selector (PSS)',
    _sourceUrl: CATALOG_URL,
  };
  const displaySupply = supply === 'Tidak dicantumkan pada katalog resmi' ? '' : ` · ${supply}`;
  const description = `Kompresor ${type.toLowerCase()} Embraco model ${model}, tercantum pada katalog resmi produsen. Katalog mencantumkan refrigeran ${refrigerant} dan catu daya ${supply}.${capacityValues.length ? ` Nilai kapasitas tercatat pada selector (W): ${capacityValues.join(', ')}.` : ''} Kinerja aktual bergantung pada kondisi pengujian dan sistem. Periksa kecocokan refrigeran, kelistrikan, dan aplikasi sebelum memesan.`;

  return {
    id: `embraco-${stableHash(key)}`,
    name: `Embraco ${model} · ${refrigerant}${displaySupply}`,
    slug,
    description,
    short_desc: `${model} · ${type} · ${refrigerant} · ${supply}`.slice(0, 320),
    price: 0,
    original_price: null,
    category_id: categoryId,
    brand: 'Embraco',
    model,
    specifications: JSON.stringify(sourceSpecs),
    images: photo,
    in_stock: true,
    is_featured: false,
    is_new: false,
    min_order: 1,
    unit: 'unit',
    view_count: 0,
  };
}

async function loadOfficialCatalog() {
  const response = await fetch(GRAPH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      operationName: 'CompressorsQuery',
      variables: { measurement: 'metric', unit: 'w' },
      query: QUERY,
    }),
  });

  if (!response.ok) throw new Error(`Katalog resmi merespons HTTP ${response.status}.`);
  const result = await response.json() as {
    data?: { compressorsList?: Compressor[] };
    errors?: { message: string }[];
  };
  if (result.errors?.length) {
    throw new Error(result.errors.map(({ message }) => message).join('; '));
  }
  if (!result.data?.compressorsList) throw new Error('Daftar kompresor tidak ditemukan pada respons katalog resmi.');
  return result.data.compressorsList;
}

async function main() {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error('POSTGRES_URL atau DATABASE_URL belum tersedia.');

  const sourceRows = await loadOfficialCatalog();
  const variants = new Map<string, Compressor>();
  for (const row of sourceRows) {
    if (!row.model || !row.refrigerant || !row.power_supply || !row.photo) continue;
    const key = [row.model, row.refrigerant, row.power_supply].join('|');
    const current = variants.get(key);
    if (!current || preferenceScore(row) > preferenceScore(current)) variants.set(key, row);
  }

  const selected = [...variants.entries()]
    .sort(([keyA, rowA], [keyB, rowB]) => preferenceScore(rowB) - preferenceScore(rowA) || keyA.localeCompare(keyB))
    .slice(0, TARGET_COUNT);
  if (selected.length < TARGET_COUNT) {
    throw new Error(`Katalog hanya menyediakan ${selected.length} kombinasi unik; impor dibatalkan tanpa menulis data.`);
  }

  const categoryMap = new Map<string, ReturnType<typeof categoryFor>>();
  for (const [, row] of selected) {
    const category = categoryFor(row);
    categoryMap.set(category.slug, category);
  }

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const category of categoryMap.values()) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, image, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [category.id, category.name, category.slug, category.description, category.image, category.sortOrder],
      );
    }

    const categorySlugs = [...categoryMap.keys()];
    const categoryRows = await client.query<{ id: string; slug: string }>(
      'SELECT id, slug FROM categories WHERE slug = ANY($1::text[])',
      [categorySlugs],
    );
    const categoryIds = new Map(categoryRows.rows.map(({ id, slug }) => [slug, id]));
    const products = selected.map(([, row]) => {
      const category = categoryFor(row);
      const categoryId = categoryIds.get(category.slug);
      if (!categoryId) throw new Error(`Kategori ${category.slug} tidak tersimpan.`);
      return productFor(row, categoryId);
    });

    let upserted = 0;
    const columns = [
      'id', 'name', 'slug', 'description', 'short_desc', 'price', 'original_price',
      'category_id', 'brand', 'model', 'specifications', 'images', 'in_stock',
      'is_featured', 'is_new', 'min_order', 'unit', 'view_count', 'created_at', 'updated_at',
    ];
    const batchSize = 200;
    for (let start = 0; start < products.length; start += batchSize) {
      const batch = products.slice(start, start + batchSize);
      const values = batch.flatMap((product) => [
        product.id, product.name, product.slug, product.description, product.short_desc,
        product.price, product.original_price, product.category_id, product.brand,
        product.model, product.specifications, product.images, product.in_stock,
        product.is_featured, product.is_new, product.min_order, product.unit,
        product.view_count, new Date(), new Date(),
      ]);
      const placeholders = batch.map((_, rowIndex) => {
        const offset = rowIndex * columns.length;
        return `(${columns.map((__, columnIndex) => `$${offset + columnIndex + 1}`).join(', ')})`;
      });
      const result = await client.query(
        `INSERT INTO products (${columns.join(', ')}) VALUES ${placeholders.join(', ')}
         ON CONFLICT (slug) DO UPDATE SET specifications = EXCLUDED.specifications, images = EXCLUDED.images, updated_at = NOW()`,
        values,
      );
      upserted += result.rowCount ?? 0;
    }

    await client.query('COMMIT');
    const totals = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM products
       WHERE brand = 'Embraco' AND images LIKE $1`,
      [`${IMAGE_BASE_URL}/%`],
    );
    console.log(JSON.stringify({
      officialSourceRecords: sourceRows.length,
      uniqueModelRefrigerantPowerVariants: variants.size,
      requestedCatalogListings: products.length,
      upsertedThisRun: upserted,
      matchingEmbracoListings: Number(totals.rows[0]?.count ?? 0),
      categories: categoryMap.size,
      officialSource: CATALOG_URL,
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('Impor katalog Embraco dibatalkan:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
