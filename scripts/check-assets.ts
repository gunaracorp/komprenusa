/**
 * ──────────────────────────────────────────────────────────────────
 *  KOMPRESNUSA — ASSET TOTALITY CHECKER
 * ──────────────────────────────────────────────────────────────────
 *  Memastikan NOL gambar rusak/kosong sebelum upload/deploy.
 *  Audit:
 *    1. Semua gambar kategori di Database  → file ada?
 *    2. Semua gambar produk di Database    → file ada?
 *    3. Semua referensi /images/ di kode   → file ada?
 *    4. Aset wajib (logo, hero, favicon)   → ada?
 *
 *  Cara pakai:  bun run check:assets
 *  Exit code 0 = AMAN UPLOAD ✅ | Exit code 1 = ADA YANG HILANG ❌
 * ──────────────────────────────────────────────────────────────────
 */
import { PrismaClient } from '@prisma/client';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const db = new PrismaClient();
const ROOT = process.cwd();
const PUB = join(ROOT, 'public');

let ok = 0;
let missing = 0;
const problems: string[] = [];

function checkPath(path: string, source: string): boolean {
  const full = join(PUB, path.replace(/^\//, ''));
  if (existsSync(full)) {
    ok++;
    return true;
  }
  missing++;
  problems.push(`  ❌ HILANG: ${path}   (dipakai di: ${source})`);
  return false;
}

/** Kumpulkan semua referensi /images/... dan /favicon... dari kode sumber */
function scanSourceRefs(): { ref: string; file: string }[] {
  const refs = new Map<string, string>(); // ref -> first file
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.css'];
  const skipDirs = new Set(['node_modules', '.next', 'out', 'skills', 'output', 'mini-services']);

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(join(dir, entry.name));
        continue;
      }
      if (!exts.some((e) => entry.name.endsWith(e))) continue;
      const file = join(dir, entry.name);
      const content = readFileSync(file, 'utf-8');
      const matches = content.matchAll(/["'`](\/(?:images|favicon)[a-zA-Z0-9/_.-]+\.[a-zA-Z0-9]+)["'`]/g);
      for (const m of matches) {
        if (!refs.has(m[1])) refs.set(m[1], relative(ROOT, file));
      }
    }
  }
  walk(join(ROOT, 'src'));
  return [...refs.entries()].map(([ref, file]) => ({ ref, file }));
}

/** Hitung semua file fisik di public/images */
function countImageFiles(): number {
  let n = 0;
  function walk(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(dir, e.name));
      else n++;
    }
  }
  walk(join(PUB, 'images'));
  return n;
}

async function main() {
  console.log('\n🔍 KOMPRESNUSA — AUDIT TOTALITAS ASET\n' + '═'.repeat(64));

  // 1. Kategori
  const cats = await db.category.findMany({ select: { name: true, image: true } });
  console.log(`\n📂 KATEGORI (${cats.length}) — gambar wajib ada semua`);
  for (const c of cats) checkPath(c.image, `Kategori "${c.name}"`);

  // 2. Produk
  const prods = await db.product.findMany({ select: { name: true, images: true } });
  const prodPaths = new Set<string>();
  for (const p of prods) {
    (p.images || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((img) => prodPaths.add(img));
  }
  console.log(`\n📦 PRODUK (${prods.length} produk, ${prodPaths.size} path unik)`);
  let prodNoImg = 0;
  for (const p of prods) if (!(p.images || '').trim()) prodNoImg++;
  if (prodNoImg > 0)
    problems.push(`  ⚠️  ${prodNoImg} produk TANPA gambar sama sekali (field images kosong)`);
  for (const img of [...prodPaths].sort()) checkPath(img, 'Database produk');

  // 3. Referensi di kode sumber
  const refs = scanSourceRefs();
  console.log(`\n💻 REFERENSI DI KODE (${refs.length} path unik di src/)`);
  for (const r of refs) checkPath(r.ref, r.file);

  // 4. Aset wajib
  console.log(`\n⭐ ASET WAJIB BRAND`);
  checkPath('/images/logo.svg', 'Aset wajib (JSON-LD Organization.logo)');
  checkPath('/images/hero/hero-1.png', 'Aset wajib (Hero + OpenGraph)');

  // Ringkasan
  const total = countImageFiles();
  console.log('\n' + '═'.repeat(64));
  console.log(`📊 RINGKASAN:`);
  console.log(`   ✅ Cek berhasil   : ${ok} referensi`);
  console.log(`   🖼️  File fisik     : ${total} file di public/images`);
  console.log(`   🗄️  Database       : ${cats.length} kategori, ${prods.length} produk`);

  if (problems.length === 0) {
    console.log('\n🟢 SEMPURNA — TOTALITAS 100%! AMAN UPLOAD/DEPLOY. TIDAK ADA SATU PUN GAMBAR HILANG.\n');
    process.exit(0);
  } else {
    console.log(`\n🔴 DITEMUKAN ${problems.length} MASALAH — JANGAN UPLOAD DULU!:\n`);
    problems.forEach((p) => console.log(p));
    console.log('');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('💥 Audit gagal:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
