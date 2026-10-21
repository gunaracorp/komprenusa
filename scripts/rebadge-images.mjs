/**
 * REBADGE GAMBAR PRODUK — BMP → JK
 * Menimpa badge lingkaran "BMP" (cx=742, cy=52, r=30) pada gambar
 * turunan kompresor dengan badge "JK" Juragan Kompresor.
 * Warna lingkaran baru disamarkan dengan piksel badge asli per-gambar.
 *
 * Jalankan: node scripts/rebadge-images.mjs [--dry]
 */
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const DIR = path.join(process.cwd(), 'public', 'images', 'products', 'kompresor');
const CX = 742, CY = 52, R_OLD = 30, R_NEW = 36;
const DRY = process.argv.includes('--dry');

async function sampleBadgeColor(file) {
  // Patch aman: di dalam lingkaran, di atas huruf (teks mulai ~y=46)
  const left = 725, top = 38, width = 34, height = 6;
  const { data } = await sharp(file)
    .extract({ left, top, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, n = 0;
  const ch = data.length / (width * height);
  for (let i = 0; i < width * height; i++) {
    r += data[i * ch + 0];
    g += data[i * ch + 1];
    b += data[i * ch + 2];
    n++;
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function badgeOverlay([r, g, b]) {
  return Buffer.from(
    `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
       <circle cx="${CX}" cy="${CY}" r="${R_NEW}" fill="rgb(${r},${g},${b})"/>
       <text x="${CX}" y="${CY + 8}" text-anchor="middle"
             font-family="Arial, Helvetica, sans-serif" font-size="21"
             font-weight="bold" fill="#ffffff">JK</text>
     </svg>`
  );
}

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.webp')).sort();
  console.log(`Menemukan ${files.length} gambar turunan .webp`);

  let done = 0, failed = 0;
  const preview = files.slice(0, DRY ? 3 : files.length);
  for (const f of preview) {
    const file = path.join(DIR, f);
    try {
      const color = await sampleBadgeColor(file);
      if (DRY) {
        console.log(`  [dry] ${f} → warna badge rgb(${color.join(',')})`);
        continue;
      }
      const buf = await sharp(file).toBuffer();
      await sharp(buf)
        .composite([{ input: badgeOverlay(color), blend: 'over' }])
        .webp({ quality: 84 })
        .toFile(file + '.tmp');
      fs.renameSync(file + '.tmp', file);
      done++;
      if (done % 100 === 0) console.log(`  … ${done} selesai`);
    } catch (e) {
      failed++;
      console.error(`  ❌ ${f}: ${e.message}`);
    }
  }

  console.log(DRY ? 'Mode dry-run selesai.' : `🟢 Selesai: ${done} gambar diperbarui${failed ? `, ${failed} gagal` : ' — nol gagal'}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
