'use client';

import { motion } from 'framer-motion';

/**
 * LogoMark — emblem resmi Juragan Kompresor versi inline SVG.
 * PENTING (anti hydration-mismatch): uid WAJIB statis eksplisit per lokasi
 * pemakaian (mis. 'hdr', 'mnu', 'ftr') — JANGAN memakai useId(), karena
 * posisi pohon komponen bisa berbeda antara SSR dan client (efek NoSSR)
 * sehingga id gradien SVG tidak cocok saat hydration.
 */
export function LogoMark({
  size = 44,
  className = '',
  uid = 'jk',
}: {
  size?: number;
  className?: string;
  uid?: string;
}) {
  const bgId = `jk-bg-${uid}`;
  const glowId = `jk-glow-${uid}`;
  const spokeId = `jk-spoke-${uid}`;

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Logo Juragan Kompresor"
    >
      <defs>
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#042f2e" />
          <stop offset="45%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <radialGradient id={glowId} cx="30%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Latar: gradien teal pekat (dingin, tepercaya) */}
      <rect width="512" height="512" rx="112" fill={`url(#${bgId})`} />
      <rect width="512" height="512" rx="112" fill={`url(#${glowId})`} />

      {/* Cincin emas juragan */}
      <circle cx="256" cy="256" r="206" fill="none" stroke="#f59e0b" strokeWidth="8" strokeOpacity="0.92" />

      {/* Kepingan salju: satu lengan, diputar 6x */}
      <g stroke="#ffffff" strokeWidth="20" strokeLinecap="round" fill="none">
        <g id={spokeId}>
          <path d="M 256 250 L 256 110" />
          <path d="M 256 172 L 226 142" />
          <path d="M 256 172 L 286 142" />
          <path d="M 256 128 L 233 105" />
          <path d="M 256 128 L 279 105" />
        </g>
        <use href={`#${spokeId}`} transform="rotate(60 256 256)" />
        <use href={`#${spokeId}`} transform="rotate(120 256 256)" />
        <use href={`#${spokeId}`} transform="rotate(180 256 256)" />
        <use href={`#${spokeId}`} transform="rotate(240 256 256)" />
        <use href={`#${spokeId}`} transform="rotate(300 256 256)" />
      </g>

      {/* Hub emas: jantung kompresor */}
      <circle cx="256" cy="256" r="36" fill="#f59e0b" />
      <circle cx="256" cy="256" r="15" fill="#042f2e" />
    </svg>
  );
}

type BrandLogoProps = {
  /** true = versi untuk latar gelap (teal-900) seperti footer & sheet mobile */
  dark?: boolean;
  className?: string;
  /** ukuran emblem dalam px */
  size?: number;
  /** uid statis unik per lokasi pemakaian (wajib beda antar instance) */
  uid?: string;
};

/**
 * BrandLogo — lockup merek lengkap: emblem + wordmark dua-warna.
 * "JURAGAN" solid (slate-900 / putih) + "KOMPRESOR" gradasi emas premium,
 * disertai sub-brand HVAC & Refrigerasi dengan aksen garis emas.
 */
export function BrandLogo({ dark = false, className = '', size = 44, uid = 'jk' }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* Emblem */}
      <motion.div
        whileHover={{ scale: 1.07, rotate: -4 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        className="shrink-0"
      >
        <div
          className={`rounded-xl overflow-hidden ring-1 transition-all duration-300 ${
            dark
              ? 'ring-white/20 shadow-lg shadow-black/30 group-hover:ring-amber-400/70 group-hover:shadow-amber-500/25'
              : 'ring-black/10 shadow-md shadow-teal-900/10 group-hover:ring-amber-400/60 group-hover:shadow-lg group-hover:shadow-amber-500/20'
          }`}
        >
          <LogoMark size={size} uid={uid} className="block w-full h-full" />
        </div>
      </motion.div>

      {/* Wordmark — selalu tampil, ukuran responsif agar brand terlihat di semua layar */}
      <div className="leading-none">
        <div className="flex items-baseline whitespace-nowrap gap-[0.22em]">
          <span
            className={`font-extrabold tracking-tight text-base sm:text-lg ${
              dark ? 'text-white' : 'text-slate-900'
            }`}
          >
            JURAGAN
          </span>
          <span
            className={`font-extrabold tracking-tight text-base sm:text-lg bg-clip-text text-transparent ${
              dark
                ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600'
            }`}
          >
            KOMPRESOR
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={`h-[2px] w-3 sm:w-4 rounded-full bg-gradient-to-r ${
              dark ? 'from-amber-300 to-amber-300/0' : 'from-amber-400 to-amber-400/0'
            }`}
            aria-hidden="true"
          />
          <span
            className={`text-[8px] sm:text-[9px] font-bold tracking-[0.18em] sm:tracking-[0.24em] uppercase ${
              dark ? 'text-teal-200/90' : 'text-teal-700/90'
            }`}
          >
            HVAC &amp; Refrigerasi
          </span>
        </div>
      </div>
    </div>
  );
}
