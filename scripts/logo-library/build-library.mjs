#!/usr/bin/env node
/**
 * build-library.mjs — Perakit Perpustakaan Logo Kompresor Dunia
 * ============================================================
 * Rantai sumber presisi (anti asal-asalan):
 *   1. wiki        — file logo infobox Wikipedia (judul dikurasi manual)
 *   2. wiki-search — auto-cari judul halaman Wikipedia yg cocok (token nama
 *                    merek wajib match; file generik & ikon sistem dibuang)
 *   3. commons     — Wikimedia Commons (atur ketat: nama penuh ATAU token +
 *                    kata konteks ATAU token+logo utk nama multi-kata)
 *   4. favicon     — ikon resmi per-domain via gstatic faviconV2 (deteksi
 *                    ikon-globe-generik via hash probe, min 96px)
 *   5. search      — hasil kurasi image-search (SWAP QC manual diutamakan)
 * Lalu: normalisasi sharp (auto-trim, maks 640px, alpha dipertahankan,
 * PNG palet 256) → manifest.json → galeri HTML → README → ZIP.
 *
 * Jalankan: node scripts/logo-library/build-library.mjs
 * QC swap : SWAP="slug=idxCandidat" node scripts/logo-library/build-library.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = '/home/z/my-project';
const SEARCH_DIR = '/tmp/logo-search';
const OUT_DIR = path.join(ROOT, 'public/logos');
const brands = JSON.parse(readFileSync(path.join(ROOT, 'scripts/logo-library/brands.json'), 'utf8'));

const VERSION = 'v1.4.0 (Aurora)';
const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'JKLogoBot/1.0 (https://juragankompresor.example; refs@juragankompresor.example)';
const CATEGORIES = [
  { id: 'air-compressor', label: 'Kompresor Udara', en: 'Air Compressors', icon: '💨' },
  { id: 'refrigeration', label: 'Kompresor Pendingin', en: 'Refrigeration Compressors', icon: '❄️' },
  { id: 'hvac-ac', label: 'HVAC & Pendinginan Udara', en: 'HVAC & Air Conditioning', icon: '🏢' },
];
const catLabel = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

/* ---------- util ---------- */
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithTimeout(url, ms = 30000, ua = UA) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { signal: ac.signal, headers: { 'user-agent': ua } });
  } finally { clearTimeout(t); }
}

function detectKind(buf, contentType = '') {
  if (buf.length < 1200) return 'too-small';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  if (buf.slice(0, 4).toString() === 'GIF8') return 'gif';
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return 'ico';
  if (buf.slice(4, 12).toString().includes('ftypavif')) return 'avif';
  const head = buf.slice(0, 512).toString('utf8').toLowerCase();
  if (head.includes('<svg')) return 'svg';
  return 'unknown';
}

const REJECT_KINDS = new Set(['too-small', 'unknown', 'gif', 'ico', 'avif']);

/** Normalisasi logo → PNG rapi: trim pinggiran, maks 640px, alpha dipertahankan, palet hemat. */
async function normalizeToPng(buf, kind) {
  let img = kind === 'svg' ? sharp(buf, { density: 300 }) : sharp(buf);
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error('dimensi tidak terbaca');
  try { img = img.trim({ threshold: 12 }); } catch { /* gambar solid — lanjut tanpa trim */ }
  const hasAlpha = Boolean(meta.hasAlpha);
  img = img.resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: kind !== 'svg' });
  // PENTING: flatten HANYA untuk sumber tanpa alpha (JPEG/GIF) — jangan bunuh transparansi PNG/WebP
  if (!hasAlpha) img = img.flatten({ background: '#ffffff' });
  return img
    .png({ compressionLevel: 9, palette: true, colors: 256, quality: 90, effort: 10 })
    .toBuffer({ resolveWithObject: true });
}

/* ---------- API Wikimedia ---------- */
async function wikiJson(api, params) {
  const url = `${api}?${new URLSearchParams({ format: 'json', redirects: '1', origin: '*', ...params })}`;
  const res = await fetchWithTimeout(url, 25000);
  if (!res.ok) throw new Error(`wiki http ${res.status}`);
  return res.json();
}

const WIKI_EXCLUDE = /commons-logo|oojs|symbol|icon\b|icon\.|flag|edit|wikimedia|wikisource|wikiquote|wikinews|wikivoyage|increase|decrease|question_book|ambox|arrow|padlock|disambig|stub|star|balance|dot\.svg|check|x_|x-|letter|crystal|nuvola|emblem|commended|award|nara|damaged|light[-_ ]?box|street|insegna|parco|park|sign|factory|fabrik|leinenfabrik|building|gedung|museum|philharmonic|new york|la salle|lazaristes|school|universit/i;

function pickWikiLogoFile(titles, brandName) {
  const tokens = brandName.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1);
  const scored = titles
    .filter(t => /^File:/i.test(t) && !WIKI_EXCLUDE.test(t))
    .map(t => {
      const lower = t.toLowerCase();
      let score = 0;
      if (/logo|logotype|wordmark/i.test(lower)) score += 3;
      if (/\.svg$/i.test(lower)) score += 2;
      else if (/\.png$/i.test(lower)) score += 1;
      else if (/\.jpe?g$/i.test(lower)) score -= 1;
      const tokenHit = tokens.some(tok => lower.includes(tok));
      if (tokenHit) score += 2;
      return { t, score, tokenHit };
    })
    .filter(x => x.score >= 3 && x.tokenHit) // WAJIB: skoring layak + cocok nama merek
    .sort((a, b) => b.score - a.score || a.t.length - b.t.length);
  return scored[0]?.t || null;
}

/** Ambil file logo dari sebuah halaman wiki (dipakai wiki langsung & auto-search). */
async function wikiPageLogo(api, pageTitle, brand) {
  const j1 = await wikiJson(api, { action: 'query', titles: pageTitle, prop: 'images', imlimit: '100' });
  const page = Object.values(j1.query.pages ?? {})[0];
  const files = (page?.images ?? []).map(i => i.title);
  if (!files.length) return null;
  const file = pickWikiLogoFile(files, brand.name);
  if (!file) return null;
  return wikiFileThumb(api, file);
}

async function wikiFileThumb(api, file) {
  const j2 = await wikiJson(api, { action: 'query', titles: file, prop: 'imageinfo', iiprop: 'url|mime|size', iiurlwidth: '640' });
  const p2 = Object.values(j2.query.pages ?? {})[0];
  const info = p2?.imageinfo?.[0];
  if (!info) return null;
  const url = info.thumburl || info.url;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const kind = detectKind(buf, res.headers.get('content-type') || '');
  if (REJECT_KINDS.has(kind)) return null;
  const { data: out, info: meta } = await normalizeToPng(buf, kind);
  if (meta.width < 100 || meta.height < 40) return null;
  return { buf: out, meta, sourceUrl: url, fileTitle: file };
}

/* SUMBER 1: infobox Wikipedia (judul dikurasi) */
async function fetchWikiLogo(brand) {
  if (!brand.wiki) return null;
  const got = await wikiPageLogo(WIKI_API, brand.wiki, brand);
  if (!got) return null;
  return { ...got, sourceSite: 'wiki', candidateIndex: -1 };
}

/* SUMBER 2: auto-search judul halaman Wikipedia — ketat anti entitas salah */
async function fetchWikiAuto(brand) {
  if (!brand.wiki) return null; // hanya utk merek unambiguous (kurasi manual)
  const tokens = brand.name.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1);
  const j = await wikiJson(WIKI_API, { action: 'query', list: 'search', srsearch: brand.wiki, srlimit: '5', srprop: 'snippet' });
  const titles = (j.query?.search ?? []).map(x => x.title);
  for (const t of titles) {
    const l = t.toLowerCase();
    if (WIKI_EXCLUDE.test(l)) continue;
    if (/,/.test(t) && !/,\s*(inc|ltd|plc|llc|se|ag|gmbh|co\.)/i.test(t)) continue; // tempat/orang: "Tecumseh, Michigan"
    const matched = tokens.filter(tok => l.includes(tok)).length;
    const okTitle = tokens.length === 1 ? matched === 1 : matched >= 2; // wajib ≥2 token utk nama multi-kata
    if (!okTitle) continue;
    const got = await wikiPageLogo(WIKI_API, t, brand);
    if (got) return { ...got, sourceSite: `wiki-search:${t}`, candidateIndex: -1 };
  }
  return null;
}

/* SUMBER 3: Wikimedia Commons — KETAT: wajib "logo" di nama file + token merek */
async function fetchCommonsLogo(brand) {
  const full = brand.name.toLowerCase();
  const tokens = brand.name.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1);
  for (const srsearch of [`${brand.name} logo`, `${brand.name} compressor logo`]) {
    const j = await wikiJson(COMMONS_API, { action: 'query', list: 'search', srsearch, srnamespace: '6', srlimit: '8' });
    const files = (j.query?.search ?? []).map(x => x.title);
    for (const t of files) {
      const l = t.toLowerCase();
      if (!/^file:/.test(l) || WIKI_EXCLUDE.test(l)) continue;
      if (!/logo|logotype|wordmark/i.test(l)) continue;              // WAJIB kata logo
      if (/\.jpe?g$/.test(l) && !/logo/i.test(l)) continue;           // jpg hanya bila ada "logo"
      const hasFull = full.length > 4 && l.includes(full);
      const tokenHit = tokens.some(tok => l.includes(tok));
      if (!hasFull && !tokenHit) continue;
      const got = await wikiFileThumb(COMMONS_API, t);
      if (got) return { ...got, sourceSite: `commons:${t}`, candidateIndex: -1 };
    }
  }
  return null;
}

/* SUMBER 4: favicon resmi per-domain (gstatic) — anti ikon-globe-generik */
let DEFAULT_FAVICON_SHA = null;
async function probeDefaultFavicon() {
  if (DEFAULT_FAVICON_SHA) return DEFAULT_FAVICON_SHA;
  try {
    const res = await fetchWithTimeout('https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://domain-pasti-tidak-ada-jk-probe-7f3x9.com&size=256', 15000);
    if (res.ok) DEFAULT_FAVICON_SHA = sha256(Buffer.from(await res.arrayBuffer()));
  } catch { /* abaikan */ }
  return DEFAULT_FAVICON_SHA;
}

async function fetchFavicon(brand) {
  for (const domain of brand.domains ?? []) {
    try {
      const url = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent('https://' + domain)}&size=256`;
      const res = await fetchWithTimeout(url, 15000);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const kind = detectKind(buf, res.headers.get('content-type') || '');
      if (kind !== 'png' && kind !== 'webp' && kind !== 'jpeg') continue;
      const defSha = await probeDefaultFavicon();
      if (defSha && sha256(buf) === defSha) continue; // globe generik → domain salah
      const { data: out, info: meta } = await normalizeToPng(buf, kind);
      if (meta.width < 96 || meta.height < 96) continue;
      return { buf: out, meta, sourceUrl: url, sourceSite: `favicon:${domain}`, fileTitle: null, candidateIndex: -2 };
    } catch { /* domain berikutnya */ }
  }
  return null;
}

/* SUMBER 4b: site-icon langsung dari domain resmi (apple-touch-icon / favicon.ico) */
async function fetchDirectFavicon(brand) {
  for (const domain of brand.domains ?? []) {
    for (const p of ['/apple-touch-icon.png', '/favicon.ico']) {
      try {
        const res = await fetchWithTimeout(`https://${domain}${p}`, 12000, 'Mozilla/5.0 (compatible; JKLogoBot/1.0)');
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        const kind = detectKind(buf, res.headers.get('content-type') || '');
        if (kind !== 'png' && kind !== 'webp' && kind !== 'jpeg') continue;
        const { data: out, info: meta } = await normalizeToPng(buf, kind);
        if (meta.width < 56 || meta.height < 56) continue;
        return { buf: out, meta, sourceUrl: `https://${domain}${p}`, sourceSite: `site-icon:${domain}`, fileTitle: null, candidateIndex: -3 };
      } catch { /* lanjut */ }
    }
  }
  return null;
}

/* ---------- SUMBER 5: hasil image-search terkurasi ---------- */
// QC swap manual: SWAP="slug=idxCandidat,slug2=idxCandidat" → pakai kandidat tertentu
const SWAP = Object.fromEntries(
  (process.env.SWAP || '').split(',').filter(Boolean).map(s => {
    const [slug, idx] = s.split('=');
    return [slug.trim(), Number(idx)];
  }),
);

async function fetchSearchCandidate(brand, idx) {
  const file = path.join(SEARCH_DIR, `${brand.slug}.json`);
  if (!existsSync(file)) return null;
  let data;
  try { data = JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
  if (!data?.success || !Array.isArray(data.results)) return null;
  const cand = data.results[idx];
  const url = cand?.original_url;
  if (!url || usedUrls.has(url)) return null;
  const res = await fetchWithTimeout(url, 30000, 'Mozilla/5.0 (compatible; JKLogoBot/1.0)');
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const kind = detectKind(buf, res.headers.get('content-type') || '');
  if (REJECT_KINDS.has(kind)) return null;
  const { data: out, info: meta } = await normalizeToPng(buf, kind);
  if (meta.width < 100 || meta.height < 50) return null;
  return { buf: out, meta, sourceUrl: url, sourceSite: cand.source || 'web', fileTitle: null, candidateIndex: idx };
}

/* ---------- pass unduh ---------- */
const usedUrls = new Set();
const results = [];
const failed = [];

async function saveLogo(brand, got, queryUsed) {
  const dir = path.join(OUT_DIR, brand.category);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${brand.slug}.png`);
  writeFileSync(filePath, got.buf);
  usedUrls.add(got.sourceUrl);
  results.push({
    slug: brand.slug, name: brand.name, country: brand.country, cc: brand.cc,
    category: brand.category, categoryLabel: catLabel[brand.category],
    file: `logos/${brand.category}/${brand.slug}.png`,
    width: got.meta.width, height: got.meta.height,
    bytes: statSync(filePath).size,
    format: 'PNG',
    hasAlpha: got.meta.channels === 4,
    sha256: sha256(got.buf),
    sourceSite: got.sourceSite,
    sourceUrl: got.sourceUrl,
    wikiFile: got.fileTitle ?? undefined,
    query: queryUsed,
    candidateIndex: got.candidateIndex,
    swapped: got.swapped,
    downloadedAt: new Date().toISOString(),
  });
}

async function tryBrand(brand) {
  const chain = [
    ['wiki', () => fetchWikiLogo(brand)],
    ['wiki-search', () => fetchWikiAuto(brand)],
    ['commons', () => fetchCommonsLogo(brand)],
    ['favicon', () => fetchFavicon(brand)],
    ['site-icon', () => fetchDirectFavicon(brand)],
  ];
  // brand.force = 'favicon' → dua varian ikon domain resmi diujicobakan paling awal
  if (brand.force === 'favicon') {
    const f = chain.splice(3, 2);
    chain.unshift(...f);
  }
  for (const [, fn] of chain) {
    try {
      const got = await fn();
      if (got) { await saveLogo(brand, got, brand.force || 'auto'); return { ok: true, via: got.sourceSite }; }
    } catch { /* lanjut sumber berikutnya */ }
  }
  // Sumber 5: image-search (urutan kandidat; SWAP diutamakan)
  const file = path.join(SEARCH_DIR, `${brand.slug}.json`);
  if (existsSync(file)) {
    let order = [];
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      const n = data?.results?.length ?? 0;
      const allIdx = [...Array(n).keys()];
      const swapIdx = SWAP[brand.slug];
      order = Number.isInteger(swapIdx) ? [swapIdx, ...allIdx.filter(i => i !== swapIdx)] : allIdx;
    } catch { /* kosong */ }
    for (const i of order) {
      try {
        const got = await fetchSearchCandidate(brand, i);
        if (got) {
          got.swapped = Number.isInteger(SWAP[brand.slug]) && i === SWAP[brand.slug] ? true : undefined;
          await saveLogo(brand, got, brand.query);
          return { ok: true, via: `search#${i}` };
        }
      } catch { /* kandidat berikutnya */ }
    }
  }
  return { ok: false, reason: 'semua sumber gagal' };
}

for (const brand of brands) {
  if (brand.exclude) { console.log(`⊘ ${brand.slug} — dikeluarkan (tanpa logo terverifikasi)`); failed.push(brand); continue; }
  const r = await tryBrand(brand);
  console.log(`${r.ok ? '✓' : '✗'} ${brand.slug} — ${r.ok ? r.via : r.reason}`);
  await sleep(120);
}
for (const brand of brands.filter(b => !results.some(r => r.slug === b.slug))) failed.push(brand);

/* ---------- manifest ---------- */
const byCat = CATEGORIES.map(c => ({ ...c, count: results.filter(r => r.category === c.id).length }));
const manifest = {
  library: 'Juragan Kompresor — Perpustakaan Logo Kompresor Dunia',
  version: VERSION,
  generatedAt: new Date().toISOString(),
  counts: { total: brands.length, ok: results.length, failed: failed.length },
  categories: byCat.map(({ id, label, en, icon, count }) => ({ id, label, en, icon, count })),
  namingConvention: 'logos/<kategori>/<merek>.png — huruf kecil, tanda hubung, PNG ternormalisasi (auto-trim, maks 640px, palet 256, alpha dipertahankan)',
  sources: 'Rantai presisi: logo infobox Wikipedia → auto-search Wikipedia → Wikimedia Commons → favicon resmi domain (gstatic) → kurasi image-search.',
  license: 'Seluruh logo adalah merek dagang milik pemiliknya masing-masing; dipakai untuk keperluan referensi/editorial distributor.',
  brands: results,
  failed: [...new Map(failed.map(b => [b.slug, { slug: b.slug, name: b.name, category: b.category }])).values()],
};
writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

/* ---------- README ---------- */
writeFileSync(path.join(OUT_DIR, 'README.md'), `# Perpustakaan Logo Kompresor Dunia
**Juragan Kompresor** · ${VERSION} · ${results.length} merek · 3 kategori

Struktur folder:
\`\`\`
logos/
├── air-compressor/   # Kompresor Udara (${byCat[0].count} merek)
├── refrigeration/    # Kompresor Pendingin (${byCat[1].count} merek)
├── hvac-ac/          # HVAC & Pendinginan Udara (${byCat[2].count} merek)
├── manifest.json     # Metadata lengkap tiap logo (dimensi, sha256, sumber)
├── juragan-kompresor-logo-library.zip  # Semua logo dalam 1 paket
└── README.md
\`\`\`

Aturan penamaan: \`<kategori>/<merek>.png\` — slug huruf kecil tanda hubung.
Semua logo sudah dinormalisasi: auto-trim pinggiran, maksimal 640px, PNG palet 256 warna, alpha transparan dipertahankan.

Rantai sumber presisi (urut prioritas): logo infobox Wikipedia → auto-search Wikipedia → Wikimedia Commons → favicon resmi domain → kurasi image-search.

Lihat galeri interaktif: **/logo-gallery.html**
Unduh sekaligus: **/logos/juragan-kompresor-logo-library.zip**

> ⚖️ Seluruh logo adalah merek dagang milik pemiliknya masing-masing.
> Perpustakaan ini untuk keperluan referensi/editorial distributor, bukan untuk diperjualbelikan.
`);

/* ---------- galeri HTML ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kb = b => `${(b / 1024).toFixed(0)} KB`;

const card = r => `
        <article class="card" data-name="${esc(r.name.toLowerCase())} ${esc(r.slug)}" data-cat="${r.category}">
          <div class="tile"><img src="/${esc(r.file)}" alt="Logo ${esc(r.name)}" loading="lazy" /></div>
          <div class="card-body">
            <h3>${esc(r.name)}</h3>
            <p class="meta"><span class="cc">${esc(r.cc)}</span> ${esc(r.country)} · ${r.width}×${r.height} · ${kb(r.bytes)} · PNG${r.hasAlpha ? ' · alpha' : ''}</p>
            <div class="actions">
              <a class="btn btn-gold" href="/${esc(r.file)}" download="${esc(r.slug)}.png">⬇ Unduh</a>
              <a class="btn btn-ghost" href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">Sumber</a>
            </div>
          </div>
        </article>`;

const sections = CATEGORIES.map(c => {
  const items = results.filter(r => r.category === c.id);
  if (!items.length) return '';
  return `
    <section class="cat" id="${c.id}">
      <h2><span>${c.icon}</span> ${c.label} <small>${c.en} · ${items.length} merek</small></h2>
      <div class="grid">${items.map(card).join('')}</div>
    </section>`;
}).join('');

const failedNote = failed.length
  ? `<p class="warn">⚠️ ${failed.length} merek belum terkumpul: ${failed.map(b => esc(b.name)).join(', ')}. Coba jalankan ulang pipeline untuk menambahkannya.</p>`
  : '';

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Perpustakaan Logo Kompresor Dunia — Juragan Kompresor</title>
<meta name="robots" content="noindex, nofollow" />
<style>
  :root { --teal:#0f766e; --teal-2:#0d9488; --gold:#f59e0b; --gold-2:#fbbf24; --ink:#0f172a; --muted:#94a3b8; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; background:#020617; color:#e2e8f0; min-height:100vh; }
  header.hero { padding:48px 24px 28px; text-align:center; background:linear-gradient(180deg,#041e1c 0%,#020617 100%); border-bottom:1px solid #0f2f2d; }
  .kicker { display:inline-flex; gap:8px; align-items:center; font-size:12px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--gold-2); border:1px solid #3f2d0a; background:#170f02; padding:6px 14px; border-radius:999px; }
  h1 { margin:18px auto 8px; font-size:clamp(24px,4vw,40px); font-weight:800; color:#f8fafc; }
  h1 em { font-style:normal; background:linear-gradient(90deg,var(--gold-2),var(--gold)); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .sub { color:var(--muted); font-size:14px; }
  .stats { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:18px; }
  .stat { background:#0b1a29; border:1px solid #14324b; border-radius:12px; padding:10px 18px; font-size:13px; }
  .stat b { color:var(--gold-2); font-size:16px; }
  nav.bar { position:sticky; top:0; z-index:50; display:flex; gap:12px; align-items:center; justify-content:center; flex-wrap:wrap; padding:12px 16px; background:rgba(2,6,23,.88); backdrop-filter:blur(10px); border-bottom:1px solid #0f2f2d; }
  #q { width:min(420px,90vw); padding:11px 16px; border-radius:999px; border:1px solid #1e3a5f; background:#0b1a29; color:#e2e8f0; font-size:14px; outline:none; }
  #q:focus { border-color:var(--teal-2); box-shadow:0 0 0 3px rgba(13,148,136,.25); }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:999px; font-size:13px; font-weight:700; text-decoration:none; transition:transform .15s ease, box-shadow .15s ease; }
  .btn:hover { transform:translateY(-1px); }
  .btn-gold { background:linear-gradient(90deg,var(--gold-2),var(--gold)); color:#422006; box-shadow:0 6px 18px rgba(245,158,11,.25); }
  .btn-ghost { border:1px solid #1e3a5f; color:#93c5fd; background:transparent; }
  main { max-width:1200px; margin:0 auto; padding:32px 20px 60px; }
  section.cat { margin-top:44px; }
  section.cat h2 { font-size:20px; font-weight:800; color:#f1f5f9; display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; border-left:4px solid var(--teal-2); padding-left:12px; }
  section.cat h2 small { font-size:12px; color:var(--muted); font-weight:600; }
  .grid { margin-top:18px; display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:16px; }
  .card { background:#0b1524; border:1px solid #16283d; border-radius:16px; overflow:hidden; transition:transform .18s ease, border-color .18s ease; }
  .card:hover { transform:translateY(-3px); border-color:var(--teal-2); }
  .tile { background:#fff; height:120px; display:flex; align-items:center; justify-content:center; padding:14px; }
  .tile img { max-width:100%; max-height:100%; object-fit:contain; }
  .card-body { padding:12px 14px 14px; }
  .card-body h3 { font-size:15px; font-weight:700; color:#f8fafc; }
  .meta { margin-top:5px; font-size:11.5px; color:var(--muted); display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .cc { background:#132a3f; border:1px solid #1e3a5f; color:#7dd3fc; font-weight:700; font-size:10px; padding:2px 7px; border-radius:6px; letter-spacing:.06em; }
  .actions { margin-top:11px; display:flex; gap:8px; }
  .actions .btn { padding:7px 12px; font-size:12px; }
  .warn { margin:26px auto 0; max-width:720px; text-align:center; color:#fcd34d; font-size:13px; }
  footer { border-top:1px solid #0f2f2d; padding:26px 20px 34px; text-align:center; color:#64748b; font-size:12.5px; line-height:1.7; }
  .vbadge { display:inline-block; margin-left:6px; padding:3px 10px; border-radius:999px; font-weight:700; font-size:11px; color:var(--gold-2); background:#170f02; border:1px solid #3f2d0a; }
  .empty { display:none; text-align:center; color:var(--muted); padding:40px 0; }
  @media (max-width:520px){ .grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));} .tile{height:96px;} }
</style>
</head>
<body>
<header class="hero">
  <span class="kicker">❄ Juragan Kompresor · Perpustakaan Aset</span>
  <h1>Perpustakaan <em>Logo Kompresor</em> Dunia</h1>
  <p class="sub">${results.length} merek terkurasi dari 3 kategori — ternormalisasi rapi: auto-trim, maks 640px, PNG seragam, penamaan konsisten.</p>
  <div class="stats">
    <span class="stat"><b>${byCat[0].count}</b> Kompresor Udara</span>
    <span class="stat"><b>${byCat[1].count}</b> Kompresor Pendingin</span>
    <span class="stat"><b>${byCat[2].count}</b> HVAC &amp; AC</span>
    <span class="stat"><b>${results.length}</b> Total Logo</span>
  </div>
</header>
<nav class="bar">
  <input id="q" type="search" placeholder="Cari merek… (mis. bitzer, atlas, daikin)" aria-label="Cari merek logo" />
  <a class="btn btn-gold" href="/logos/juragan-kompresor-logo-library.zip" download>⬇ Unduh Semua (ZIP)</a>
</nav>
<main>
  ${sections}
  <p class="empty" id="empty">Tidak ada merek yang cocok dengan pencarianmu.</p>
  ${failedNote}
</main>
<footer>
  Seluruh logo adalah merek dagang milik pemiliknya masing-masing — perpustakaan ini untuk referensi/editorial distributor.<br/>
  Dibangun otomatis oleh pipeline <code>scripts/logo-library</code> · <span class="vbadge">${VERSION}</span>
</footer>
<script>
  const q = document.getElementById('q'), cards = [...document.querySelectorAll('.card')], secs = [...document.querySelectorAll('section.cat')], empty = document.getElementById('empty');
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase(); let n = 0;
    cards.forEach(c => { const hit = !v || c.dataset.name.includes(v); c.style.display = hit ? '' : 'none'; if (hit) n++; });
    secs.forEach(s => { const vis = [...s.querySelectorAll('.card')].some(c => c.style.display !== 'none'); s.style.display = vis ? '' : 'none'; });
    empty.style.display = n ? 'none' : 'block';
  });
</script>
</body>
</html>`;
writeFileSync(path.join(ROOT, 'public/logo-gallery.html'), html);

/* ---------- ZIP ---------- */
execSync(`cd ${ROOT}/public && rm -f logos/juragan-kompresor-logo-library.zip && zip -r -X -q logos/juragan-kompresor-logo-library.zip logos -x "logos/juragan-kompresor-logo-library.zip"`, { stdio: 'inherit' });

/* ---------- ringkasan ---------- */
const viaCount = {};
for (const r of results) {
  const k = r.sourceSite.startsWith('wiki') ? 'wiki' : r.sourceSite.startsWith('commons') ? 'commons' : r.sourceSite.startsWith('favicon') ? 'favicon' : 'search';
  viaCount[k] = (viaCount[k] || 0) + 1;
}
console.log('\n===== RINGKASAN =====');
console.log(`Berhasil : ${results.length}/${brands.length} — via: ${JSON.stringify(viaCount)}`);
console.log(`Gagal    : ${failed.length}${failed.length ? ' → ' + failed.map(b => b.slug).join(', ') : ''}`);
for (const c of byCat) console.log(`  ${c.icon} ${c.label}: ${c.count}`);
console.log(`Manifest : public/logos/manifest.json`);
console.log(`Galeri   : public/logo-gallery.html (/logo-gallery.html)`);
console.log(`ZIP      : public/logos/juragan-kompresor-logo-library.zip`);
