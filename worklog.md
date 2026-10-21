---
Task ID: 1
Agent: Z.ai Code (main orchestrator)
Task: Install repository https://github.com/prabudanling/bmp ke proyek Next.js, rebranding total "Berkat Mandiri Pendingin"/"BMP" → "Juragan Kompresor", pilih skema warna terbaik.

Work Log:
- Clone repo bmp (235MB) ke /tmp/bmp-repo; identifikasi sebagai website distributor HVAC Next.js 16 + PGlite + Drizzle (620 produk, 25 brand, 512 gambar).
- Salin src/, public/, db/ (pglite-data 33MB), prisma/, scripts/, konfigurasi ke /home/z/my-project; skip arsip tar website-kompresor-bmp (102MB), .git, tool-results.
- bun install (deps tambahan: @electric-sql/pglite, drizzle-orm, pg, dropbox, @neondatabase/auth, @vercel/*).
- Rebranding kode case-aware: semua varian "BERKAT MANDIRI PENDINGIN / Berkat Mandiri Pendingin / berkat / berkatmandiripendingin / BMP" → "Juragan Kompresor / juragankompresor / JK" (src, scripts, prisma, public/llms.txt). Folder src/components/berkat → src/components/juragankompresor. localStorage bmp-lang→jk-lang, berkat-cart→juragan-cart, watermark bmp-product-catalog-v1→jk-product-catalog-v1. Format file .bmp (image/bmp) sengaja dipertahankan. Nama bank "Mandiri" di InfoPages dipertahankan (bukan brand lama).
- FIX AKAR MASALAH DB: PGlite gagal init — "could not open directory pg_notify" karena git tidak menyimpan folder kosong. Dibuat ulang 10 folder runtime PostgreSQL (pg_notify, pg_replslot, pg_tblspc, pg_twophase, pg_commit_ts, pg_dynshmem, pg_serial, pg_snapshots, pg_stat, pg_stat_tmp) + subfolder pg_logical/mappings, pg_logical/snapshots, pg_wal/archive_status, pg_wal/summaries. PGlite 0.5.11 gagal di runtime Bun tapi sukses di Node → script maintenance dijalankan via node.
- Rebrand database PGlite (script node ephemeral): 8 tabel, 66 kolom text dipindai; 125 baris diperbarui (products.description 106, products.brand 12, testimonials.content 7) — verifikasi regex akhir = 0 sisa.
- Desain logo baru: bunga salju putih + cincin & hub emas amber pada gradien teal (public/images/logo.svg, public/logo.svg, src/app/icon.svg — aria-label "Logo Juragan Kompresor").
- Warna terbaik dipilih & diterapkan: Deep Teal (dingin/pendingin) + Amber Gold (aksen premium "juragan") — CTA hero jadi gradient amber-400→500, ditambah token --color-amber-300/400, utility .bg-gradient-gold, .text-gradient-gold, .glow-gold di globals.css. Subtitle brand diubah jadi "HVAC & Refrigerasi" (Header desktop+mobile, Footer).
- Ganti auth Neon (butuh infra cloud, bikin /admin 500) → auth lokal cookie HMAC-SHA256: src/lib/auth.ts (getSessionUser/getAdminUser/requireAdmin/signOutAction/GET endpoint), src/lib/auth-actions.ts (signInAction timing-safe), src/components/cms/admin-login-form.tsx pakai server action, hapus src/lib/auth-client.ts. Kredensial di .env: CMS_ADMIN_EMAIL/CMS_ADMIN_PASSWORD/CMS_SESSION_SECRET.
- Hapus public/robots.txt (konflik dengan robots.ts dinamis → 500). robots.ts sehat.
- FIX HYDRATION MISMATCH: badge jumlah keranjang (zustand persist) dibungkus <NoSSR> di Header.tsx.
- REBADGE 500 gambar produk turunan via sharp (scripts/rebadge-images.mjs, dihapus setelah selesai): sampling warna badge asli per gambar lalu timpa lingkaran solid + teks "JK" — 500/500 sukses, nol gagal.
- Verifikasi Agent Browser: homepage (ID/EN switch OK), /produk + filter kategori (110 varian scroll), detail produk + JSON-LD lengkap (Product/Offer/FAQ/Breadcrumb/Organization), keranjang + toast + drawer + subtotal, login admin → dashboard 620 produk, /insights, robots.txt, sitemap.xml (623 URL), llms.txt, viewport mobile 390px + footer.
- bun run lint: nol error. dev.log: nol error, semua route 200.

Stage Summary:
- Website "Juragan Kompresor" hidup di port 3000 — 620 produk, 25 brand, sitemap 623 URL, SEO 5 lapis, dwi-bahasa ID/EN, CMS admin berfungsi.
- NOL sisa brand lama di: kode, database, gambar, logo, favicon, metadata, JSON-LD, llms.txt, localStorage key, watermark version.
- Kredensial admin: admin@juragankompresor.com / juraganadmin2026 (di .env).
- Skema warna final: Deep Teal (#0F766E/#0D9488) + Amber Gold (#F59E0B) + Slate.
- Catatan teknis: script maintenance PGlite HARUS via node (bukan bun); folder runtime PostgreSQL kosong tidak ter-track git — bila clone ulang, buat ulang folder (pg_notify dkk.).

---
Task ID: 2
Agent: Z.ai Code (main orchestrator)
Task: Rebranding visual header "Juragan Kompresor" agar terlihat keren & premium (user: teks header lama tidak enak dipandang).

Work Log:
- Diagnosa: lockup header lama = teks polos text-sm satu warna teal + ikon Snowflake generik dalam kotak kecil → terlihat datar/murah.
- Buat komponen baru src/components/juragankompresor/BrandLogo.tsx: ekspor LogoMark (emblem SVG inline dari logo.svg dengan useId() anti-tabrakan id) + BrandLogo (lockup lengkap, prop dark & size).
- Desain wordmark baru: "JURAGAN" extrabold slate-900 (putih pada varian dark) + "KOMPRESOR" gradasi emas bg-clip-text, jarak antar kata gap-[0.22em], sub-brand "HVAC & REFRIGERASI" uppercase tracking-lebar dengan dash emas; emblem responsif hover (tilt -4° + glow emas via framer-motion spring).
- Wordmark kini TAMPIL di mobile (sebelumnya hidden sm:block) dengan ukuran responsif text-base sm:text-lg — brand terlihat di semua layar.
- Terapkan di: Header desktop (ganti blok lama), sheet menu mobile (varian dark), Footer (varian dark, hapus lockup lama).
- FIX BUG STRUKTUR: `</nav>` di Header menutup prematur — link "Katalog kompresor" & "Insight HVAC" berada di luar nav; dipindah ke dalam nav + whitespace-nowrap agar tidak patah 2 baris.
- Samakan header halaman server-component: /produk (ganti link ArrowLeft teks → emblem next/image unoptimized + wordmark dua-warna) dan /insights (ganti kotak Snowflake → emblem + wordmark, varian dark).
- Bersihkan import tak terpakai (Snowflake di Header & Footer).
- Verifikasi Agent Browser: homepage desktop + scrolled (backdrop-blur OK), mobile 390px (lockup muat, header width OK), sheet mobile, footer, /produk, /insights; console & page errors = 0; semua route 200 di dev.log; bun run lint = 0 error.
- Catatan: dev server sempat mati saat sesi (port 3000 bebas) → di-restart via `bun run dev` background, pulih normal.

Stage Summary:
- Lockup merek baru konsisten di 5 titik: Header desktop, sheet mobile, Footer, header /produk, header /insights — emblem teal+emas & wordmark dua-warna (JURAGAN gelap + KOMPRESOR emas).
- Komponen reusable BrandLogo (dark/size props) siap dipakai halaman lain; LogoMark bisa dipakai terpisah.
- Palet tetap Deep Teal + Amber Gold; kontras AA pada teks besar (amber-600 di latar putih).
