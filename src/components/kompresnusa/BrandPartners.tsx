'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { Award } from 'lucide-react';

const brands = [
  'Daikin',
  'Panasonic',
  'Samsung',
  'LG',
  'Gree',
  'Mitsubishi',
  'Toshiba',
  'Fujitsu',
  'Copeland',
  'Danfoss',
  'Bitzer',
  'Emerson',
  'Tecumseh',
  'Honeywell',
  'Chemours',
  'Carrier',
  'York',
  'McQuay',
  'Trane',
  'Refcomp',
  'Embraco',
];

// Split brands into two rows
const mid = Math.ceil(brands.length / 2);
const row1 = brands.slice(0, mid);
const row2 = brands.slice(mid);

function MarqueeRow({
  items,
  direction,
  paused,
}: {
  items: string[];
  direction: 'left' | 'right';
  paused: boolean;
}) {
  const duplicated = [...items, ...items];
  const animationName = direction === 'left' ? 'marquee-scroll-left' : 'marquee-scroll-right';

  return (
    <div className="relative overflow-hidden w-full">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

      <div
        className={`flex w-max gap-3 ${paused ? '[animation-play-state:paused]' : ''}`}
        style={{
          animation: `${animationName} 40s linear infinite`,
        }}
      >
        {duplicated.map((brand, i) => (
          <div
            key={`${brand}-${i}`}
            className="flex-shrink-0 flex items-center justify-center px-5 py-3 rounded-xl border border-gray-200 bg-white hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center">
                <span className="text-xs font-extrabold text-teal-700">
                  {brand.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {brand}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Keyframe definitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      ` }} />
    </div>
  );
}

export function BrandPartners() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [paused, setPaused] = useState(false);

  const handleMouseEnter = useCallback(() => setPaused(true), []);
  const handleMouseLeave = useCallback(() => setPaused(false), []);

  return (
    <section id="brand" className="py-16 lg:py-24 bg-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4"
          >
            <Award className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">Brand Tersedia</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Didukung Brand <span className="text-teal-800">Terpercaya</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kami adalah distributor resmi berbagai brand pendingin terkemuka dunia,
            menjamin produk original dengan garansi resmi untuk setiap pembelian.
          </p>
        </motion.div>

        {/* Marquee rows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <MarqueeRow items={row1} direction="left" paused={paused} />
          <MarqueeRow items={row2} direction="right" paused={paused} />
        </motion.div>
      </div>
    </section>
  );
}
