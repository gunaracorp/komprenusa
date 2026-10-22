'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Truck, Clock, Headphones } from 'lucide-react';
import Image from 'next/image';
import { useT, type DictKey } from '@/lib/i18n';

const trustBadges = [
  { icon: Shield, labelKey: 'hero.badge.warranty' },
  { icon: Truck, labelKey: 'hero.badge.shipping' },
  { icon: Clock, labelKey: 'hero.badge.fast' },
  { icon: Headphones, labelKey: 'hero.badge.consult' },
] as const;

export function Hero() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const bgY3 = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="beranda"
      className="relative overflow-hidden bg-gradient-hero min-h-[600px] lg:min-h-[700px] flex items-center"
    >
      {/* Parallax floating background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: bgY1 }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-float"
        />
        <motion.div
          style={{ y: bgY2 }}
          className="absolute -bottom-32 -left-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-float-delayed"
        />
        <motion.div
          style={{ y: bgY3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div style={{ y: contentY }} className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content - staggered entrance */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6"
            >
              {t('hero.title1')}{' '}
              <span className="text-gradient-teal">{t('hero.titleHighlight')}</span>{' '}
              {t('hero.title2')}{' '}
              <span className="text-teal-200">{t('hero.titleHighlight2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="text-white/90 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-teal-950 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 text-base px-8 h-12 font-bold"
                  onClick={() => scrollTo('#produk')}
                >
                  {t('hero.ctaCatalog')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/15 hover:text-white text-base px-8 h-12 font-semibold"
                  onClick={() => scrollTo('#kontak')}
                >
                  {t('hero.ctaConsult')}
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust badges - staggered */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trustBadges.map((badge, i) => (
                <motion.div
                  key={badge.labelKey}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <badge.icon className="h-4 w-4 text-teal-300 shrink-0" />
                  <span className="text-xs font-medium">{t(badge.labelKey)}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block relative"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative h-[380px] xl:h-[460px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10"
            >
              <Image
                src="/images/hero/hero-1.png"
                alt="Sistem pendingin HVAC modern KompresNusa"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/40 to-transparent" />
            </motion.div>

            {/* Floating stat card - bottom left */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 1.0, type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileInView={{
                y: [0, -6, 0],
                transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
              viewport={{ once: false }}
              className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl shadow-black/10 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                  <span className="text-lg">🏢</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">7,439+</div>
                  <div className="text-xs text-gray-600 font-medium">{t('hero.stat.projects')}</div>
                </div>
              </div>
            </motion.div>

            {/* Floating stat card - top right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileInView={{
                y: [0, -8, 0],
                transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              }}
              viewport={{ once: false }}
              className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-xl shadow-black/10 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-xs text-gray-600 font-medium">{t('hero.stat.rating')}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
