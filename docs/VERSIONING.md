# 📦 Sistem Versioning — Juragan Kompresor

> Dokumen kebijakan resmi. Seluruh perubahan pada project ini **wajib** mengikuti sistem di bawah.
> Terakhir diperbarui: 2026-10-22 · Pemilik: PT Juragan Kompresor

---

## 1. Standar Internasional yang Diadopsi

| Standar | Sumber | Fungsi di Project Ini |
|---|---|---|
| **Semantic Versioning 2.0.0** | [semver.org](https://semver.org) | Format nomor versi & kapan naik MAJOR/MINOR/PATCH |
| **Keep a Changelog 1.1.0** | [keepachangelog.com](https://keepachangelog.com) | Struktur `CHANGELOG.md` & kategori perubahan |
| **Conventional Commits 1.0.0** | [conventionalcommits.org](https://conventionalcommits.org) | Format pesan commit git |
| **Git Tagged Releases** | konvensi umum | Tag `vX.Y.Z` per rilis untuk audit & rollback |

---

## 2. Format Versi

```
v MAJOR . MINOR . PATCH
  │       │       └─ perbaikan & penyempurnaan (tidak menambah fitur)
  │       └─ fitur baru yang kompatibel dengan versi sebelumnya
  └─ perubahan besar / breaking (tidak kompatibel dengan versi sebelumnya)
```

Contoh: `v1.3.0` → dibaca "versi 1, fitur ke-3".
Prerelease (opsional): `v2.0.0-beta.1` — hanya untuk uji coba sebelum rilis besar.

### 2.1 Kapan Naik MAJOR (x → x+1.0.0)

- Ganti framework/arsitektur inti (mis. Next.js → lainnya)
- Perubahan skema database yang **memutus** data/fitur lama
- Menghapus fitur utama yang sudah dipakai publik
- Rebranding total identitas (nama domain, entitas hukum)
- Perubahan API/kontrak yang membuat integrasi lama gagal

### 2.2 Kapan Naik MINOR (x.y → x.y+1.0)

- Halaman/section baru di situs (mis. katalog, insight, halaman layanan)
- Fitur baru yang kompatibel (mis. sistem versioning ini, pencarian baru, filter baru)
- Integrasi baru (WhatsApp API, pembayaran, analitik)
- Peningkatan besar tampilan yang menambah kemampuan (bukan sekadar rapikan)

### 2.3 Kapan Naik PATCH (x.y.z → x.y.z+1)

- Perbaikan bug (tombol tidak jalan, data salah tampil)
- Penyempurnaan gaya/align/padding tanpa fitur baru
- Perbaikan SEO/meta/aksesibilitas
- Refactor internal tanpa perubahan perilaku

### 2.4 Contoh Nyata dari Riwayat Project Ini

| Versi | Jenis | Alasan |
|---|---|---|
| `v1.0.0` | Rilis awal | Instalasi repository & situs hidup (620 produk) |
| `v1.1.0` | **MINOR** | Rebranding total BMP → Juragan Kompresor + skema warna + logo baru (fitur/kemampuan baru, kompatibel) |
| `v1.2.0` | **MINOR** | Lockup merek premium `BrandLogo` + konsistensi 5 titik sentuh |
| `v1.3.0` | **MINOR** | Sistem versioning internasional (infrastruktur baru) |
| `v1.2.1`* | **PATCH** | (contoh) memperbaiki posisi badge keranjang — tanpa fitur baru |

\* ilustratif

---

## 3. Alur Rilis (Release Flow) — Wajib untuk Setiap Perubahan

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. KERJAKAN PERUBAHAN (kode, desain, konten, dsb.)              │
│ 2. CATAT di CHANGELOG.md → bagian [Unreleased]                  │
│    gunakan kategori: Added / Changed / Fixed / Removed /        │
│    Deprecated / Security                                        │
│ 3. RILIS:                                                       │
│    bun run release:patch   → v1.2.0 → v1.2.1                    │
│    bun run release:minor   → v1.2.0 → v1.3.0                    │
│    bun run release:major   → v1.2.0 → v2.0.0                    │
│    Script otomatis:                                             │
│    ✔ naikkan version di package.json                            │
│    ✔ tulis file VERSION                                         │
│    ✔ generate src/version.ts                                    │
│    ✔ segel [Unreleased] → [x.y.z] - tanggal (Asia/Bangkok)      │
│    ✔ git commit "chore(release): vX.Y.Z" + git tag vX.Y.Z       │
│ 4. UPDATE worklog.md (format terstruktur → bab 5)               │
│ 5. VERIFIKASI: bun run lint + cek visual via browser            │
└─────────────────────────────────────────────────────────────────┘
```

> **Aturan emas:** Tidak ada perubahan yang lolos tanpa tercatat di
> `CHANGELOG.md` dan membawa nomor versi. Satu perubahan = satu jejak.

---

## 4. Format CHANGELOG.md (Keep a Changelog)

Bagian `[Unreleased]` selalu ada di paling atas. Kategori resmi:

| Kategori | Dipakai untuk |
|---|---|
| **Added** | Fitur/baru yang ditambahkan |
| **Changed** | Perubahan pada fitur yang sudah ada |
| **Deprecated** | Fitur yang akan dihapus (beri target versi) |
| **Removed** | Fitur yang dihapus pada versi ini |
| **Fixed** | Perbaikan bug |
| **Security** | Perbaikan kerentanan |

---

## 5. Format Worklog Terstruktur (per Task)

Setiap entri `worklog.md` wajib memakai templat ini:

```markdown
---
Task ID: <nomor urut>
Version: vX.Y.Z          ← versi yang dihasilkan task ini
Level: patch|minor|major ← alasan kenaikan versi
Agent: <nama agen>
Task: <ringkasan tugas>

Work Log:
- <langkah konkret 1>
- <langkah konkret 2>

Stage Summary:
- <hasil utama / keputusan penting / artefak>

Changelog Digest:
- Added: <...>
- Changed: <...>
- Fixed: <...>
- Removed: <...>
```

---

## 6. Format Pesan Commit (Conventional Commits)

```
<type>(<scope>): <deskripsi singkat>

Type resmi:
  feat     fitur baru            → biasanya MINOR
  fix      perbaikan bug         → biasanya PATCH
  style    tampilan/format       → PATCH
  refactor internal, tanpa perubahan perilaku → PATCH
  docs     dokumentasi           → PATCH
  chore    pemeliharaan/rilis    → sesuai isi
  perf     performa              → PATCH
  feat!    breaking change       → MAJOR
```

Contoh: `feat(catalog): tambah filter tipe kompresor`, `fix(header): nav keluar dari struktur semantic`.

---

## 7. Sumber Kebenaran Versi (Single Source of Truth)

Rantai sinkronisasi otomatis oleh `scripts/release.mjs`:

```
package.json "version"   ← SUMBER UTAMA
   ├─→ VERSION            (teks pola v.X.Y.Z, untuk cepat dibaca siapa pun)
   ├─→ src/version.ts     (konstanta untuk UI — badge footer)
   └─→ CHANGELOG.md       (segel riwayat) + git tag vX.Y.Z
```

> ⚠️ `src/version.ts` adalah file **auto-generated** — jangan diedit manual.
> ⚠️ Jangan pernah mengubah `package.json "version"` manual — selalu lewat `bun run release:*`.

---

## 8. Kebijakan Codename (Nama Rilis) — gaya Ubuntu/Android

Setiap **rilis MINOR** mendapat satu **codename** bergaya internasional.
PATCH mewarisi codename minor yang sedang berjalan (seperti *point release* Ubuntu:
"20.04.2 LTS (Focal Fossa)"). MAJOR membuka **era baru**.

| Garis rilis | Aturan | Contoh |
|---|---|---|
| MINOR `v1.4.0` | Codename otomatis dari pool "Dingin & Tenaga" (urut nomor minor) | v1.3→**Nexus**, v1.4→**Aurora**, v1.5→**Blizzard**, v1.6→**Cryo**, v1.7→**Glacier**, v1.8→**Kelvin** … |
| PATCH `v1.3.1` | Mewarisi codename minor | v1.3.1 → **Nexus** |
| MAJOR `v2.0.0` | Era baru dari pool "Nusantara" | v1→era *Genesis*, v2→era **Garuda**, v3→**Nusantara** … |
| Khusus | `bun run release:minor -- --name "Aurora"` | paksa codename manual |

**Pool MINOR (24):** Nexus · Aurora · Blizzard · Cryo · Glacier · Kelvin · Polar · Subzero · Tundra ·
Permafrost · Avalanche · Arctic · Snowcap · Zephyr · Iceberg · Frostline · Cirrus · Boreal ·
Isobar · Absolute · Crystal · Hailstorm · Winteria · Frostbyte

**Pool MAJOR (6):** Genesis · Garuda · Nusantara · Majapahit · Sriwijaya · Bhinneka

Codename tercetak di: `VERSION`, `src/version.ts` (`APP_VERSION_CODENAME`), heading `CHANGELOG.md`,
anotasi git tag, dan badge footer situs.

---

## 9. Riwayat Versi — Ringkas

| Versi | Codename | Tanggal (Asia/Bangkok) | Ringkasan |
|---|---|---|---|
| v1.0.0 | Genesis | 2026-10-21 | Instalasi repository, situs HVAC live |
| v1.1.0 | Genesis | 2026-10-21 | Rebranding total → Juragan Kompresor + warna & logo baru |
| v1.2.0 | Genesis | 2026-10-21 | Lockup merek premium di 5 titik sentuh |
| v1.3.0 | **Nexus** | 2026-10-22 | Sistem versioning internasional ini |
| v1.3.1 | **Nexus** | 2026-10-22 | Fix hydration mismatch logo + badge codename di footer |

Detail lengkap: lihat [`CHANGELOG.md`](../CHANGELOG.md).

> Catatan: sistem codename resmi dimulai di garis v1.3 — versi sebelumnya
> retroaktif diberi codename era *Genesis* untuk konsistensi arsip.
