#!/usr/bin/env node
/**
 * scripts/release.mjs — CLI Rilis Otomatis "KompresNusa"
 * ============================================================
 * Menerapkan: Semantic Versioning 2.0.0 + Keep a Changelog 1.1.0
 * + Conventional Commits 1.0.0 + Git Tagged Releases.
 *
 * Pemakaian:
 *   node scripts/release.mjs <patch|minor|major> [--no-git] [--yes]
 *   (atau: bun run release:patch / release:minor / release:major)
 *
 * Yang dilakukan otomatis (single source of truth = package.json):
 *   1. Validasi versi saat ini (SemVer) & hitung versi berikutnya
 *   2. Segel bagian [Unreleased] di CHANGELOG.md → [x.y.z] - tanggal (Asia/Bangkok)
 *   3. Naikkan "version" di package.json
 *   4. Tulis file VERSION (vX.Y.Z)
 *   5. Generate src/version.ts (konstanta UI; jangan edit manual)
 *   6. Perbarui tautan compare di kaki CHANGELOG.md
 *   7. git add + commit "chore(release): vX.Y.Z" + git tag -a vX.Y.Z
 *      (lewati dengan --no-git)
 *
 * Guard:
 *   - Menolak bila [Unreleased] kosong (wajib catat perubahan dulu) kecuali --yes
 *   - Menolak bila versi tidak berubah (tidak ada yang dirilis)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_PATH = resolve(ROOT, 'package.json');
const CHANGELOG_PATH = resolve(ROOT, 'CHANGELOG.md');
const VERSION_PATH = resolve(ROOT, 'VERSION');
const VERSION_TS_PATH = resolve(ROOT, 'src/version.ts');
const TIMEZONE = 'Asia/Bangkok';

/**
 * Pool codename (kebijakan di docs/VERSIONING.md § 9):
 * - MINOR  : tema "Dingin & Tenaga" — urut sesuai nomor minor, siklus bila habis.
 * - MAJOR  : tema "Era Nusantara" — nama era baru tiap major.
 * - PATCH  : mewarisi codename minor-nya (gaya Ubuntu point release).
 * Override manual: --name "Aurora"
 */
const MINOR_POOL = [
  'Nexus', 'Aurora', 'Blizzard', 'Cryo', 'Glacier', 'Kelvin',
  'Polar', 'Subzero', 'Tundra', 'Permafrost', 'Avalanche', 'Arctic',
  'Snowcap', 'Zephyr', 'Iceberg', 'Frostline', 'Cirrus', 'Boreal',
  'Isobar', 'Absolute', 'Crystal', 'Hailstorm', 'Winteria', 'Frostbyte',
];
const MAJOR_POOL = ['Genesis', 'Garuda', 'Nusantara', 'Majapahit', 'Sriwijaya', 'Bhinneka'];

function codenameFor(major, minor, level) {
  if (level === 'major') return MAJOR_POOL[(major - 1) % MAJOR_POOL.length];
  return MINOR_POOL[(minor - 3 + MINOR_POOL.length * 100) % MINOR_POOL.length];
}

// ---------- util ----------
const log = (msg) => console.log(`\x1b[36m▸\x1b[0m ${msg}`);
const ok = (msg) => console.log(`\x1b[32m✔\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m!\x1b[0m ${msg}`);
const fail = (msg) => {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
  process.exit(1);
};

const SemVer = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

/** Tanggal rilis YYYY-MM-DD dalam zona Asia/Bangkok. */
function releaseDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/** Naikkan versi menurut level; prerelease dibersihkan ke rilis stabil. */
function bump(version, level) {
  const m = SemVer.exec(version);
  if (!m) fail(`Versi saat ini tidak valid menurut SemVer: "${version}"`);
  let [maj, min, pat] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (level === 'major') return `${maj + 1}.0.0`;
  if (level === 'minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function gitAvailable() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ---------- args ----------
const args = process.argv.slice(2);
const level = args.find((a) => ['patch', 'minor', 'major'].includes(a));
const noGit = args.includes('--no-git');
const forceYes = args.includes('--yes');
const nameFlagIdx = args.findIndex((a) => a === '--name' || a.startsWith('--name='));
let nameArg = null;
if (nameFlagIdx !== -1) {
  nameArg = args[nameFlagIdx].includes('=')
    ? args[nameFlagIdx].split('=')[1]
    : args[nameFlagIdx + 1];
  nameArg = (nameArg || '').trim() || null;
}

if (!level) {
  console.error(`
📦 KompresNusa — Release CLI (SemVer 2.0.0)

Pemakaian:
  node scripts/release.mjs <patch|minor|major> [--name "Aurora"] [--no-git] [--yes]

  patch → perbaikan bug / penyempurnaan     (v1.2.0 → v1.2.1, mewarisi codename)
  minor → fitur baru yang kompatibel        (v1.2.0 → v1.3.0, codename otomatis)
  major → perubahan besar / breaking        (v1.2.0 → v2.0.0, era baru)
  --name → paksa codename khusus
`);
  process.exit(1);
}

// ---------- 1) baca & validasi ----------
if (!existsSync(PKG_PATH)) fail('package.json tidak ditemukan.');
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
const current = pkg.version;
const next = bump(current, level);
if (current === next) fail('Versi tidak berubah — tidak ada yang perlu dirilis.');

// ---------- codename ----------
const m = SemVer.exec(next);
const [nextMajor, nextMinor] = [Number(m[1]), Number(m[2])];
let codename;
if (nameArg) {
  codename = nameArg.charAt(0).toUpperCase() + nameArg.slice(1);
} else if (level === 'patch') {
  // PATCH mewarisi codename rilis minor yang sedang berjalan
  codename = null;
  if (existsSync(VERSION_TS_PATH)) {
    const old = readFileSync(VERSION_TS_PATH, 'utf8');
    codename = (/APP_VERSION_CODENAME = '([^']+)'/m.exec(old) || [])[1] || null;
  }
  codename = codename || codenameFor(nextMajor, nextMinor, 'minor');
} else {
  codename = codenameFor(nextMajor, nextMinor, level);
}

if (!existsSync(CHANGELOG_PATH)) fail('CHANGELOG.md tidak ditemukan di root project.');
const changelog = readFileSync(CHANGELOG_PATH, 'utf8');

// ---------- 2) segel [Unreleased] ----------
const lines = changelog.split('\n');
const startIdx = lines.findIndex((l) => /^## \[Unreleased\]\s*$/.test(l.trim()));
if (startIdx === -1) fail('Bagian "## [Unreleased]" tidak ditemukan di CHANGELOG.md.');

let endIdx = lines.length;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (/^## \[/.test(lines[i].trim())) {
    endIdx = i;
    break;
  }
}
// potong baris kosong di tepi
let bodyEnd = endIdx;
while (bodyEnd > startIdx + 1 && lines[bodyEnd - 1].trim() === '') bodyEnd--;
const bodyLines = lines.slice(startIdx + 1, bodyEnd);
const body = bodyLines.join('\n').trim();

const hasContent = body.length > 0 && !/^\(isi ringkasan perubahan\)$/i.test(body);
if (!hasContent && !forceYes) {
  fail(
    'Bagian [Unreleased] masih kosong.\n' +
      '  Isi dulu ringkasan perubahan di CHANGELOG.md (Added/Changed/Fixed/Removed/...)\n' +
      '  atau pakai --yes untuk merilis dengan stub otomatis.'
  );
}
const sectionBody = hasContent
  ? body
  : `### ${level === 'patch' ? 'Fixed' : 'Added'}\n- Pembaruan rutin (${level}) — rincian menyusul di worklog.md`;

const date = releaseDate();

// susun changelog baru: intro + [Unreleased] kosong + versi baru + sisanya
const intro = lines.slice(0, startIdx);
const rest = lines.slice(endIdx);
const newChangelog = [
  ...intro,
  '## [Unreleased]',
  '',
  `## [${next}] - ${date} — ${codename}`,
  sectionBody,
  '',
  ...rest,
]
  .join('\n')
  .replace(/\n{4,}/g, '\n\n\n'); // rapikan kelebihan baris kosong

// perbarui tautan compare di kaki changelog (jika ada)
const prevTag = `v${current}`;
const newTag = `v${next}`;
let footerLinks = newChangelog.replace(
  /^\[Unreleased\]: .*$/m,
  `[Unreleased]: https://github.com/prabudanling/bmp/compare/${newTag}...HEAD`
);
if (!/^\[Unreleased\]: /m.test(footerLinks)) {
  footerLinks = footerLinks.replace(
    /\[1\.0\.0\]: .*/m,
    `[1.0.0]: https://github.com/prabudanling/bmp/releases/tag/v1.0.0\n[Unreleased]: https://github.com/prabudanling/bmp/compare/${newTag}...HEAD`
  );
}
if (new RegExp(`^\\[${next}\\]: `, 'm').test(footerLinks)) {
  footerLinks = footerLinks.replace(
    new RegExp(`^\\[${next.replace(/\./g, '\\.')}\\]: .*$`, 'm'),
    `[${next}]: https://github.com/prabudanling/bmp/compare/${prevTag}...${newTag}`
  );
} else {
  footerLinks = footerLinks.replace(
    /^\[Unreleased\]: .*$/m,
    (m0) =>
      `${m0}\n[${next}]: https://github.com/prabudanling/bmp/compare/${prevTag}...${newTag}`
  );
}

// ---------- 3) package.json ----------
const pkgNext = { ...pkg, version: next };

// ---------- 5) src/version.ts ----------
const versionTs = `// ⚠️ AUTO-GENERATED oleh scripts/release.mjs — jangan edit manual.
// Sumber kebenaran: package.json → "version" (${newTag} · ${codename})
// Regenerate: bun run release:patch | release:minor | release:major

export const APP_VERSION = '${next}';
export const APP_VERSION_TAG = '${newTag}';
export const APP_VERSION_CODENAME = '${codename}';
export const APP_RELEASE_LINE = 'v${nextMajor}.${nextMinor} · ${codename}';
export const APP_VERSION_FULL = '${newTag} (${codename})';
export const APP_VERSION_LEVEL = '${level}' as const;
export const APP_RELEASE_DATE = '${date}';
export const APP_NAME = '${pkg.name ?? 'kompresnusa'}';
`;

// ---------- eksekusi ----------
log(`Rilis ${level}: ${prevTag} → ${newTag} · codename «${codename}»  (tanggal ${date}, ${TIMEZONE})`);

writeFileSync(CHANGELOG_PATH, footerLinks);
ok(`CHANGELOG.md disegel: [Unreleased] → [${next}] - ${date}`);
writeFileSync(PKG_PATH, JSON.stringify(pkgNext, null, 2) + '\n');
ok(`package.json → "version": "${next}"`);
writeFileSync(VERSION_PATH, `${newTag} (${codename})\n`);
ok(`VERSION → ${newTag} (${codename})`);
writeFileSync(VERSION_TS_PATH, versionTs);
ok(`src/version.ts di-generate (APP_VERSION=${next})`);

// ---------- 7) git ----------
if (noGit) {
  warn('--no-git: lewati commit & tag.');
} else if (!gitAvailable()) {
  warn('Bukan repository git — commit & tag dilewati.');
} else {
  const files = ['package.json', 'CHANGELOG.md', 'VERSION', 'src/version.ts'].join(' ');
  try {
    execSync(`git add ${files}`, { cwd: ROOT, stdio: 'pipe' });
    const msg = `chore(release): ${newTag} [semver: ${level}]`;
    execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: ROOT, stdio: 'pipe' });
    ok(`git commit: "${msg}"`);
  } catch (e) {
    warn(`git commit dilewati: ${e.message.split('\n')[0]}`);
  }
  try {
    execSync(
      `git tag -a ${newTag} -m ${JSON.stringify(`Release ${newTag} (${codename}) — ${date} — ${level} bump`)}`,
      {
        cwd: ROOT,
        stdio: 'pipe',
      }
    );
    ok(`git tag -a ${newTag} (${codename})`);
  } catch (e) {
    warn(`git tag dilewati: ${e.message.split('\n')[0]}`);
  }
}

console.log(`\n\x1b[35m🎉 Rilis ${newTag} (${codename}) selesai.\x1b[0m`);
console.log('   Riwayat lengkap: CHANGELOG.md · Kebijakan: docs/VERSIONING.md');
console.log(`   Jika perlu dorong ke remote: git push origin main --follow-tags\n`);
