/**
 * ============================================================================
 * SUPER GENERATOR KATALOG KOMPRESOR — 500 PRODUK BARU
 * ============================================================================
 * Menghasilkan 500 produk kompresor AC dengan:
 *  1. Data realistis (brand, model, tipe, refrigerant, HP, harga IDR)
 *  2. Deskripsi SEO unik per produk (keyword-rich, siap top-ranking Google)
 *  3. Spesifikasi teknis lengkap (JSON)
 *  4. GAMBAR UNIK per produk — turunan AI base image + badge brand via sharp
 *  5. Langsung insert ke PostgreSQL (PGlite)
 */
import path from 'node:path';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import sharp from 'sharp';

// ============================================================================
// UTIL
// ============================================================================
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20250101);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const between = (min: number, max: number) => Math.round(min + rand() * (max - min));

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('&', 'dan')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// DATA DASAR — BRAND, WARNA, FAMILI KOMPRESOR
// ============================================================================
type Brand = { name: string; color: [number, number, number]; modelPrefix: string[] };

const BRANDS: Brand[] = [
  { name: 'Copeland', color: [20, 60, 80], modelPrefix: ['ZB', 'ZF', 'ZP', 'CR', 'QR'] },
  { name: 'Daikin', color: [0, 120, 130], modelPrefix: ['JT', 'JK', '3D', '2R', '1R'] },
  { name: 'Panasonic', color: [25, 55, 110], modelPrefix: ['2RS', '2KS', '2VR', '2AD'] },
  { name: 'Mitsubishi', color: [180, 30, 30], modelPrefix: ['JH', 'CB', 'RH', 'MB'] },
  { name: 'LG', color: [165, 25, 55], modelPrefix: ['QK', 'QL', 'QG'] },
  { name: 'Gree', color: [40, 110, 60], modelPrefix: ['QX', 'PH', 'GX'] },
  { name: 'Hitachi', color: [190, 40, 40], modelPrefix: ['E', '503', 'AC'] },
  { name: 'Toshiba', color: [190, 30, 30], modelPrefix: ['PH', 'DA', 'TA'] },
  { name: 'Samsung', color: [30, 50, 100], modelPrefix: ['2R', '2S', '1S'] },
  { name: 'Sanyo', color: [230, 90, 20], modelPrefix: ['C', 'S', 'SC'] },
  { name: 'Danfoss', color: [35, 65, 90], modelPrefix: ['SH', 'SM', 'SY', 'MT', 'MN'] },
  { name: 'Frascold', color: [70, 70, 75], modelPrefix: ['A', 'B', 'D', 'S'] },
  { name: 'Bitzer', color: [35, 90, 140], modelPrefix: ['4T', '4P', '6T', 'OSK'] },
  { name: 'Fusheng', color: [30, 100, 90], modelPrefix: ['S', 'F', 'SH'] },
  { name: 'Tecumseh', color: [150, 40, 40], modelPrefix: ['AE', 'FH', 'TH', 'TFH'] },
  { name: 'Dorin', color: [190, 100, 20], modelPrefix: ['H', 'T', 'CD'] },
  { name: 'Maneurop', color: [40, 90, 70], modelPrefix: ['MT', 'MN', 'NT', 'MTZ'] },
  { name: 'Kulthorn', color: [90, 60, 30], modelPrefix: ['W', 'AX', 'KX'] },
  { name: 'Refcomp', color: [60, 70, 90], modelPrefix: ['SP', 'SZ', 'SR'] },
  { name: 'GMCC', color: [30, 90, 120], modelPrefix: ['PH', 'PS', 'TQ'] },
  { name: 'Highly', color: [50, 100, 50], modelPrefix: ['PH', 'QX', 'SL'] },
  { name: 'Bristol', color: [70, 60, 110], modelPrefix: ['H2', 'H7', 'H2C'] },
  { name: 'Carrier', color: [20, 90, 160], modelPrefix: ['06D', '06E', '06N'] },
  { name: 'Trane', color: [30, 30, 30], modelPrefix: ['CH', 'SC', 'S'] },
  { name: 'York', color: [140, 30, 30], modelPrefix: ['Y', 'SD', 'SK'] },
];

type Family = {
  key: string;
  label: string;                 // untuk badge & nama
  baseImage: string;             // file dasar AI
  altImage?: string;             // base alternatif untuk variasi
  catSlug: string;               // sub-kategori unik di situs
  catName: string;
  catDesc: string;
  quota: number;                 // jumlah produk
  hp: [number, number];          // rentang HP
  hpStep: number;
  refrigerants: string[];
  pricePerHp: [number, number];  // rentang harga per HP (IDR)
  applications: string;
  teknologi: string;
  oilTypes: string[];
  unit: string;
  minOrder: number;
};

const FAMILIES: Family[] = [
  {
    key: 'rotary', label: 'Kompresor Rotary', baseImage: 'rotary-1pk.png', quota: 125,
    catSlug: 'kompresor-rotary', catName: 'Kompresor Rotary',
    catDesc: 'Jual kompresor rotary AC 0.5–3 HP original untuk AC split & casette. Brand Copeland, Daikin, Panasonic, LG, Gree, GMCC. Harga distributor, garansi resmi, kirim seluruh Indonesia.',
    hp: [0.5, 3], hpStep: 0.5, refrigerants: ['R32', 'R410A', 'R22', 'R290'],
    pricePerHp: [900_000, 1_600_000], applications: 'AC split dinding, AC casette, AC standing floor',
    teknologi: 'Rotary Single / Twin Blade', oilTypes: ['POE VG68', 'Mineral SUNISO 4GSD', 'POE VG55'],
    unit: 'pcs', minOrder: 1,
  },
  {
    key: 'twin-rotary', label: 'Kompresor Twin Rotary', baseImage: 'twin-rotary.png', altImage: 'dc-inverter.png', quota: 45,
    catSlug: 'kompresor-twin-rotary', catName: 'Kompresor Twin Rotary',
    catDesc: 'Kompresor twin rotary 2–8 HP untuk AC multi split, VRF mini, dan AC duct. Teknologi inverter hemat energi — ready stock distributor HVAC resmi Bekasi.',
    hp: [2, 8], hpStep: 0.5, refrigerants: ['R410A', 'R32', 'R22'],
    pricePerHp: [1_200_000, 1_900_000], applications: 'AC multi split, VRF mini, AC duct, AC standing besar',
    teknologi: 'Twin Rotary Inverter', oilTypes: ['POE VG68', 'PVE VG68'],
    unit: 'pcs', minOrder: 1,
  },
  {
    key: 'dc-inverter', label: 'Kompresor DC Inverter', baseImage: 'dc-inverter.png', quota: 60,
    catSlug: 'kompresor-dc-inverter', catName: 'Kompresor DC Inverter',
    catDesc: 'Kompresor DC inverter BLDC 0.75–5 HP refrigerant R32/R410A. Hemat listrik hingga 60%, suara halus, original bergaransi. Distributor resmi HVAC Indonesia.',
    hp: [0.75, 5], hpStep: 0.25, refrigerants: ['R32', 'R410A'],
    pricePerHp: [1_400_000, 2_200_000], applications: 'AC inverter split, AC multi split inverter, AC casette inverter',
    teknologi: 'DC Inverter BLDC', oilTypes: ['PVE VG68', 'POE VG68'],
    unit: 'pcs', minOrder: 1,
  },
  {
    key: 'scroll', label: 'Kompresor Scroll', baseImage: 'scroll-small.png', quota: 110,
    catSlug: 'kompresor-scroll', catName: 'Kompresor Scroll',
    catDesc: 'Kompresor scroll 3–30 HP untuk AC casette, duct, rooftop, dan chiller mini. Copeland, Danfoss, Daikin, Hitachi original. Harga terbaik distributor HVAC.',
    hp: [3, 30], hpStep: 0.5, refrigerants: ['R410A', 'R22', 'R32', 'R407C'],
    pricePerHp: [1_500_000, 2_400_000], applications: 'AC casette, AC duct, chiller mini, Rooftop packaged, AC standing komersial',
    teknologi: 'Scroll Orbiting-Fixed Scroll', oilTypes: ['POE VG68', 'POE VG100', 'PVE VG68'],
    unit: 'unit', minOrder: 1,
  },
  {
    key: 'scroll-commercial', label: 'Kompresor Scroll Komersial', baseImage: 'scroll-large.png', altImage: 'centrifugal.png', quota: 35,
    catSlug: 'kompresor-scroll-komersial', catName: 'Kompresor Scroll Komersial',
    catDesc: 'Kompresor scroll komersial 10–60 HP untuk chiller air-cooled, rooftop besar, dan cold room. Unit original bergaransi — konsultasi kapasitas gratis.',
    hp: [10, 60], hpStep: 2.5, refrigerants: ['R410A', 'R407C', 'R134a', 'R22'],
    pricePerHp: [1_800_000, 3_200_000], applications: 'Chiller air-cooled, Rooftop besar, cold room komersial, Water-cooled packaged',
    teknologi: 'Scroll Two-Stage Compliant', oilTypes: ['POE VG68', 'POE VG100'],
    unit: 'unit', minOrder: 1,
  },
  {
    key: 'recip-hermetic', label: 'Kompresor Piston Hermetik', baseImage: 'reciprocating-small.png', quota: 50,
    catSlug: 'kompresor-piston-hermetik', catName: 'Kompresor Piston Hermetik',
    catDesc: 'Kompresor piston hermetik 0.5–3 HP untuk showcase, chiller minuman, dan freezer komersial. Refrigerant R134a/R404A/R600a ready stock.',
    hp: [0.5, 3], hpStep: 0.25, refrigerants: ['R134a', 'R22', 'R404A', 'R600a'],
    pricePerHp: [850_000, 1_500_000], applications: 'Showcase, chiller minuman, freezer chest, refrigerator komersial',
    teknologi: 'Reciprocating Hermetik', oilTypes: ['Mineral SUNISO 3GSD', 'POE VG55'],
    unit: 'pcs', minOrder: 1,
  },
  {
    key: 'semi-hermetic', label: 'Kompresor Semi-Hermetik', baseImage: 'semi-hermetic.png', altImage: 'heavy-industrial.png', quota: 40,
    catSlug: 'kompresor-semi-hermetik', catName: 'Kompresor Semi-Hermetik',
    catDesc: 'Kompresor semi-hermetik 5–40 HP serviceable untuk cold storage, blast freezer, dan ruang pendingin industri. Bitzer, Frascold, Dorin, Carrier original.',
    hp: [5, 40], hpStep: 2.5, refrigerants: ['R404A', 'R134a', 'R507', 'R22'],
    pricePerHp: [2_500_000, 4_500_000], applications: 'Cold storage, blast freezer, ruang pendingin industri, ice plant',
    teknologi: 'Reciprocating Semi-Hermetik Serviceable', oilTypes: ['POE VG100', 'Mineral SUNISO 5GSD'],
    unit: 'unit', minOrder: 1,
  },
  {
    key: 'screw', label: 'Kompresor Screw Industri', baseImage: 'screw-compressor.png', altImage: 'heavy-industrial.png', quota: 20,
    catSlug: 'kompresor-screw', catName: 'Kompresor Screw Industri',
    catDesc: 'Kompresor screw industri 40–220 HP untuk chiller sentral, cold storage besar, dan industri pangan-farmasi. Twin screw semi-hermetik efisiensi maksimal.',
    hp: [40, 220], hpStep: 10, refrigerants: ['R134a', 'R404A', 'R507', 'R717'],
    pricePerHp: [3_500_000, 6_500_000], applications: 'Chiller sentral, cold storage besar, industri pangan & farmasi, porter parkir',
    teknologi: 'Twin Screw Semi-Hermetik', oilTypes: ['POE VG170', 'POE VG220'],
    unit: 'unit', minOrder: 1,
  },
  {
    key: 'condensing', label: 'Unit Kondensor Kompak', baseImage: 'condensing-unit.png', quota: 15,
    catSlug: 'unit-kondensor-kompak', catName: 'Unit Kondensor Kompak',
    catDesc: 'Condensing unit kompak 1–20 HP preassembled untuk cold room, showcase supermarket, dan ruang server. Instalasi cepat, efisiensi tinggi.',
    hp: [1, 20], hpStep: 1, refrigerants: ['R410A', 'R22', 'R404A', 'R134a'],
    pricePerHp: [1_800_000, 2_800_000], applications: 'Cold room kecil, showcase supermarket, ruang server, proses industri',
    teknologi: 'Condensing Unit Preassembled', oilTypes: ['POE VG68', 'POE VG100'],
    unit: 'set', minOrder: 1,
  },
];

const TOTAL_QUOTA = FAMILIES.reduce((s, f) => s + f.quota, 0); // = 555 → dipotong 500

const CITIES = ['Jakarta', 'Bekasi', 'Surabaya', 'Semarang', 'Medan', 'Makassar', 'Bandung', 'Palembang'];
const REGIONS = 'Indonesia';

// ============================================================================
// GENERATOR PRODUK
// ============================================================================
type NewProduct = {
  name: string; slug: string; description: string; shortDesc: string;
  price: number; originalPrice: number; categoryId: string; brand: string; model: string;
  specifications: string; images: string; inStock: boolean; isFeatured: boolean; isNew: boolean;
  minOrder: number; unit: string;
  _hp: number; _familyKey: string;
};

function hpLabel(hp: number): string {
  return `${hp} HP`;
}
function pkFromHp(hp: number): number {
  return Math.round(hp * 0.976 * 100) / 100;
}
function btuFromHp(hp: number): number {
  return Math.round((hp * 9000) / 100) * 100;
}
function displacement(hp: number, family: string): string {
  const base = hp * (family === 'scroll' || family === 'scroll-commercial' ? 16 : family === 'screw' ? 24 : 10);
  return `${(base * (0.9 + rand() * 0.2)).toFixed(1)}`;
}
function copValue(hp: number): string {
  return (2.8 + Math.min(hp, 30) * 0.012 + rand() * 0.35).toFixed(2);
}

function buildDescription(p: {
  brand: string; label: string; hp: number; refrigerant: string; applications: string;
  model: string; teknologi: string;
}): string {
  const city = pick(CITIES);
  const openers = [
    `Jual ${p.label} ${p.brand} ${hpLabel(p.hp)} original dengan refrigerant ${p.refrigerant} — ready stock di gudang PT Kompresa, Kawasan Industri MM2100 Bekasi.`,
    `${p.label} ${p.brand} model ${p.model} berkapasitas ${hpLabel(p.hp)} dengan refrigerant ${p.refrigerant} kini tersedia untuk pengiriman ke seluruh ${REGIONS}.`,
    `Cari ${p.label} ${p.brand} ${hpLabel(p.hp)} refrigerant ${p.refrigerant}? Kami distributor HVAC resmi sejak 2010 dengan harga distributor termurah dan garansi resmi.`,
    `${p.label} ${p.brand} ${hpLabel(p.hp)} untuk ${p.applications} — unit original 100%, dikirim dari Bekasi ke ${city} dan 34 provinsi ${REGIONS}.`,
    `Distributor ${p.label} ${p.brand} ${hpLabel(p.hp)} refrigerant ${p.refrigerant} terlengkap di ${REGIONS}. Harga spesial untuk kontraktor, developer, dan reseller HVAC.`,
  ];
  const mids = [
    `Kompresor ini menggunakan teknologi ${p.teknologi} yang menghasilkan pendinginan maksimal dengan konsumsi daya efisien serta operating noise rendah — ideal untuk ${p.applications}.`,
    `Dengan teknologi ${p.teknologi}, unit ini memberikan performa pendinginan stabil, torsi start kuat, dan daya tahan tinggi untuk aplikasi ${p.applications}.`,
    `Teknologi ${p.teknologi} menjamin COP tinggi, getaran minimal, serta umur pakai panjang — pilihan tepat untuk ${p.applications} proyek Anda.`,
    `Dirancang dengan ${p.teknologi}, kompresor ini unggul dalam efisiensi energi, keandalan 24/7, dan kemudahan perawatan untuk ${p.applications}.`,
  ];
  const closers = [
    `Tersedia garansi resmi, invoice pajak, dukungan teknis purnajual, dan layanan konsultasi kapasitas gratis. Hubungi tim sales kami untuk harga terbaik dan pengiriman cepat ke ${city} dan kota besar lainnya.`,
    `Setiap unit melalui quality control ketat sebelum dikirim. Dapatkan harga grosir, garansi resmi distributor, serta pengiriman aman ke ${city}, Surabaya, Semarang, dan seluruh ${REGIONS}.`,
    `Stok selalu tersedia untuk kebutuhan proyek dan operasional. Nikmati harga kompetitif, garansi resmi, serta support engineering dari tim berpengalaman lebih dari 15 tahun di industri HVAC ${REGIONS}.`,
    `Kami melayani pembelian satuan hingga kontainer untuk proyek hotel, apartemen, mal, rumah sakit, dan pabrik di seluruh ${REGIONS}. Konsultasikan kebutuhan Anda sekarang — respons cepat di hari kerja.`,
  ];
  return `${pick(openers)} ${pick(mids)} ${pick(closers)}`;
}

function buildProducts(catIdByFamily: Map<string, string>): NewProduct[] {
  const products: NewProduct[] = [];
  const usedSlugs = new Set<string>(['dup-guard']);

  for (const family of FAMILIES) {
    for (let i = 0; i < family.quota && products.length < 500; i++) {
      const brand = BRANDS[(i * 7 + family.quota) % BRANDS.length]!;
      const steps = Math.round((family.hp[1] - family.hp[0]) / family.hpStep);
      const hp = Math.round((family.hp[0] + (i % (steps + 1)) * family.hpStep) * 100) / 100;
      const refrigerant = family.refrigerants[i % family.refrigerants.length]!;
      const prefix = brand.modelPrefix[(i + family.quota) % brand.modelPrefix.length]!;
      const modelCode = `${prefix}${Math.floor(hp * 10)}${String(between(10, 99))}${refrigerant.replace('R', '')}`;

      let slug = slugify(`${brand.name}-${prefix}${modelCode.slice(prefix.length)}-${hpLabel(hp)}-${refrigerant}`);
      let suffix = 2;
      while (usedSlugs.has(slug)) slug = `${slug}-${suffix++}`;
      usedSlugs.add(slug);

      const pk = pkFromHp(hp);
      const basePrice = Math.round((family.pricePerHp[0] + rand() * (family.pricePerHp[1] - family.pricePerHp[0])) * hp / 1000) * 1000;
      const price = Math.max(basePrice, 350_000);
      const originalPrice = Math.round(price * (1.06 + rand() * 0.1) / 1000) * 1000;
      const label = family.label;
      const description = buildDescription({ brand: brand.name, label, hp, refrigerant, applications: family.applications, model: modelCode, teknologi: family.teknologi });

      const specs = {
        kompresor_type: label,
        teknologi: family.teknologi,
        refrigerant,
        kapasitas: `${hpLabel(hp)} (${btuFromHp(hp).toLocaleString('id-ID')} BTU/h)`,
        kapasitas_pk: `${pk} PK`,
        perpindahan_cm3_rev: displacement(hp, family.key),
        cop: copValue(hp),
        tegangan: hp >= 10 ? '380V / 3 Fase / 50Hz' : '220V / 1 Fase / 50Hz',
        oil: pick(family.oilTypes),
        aplikasi: family.applications,
        garansi: 'Garansi resmi 1 tahun',
        kemasan: 'Unit baru — original distributor',
      };

      products.push({
        name: `${brand.name} ${modelCode} — ${label} ${hpLabel(hp)}`,
        slug,
        description,
        shortDesc: `${label} ${brand.name} ${hpLabel(hp)} ${refrigerant} Original`,
        price,
        originalPrice,
        categoryId: catIdByFamily.get(family.key)!,
        brand: brand.name,
        model: modelCode,
        specifications: JSON.stringify(specs),
        images: `/images/products/kompresor/${slug}.webp`,
        inStock: true,
        isFeatured: i % 9 === 0,
        isNew: i % 3 !== 0,
        minOrder: family.minOrder,
        unit: family.unit,
        _hp: hp,
        _familyKey: family.key,
      });
    }
  }
  return products.slice(0, 500);
}

// ============================================================================
// GENERATOR GAMBAR TURUNAN (SHARP) — UNIK PER PRODUK
// ============================================================================
const SVG_HEADER = (w: number, h: number) => `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`;

async function generateDerivativeImage(
  baseBuffer: Buffer,
  outPath: string,
  brand: Brand,
  label: string,
  hp: number,
  refrigerant: string,
  tint: [number, number, number],
  variantIndex: number,
) {
  const W = 800;
  const H = 800;
  const badgeH = 108;
  const tintAlpha = 0.06 + (variantIndex % 5) * 0.015;
  const [r, g, b] = brand.color;
  const [tr, tg, tb] = tint;

  // Crop variasi per index agar tiap file benar-benar unik secara piksel
  const zoom = 1 + (variantIndex % 4) * 0.03;
  const baseW = Math.round(W * zoom);

  const badgeSvg = Buffer.from(
    `${SVG_HEADER(W, H)}
     <defs>
       <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%" stop-color="rgba(${r},${g},${b},0.97)"/>
         <stop offset="100%" stop-color="rgba(${Math.min(r + 22, 255)},${Math.min(g + 22, 255)},${Math.min(b + 22, 255)},0.94)"/>
       </linearGradient>
     </defs>
     <rect x="0" y="${H - badgeH}" width="${W}" height="${badgeH}" fill="url(#bg)"/>
     <rect x="0" y="${H - badgeH}" width="${W}" height="4" fill="rgba(255,255,255,0.35)"/>
     <text x="36" y="${H - badgeH + 44}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#ffffff">${label.toUpperCase()} — ${hpLabel(hp)}</text>
     <text x="36" y="${H - badgeH + 82}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="rgba(255,255,255,0.92)">Refrigerant ${refrigerant} · Original · Ready Stock Indonesia</text>
     <circle cx="742" cy="52" r="30" fill="rgba(${tr},${tg},${tb},0.85)"/>
     <text x="742" y="62" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">JK</text>
   </svg>`,
  );

  const tintOverlay = Buffer.from(
    `<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="rgba(${tr},${tg},${tb},${tintAlpha})"/></svg>`,
  );

  const base = await sharp(baseBuffer)
    .resize({ width: baseW, height: baseW, fit: 'cover', position: 'centre' })
    .toBuffer();

  await sharp(base)
    .resize(W, H, { fit: 'cover' })
    .composite([
      { input: tintOverlay, blend: 'over' },
      { input: badgeSvg, blend: 'over' },
    ])
    .webp({ quality: 84 })
    .toFile(outPath);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
  const db = new PGlite(dataDir);

  // ========================================================================
  // 1) UPSERT 9 SUB-KATEGORI KOMPRESOR (slug kompresor-* / unit-kondensor-*)
  // ========================================================================
  const catIdByFamily = new Map<string, string>();
  let sortOrder = 21; // setelah kategori utama (sortOrder 1–10)
  for (const family of FAMILIES) {
    const existing = (
      await db.query<{ id: string }>('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [family.catSlug])
    ).rows[0];
    const id = existing?.id ?? `cat_${family.catSlug}`;
    await db.query(
      `INSERT INTO categories (id, name, slug, description, image, sort_order, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         image = EXCLUDED.image,
         sort_order = EXCLUDED.sort_order,
         updated_at = now()`,
      [
        id, family.catName, family.catSlug, family.catDesc,
        `/images/products/kompresor/${family.baseImage}`,
        sortOrder++, new Date().toISOString(), new Date().toISOString(),
      ],
    );
    catIdByFamily.set(family.key, id);
    console.log(`📂 Sub-kategori siap: ${family.catName} (${family.catSlug})`);
  }

  const existingSlugs = new Set(
    (await db.query<{ slug: string }>('SELECT slug FROM products')).rows.map((r) => r.slug),
  );
  console.log(`📌 Slug existing di DB: ${existingSlugs.size}`);

  const products = buildProducts(catIdByFamily).filter((p) => !existingSlugs.has(p.slug));
  console.log(`🧠 Produk baru ter-generate: ${products.length}`);

  const baseDir = path.join(process.cwd(), 'public', 'images', 'products', 'kompresor');
  fs.mkdirSync(baseDir, { recursive: true });

  let imgOk = 0;
  let imgFail = 0;
  const tints: Array<[number, number, number]> = [
    [0, 128, 128], [230, 126, 34], [142, 68, 173], [39, 174, 96], [211, 84, 0],
    [41, 128, 185], [192, 57, 43], [22, 160, 133], [243, 156, 18], [155, 89, 182],
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i]!;
    const family = FAMILIES.find((f) => f.key === p._familyKey) ?? FAMILIES[0]!;
    const brand = BRANDS.find((b) => b.name === p.brand) ?? BRANDS[0]!;
    // Variasi base image: gunakan altImage untuk produk indeks genap bila tersedia
    const baseFile = i % 2 === 1 && family.altImage ? family.altImage : family.baseImage;
    const baseBufferPath = path.join(baseDir, baseFile);
    if (!fs.existsSync(baseBufferPath)) {
      console.warn(`⚠️ Base image belum ada: ${baseFile} — pakai fallback produk lama`);
      continue;
    }
    const outPath = path.join(baseDir, `${p.slug}.webp`);
    try {
      await generateDerivativeImage(
        fs.readFileSync(baseBufferPath), outPath, brand,
        family.label.replace('Kompresor ', '').replace('Unit ', ''),
        p._hp,
        refFromSpecs(p.specifications), tints[i % tints.length]!, i,
      );
      imgOk++;
    } catch (error) {
      imgFail++;
      console.error(`❌ Gagal gambar ${p.slug}: ${(error as Error).message}`);
    }
    if ((i + 1) % 50 === 0) console.log(`🖼️  Gambar ${imgOk}/${i + 1} diproses...`);
  }

  let inserted = 0;
  for (const p of products) {
    const imgPath = path.join(baseDir, `${p.slug}.webp`);
    const images = fs.existsSync(imgPath) ? p.images : '/images/products/product-kompresor.png';
    await db.query(
      `INSERT INTO products (id, name, slug, description, short_desc, price, original_price, category_id, brand, model, specifications, images, in_stock, is_featured, is_new, min_order, unit, view_count, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        `cmp_${p.slug.slice(0, 40)}_${Date.now()}_${inserted}`, p.name, p.slug, p.description, p.shortDesc,
        p.price, p.originalPrice, p.categoryId, p.brand, p.model, p.specifications, images,
        p.inStock, p.isFeatured, p.isNew, p.minOrder, p.unit, 0, new Date().toISOString(), new Date().toISOString(),
      ],
    );
    inserted++;
  }

  const [{ count: total }] = (await db.query<{ count: number }>('SELECT count(*)::int AS count FROM products')).rows;
  const [{ count: komp }] = (
    await db.query<{ count: number }>("SELECT count(*)::int AS count FROM products WHERE category_id LIKE 'cat_kompresor%' OR category_id = 'cat_unit-kondensor-kompak'")
  ).rows;
  console.log(`\n🏆 SELESAI!`);
  console.log(`   Produk baru diinsert : ${inserted}`);
  console.log(`   Gambar unik dibuat   : ${imgOk} (gagal: ${imgFail})`);
  console.log(`   Total produk di DB   : ${total} (kategori kompresor: ${komp})`);
  db.close();
}

function refFromSpecs(specs: string): string {
  const m = specs.match(/"refrigerant":"([^"]+)"/);
  return m ? m[1]! : 'R32';
}

main().catch((e) => {
  console.error('❌ Generator gagal:', e);
  process.exit(1);
});
