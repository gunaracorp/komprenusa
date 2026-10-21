# Changelog — Juragan Kompresor

Seluruh perubahan penting pada project ini didokumentasikan di file ini.

Format mengikuti **[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)**;
penomoran versi mengikuti **[Semantic Versioning 2.0.0](https://semver.org/)**;
tanggal memakai zona **Asia/Bangkok (UTC+7)**.
Kebijakan lengkap: [`docs/VERSIONING.md`](docs/VERSIONING.md).

## [Unreleased]

## [1.3.2] - 2026-10-22 — Nexus
### Changed
- Revisi data resmi perusahaan di seluruh situs & SEO: tahun berdiri **2010 → 2008**, jumlah proyek **5.000+ → 7.439**, jangkauan **34 provinsi / 50+ kota → 38 provinsi seluruh Indonesia**
- Statistik diperbarui: badge hero "Sejak 2008", stat proyek 7,439+, umur perusahaan 18+ tahun, badge jangkauan "38 Provinsi Indonesia", FAQ & JSON-LD (`foundingDate: 2008`), metadata & judul SEO, `llms.txt`
### Fixed
- Database: 190 klaim usang pada 191 deskripsi produk diperbarui (107× tahun berdiri, 83× jangkauan provinsi) dengan pola aman — nomor model seperti `SH2010410A` dijaga utuh

## [1.3.1] - 2026-10-22 — Nexus
### Added
- **Sistem codename rilis** (gaya Ubuntu/Android): pool otomatis 24 codename MINOR (Nexus, Aurora, Blizzard, …) + 6 era MAJOR (Genesis, Garuda, Nusantara, …); PATCH mewarisi codename minor; override via `--name`
- Badge footer kini menampilkan versi + codename (mis. `v1.3.1 · Nexus`)
### Fixed
- **Hydration mismatch** pada logo SVG (`useId()` menghasilkan id gradien berbeda antara SSR & client akibat pergeseran posisi pohon oleh `NoSSR`) → diganti uid statis eksplisit per lokasi (`hdr`, `mnu`, `ftr`)

## [1.3.0] - 2026-10-22
### Added
- Sistem versioning standar internasional: kebijakan `docs/VERSIONING.md` (SemVer 2.0.0, Keep a Changelog 1.1.0, Conventional Commits 1.0.0)
- `scripts/release.mjs` — CLI rilis otomatis: naikkan versi, sinkron `VERSION` & `src/version.ts`, segel changelog, commit + tag git
- Perintah rilis: `release`, `release:patch`, `release:minor`, `release:major`
- `src/version.ts` (auto-generated) — sumber versi untuk UI
- Badge versi aplikasi pada footer situs
- Tag git retroaktif `v1.0.0`, `v1.1.0`, `v1.2.0` untuk merapikan riwayat sebelum sistem ini ada

## [1.2.0] - 2026-10-21
### Added
- Komponen `BrandLogo` — emblem SVG inline (cincin emas + salju) + wordmark dua-warna, varian `dark` & ukuran responsif; emblem animasi tilt + glow emas saat hover
- Wordmark merek kini tampil di layar mobile (sebelumnya tersembunyi di bawah 640px)
### Changed
- Lockup merek premium dipakai seragam di 5 titik: header desktop, sheet menu mobile, footer, header `/produk`, header `/insights`
- Nav link "Katalog kompresor" & "Insight HVAC" kini satu baris (`whitespace-nowrap`)
### Fixed
- Bug struktur HTML: `</nav>` menutup prematur sehingga 2 link berada di luar `<nav>` (berdampak SEO & aksesibilitas)
- Import ikon tak terpakai (`Snowflake`) di Header & Footer

## [1.1.0] - 2026-10-21
### Added
- Identitas visual baru: logo bunga salju + cincin emas pada gradien teal (`public/images/logo.svg`, `public/logo.svg`, `src/app/icon.svg`)
- Skema warna **Deep Teal + Amber Gold** + utilitas `.bg-gradient-gold`, `.text-gradient-gold`, `.glow-gold`
- Autentikasi admin lokal (cookie HMAC-SHA256 timing-safe) menggantikan Neon Auth yang butuh infrastruktur cloud
- Skrip `scripts/rebadge-images.mjs` untuk rebadge massal gambar produk
### Changed
- **Rebranding total** "Berkat Mandiri Pendingin"/"BMP" → "Juragan Kompresor": seluruh kode (case-aware), database (125 baris di 8 tabel), metadata SEO, JSON-LD, `llms.txt`, kunci localStorage (`jk-lang`, `juragan-cart`), watermark katalog
- 500 gambar produk di-rebadge inisial "JK" (sharp)
- Subtitle merek → "HVAC & Refrigerasi"
### Fixed
- Inisialisasi PGlite: 14 folder runtime PostgreSQL yang hilang dibuat ulang (pg_notify, pg_wal, dll.)
- Konflik `public/robots.txt` statis vs `robots.ts` dinamis (penyebab 500)
- Hydration mismatch badge jumlah keranjang (dibungkus `<NoSSR>`)
### Security
- Kredensial admin dipindah ke `.env` (`CMS_ADMIN_*`); verifikasi sesi timing-safe

## [1.0.0] - 2026-10-21
### Added
- Instalasi repository HVAC (Next.js 16 + App Router, PGlite/Postgres lokal)
- Katalog 620 produk, 25 brand, 512 gambar produk
- SEO 5 lapis (metadata, OpenGraph, JSON-LD Product/Offer/FAQ/Breadcrumb/Organization, `robots.ts`, `sitemap.xml` 623 URL, `llms.txt`)
- Situs dwi-bahasa Indonesia/English (zustand persist)
- Keranjang belanja + drawer + toast, CMS admin (620 produk terkelola)

[Unreleased]: https://github.com/prabudanling/bmp/compare/v1.3.2...HEAD
[1.3.2]: https://github.com/prabudanling/bmp/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/prabudanling/bmp/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/prabudanling/bmp/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/prabudanling/bmp/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/prabudanling/bmp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/prabudanling/bmp/releases/tag/v1.0.0
