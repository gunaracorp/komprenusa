#!/usr/bin/env node
/**
 * rebrand-kompresnusa.mjs — Migrasi merek "KompresNusa" → "KOMPRESNUSA"
 * Case-aware, proteksi domain kanonis (juragankompresor.com TIDAK diubah),
 * CHANGELOG.md & riwayat historis tidak disentuh.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = '/home/z/my-project';
const DOMAIN_TOKEN = 'juragankompresor.com';

// File target (aktif di website / build pipeline) — CHANGELOG.md sengaja dikecualikan (riwayat)
const TARGETS = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', '.next', 'pglite-data', 'output', 'db', 'public/logos', 'public/images'].includes(name) || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else TARGETS.push(p);
  }
}
walk(join(ROOT, 'src'));
walk(join(ROOT, 'scripts'));
for (const f of ['prisma/seed.ts', 'docs/VERSIONING.md', 'package.json', 'README.md']) {
  if (existsSync(join(ROOT, f))) TARGETS.push(join(ROOT, f));
}
// File publik teks (aset gambar logotypes: svg teks-brand; logo-gallery & manifest logo lib)
for (const f of ['public/llms.txt', 'public/logo.svg', 'public/logo-gallery.html', 'public/logos/README.md', 'public/logos/manifest.json']) {
  if (existsSync(join(ROOT, f))) TARGETS.push(join(ROOT, f));
}
for (const f of ['public/images']) { /* svg logo di bawah */ }
TARGETS.push(join(ROOT, 'public/images/logo.svg'));

const exts = new Set(['.ts', '.tsx', '.mjs', '.js', '.json', '.md', '.txt', '.svg', '.html', '.css', '.prisma']);

// Urutan penting: spesifik dulu, lalu catch-all
const MAP = [
  [/KOMPRESNUSA/g, 'KOMPRESNUSA'],
  [/KompresNusa/g, 'KompresNusa'],
  [/KompresNusa/g, 'KompresNusa'],
  [/kompresnusa/g, 'kompresnusa'],
  [/kompresnusa/g, 'kompresnusa'],
  [/KompresNusa/g, 'KompresNusa'],
  [/kompresnusa/g, 'kompresnusa'],
  [/KOMPRESNUSA/g, 'KOMPRESNUSA'],
  [/KompresNusa/g, 'KompresNusa'],
  [/kompresnusa/g, 'kompresnusa'],
];

let changed = 0, files = 0;
for (const file of TARGETS) {
  if (!exts.has(extname(file))) continue;
  let src = readFileSync(file, 'utf8');
  const before = src;
  // 1) Lindungi domain kanonis dari semua penggantian
  src = src.replace(/kompresnusa\.com/g, DOMAIN_TOKEN);
  // 2) Terapkan pemetaan merek
  for (const [re, to] of MAP) src = src.replace(re, to);
  // 3) Pulihkan domain
  src = src.split(DOMAIN_TOKEN).join('juragankompresor.com');
  if (src !== before) { writeFileSync(file, src); changed++; files++; console.log('✎', file.replace(ROOT + '/', '')); }
}
console.log(`\nSelesai: ${changed} file berubah dari ${TARGETS.length} kandidat`);
