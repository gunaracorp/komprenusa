'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useT, type Entry } from '@/lib/i18n';
import { useLangStore } from '@/stores/lang-store';
import { BrandLogo } from './BrandLogo';

const quickLinks = [
  { labelKey: 'nav.home', href: '#beranda' },
  { labelKey: 'nav.categories', href: '#kategori' },
  { labelKey: 'nav.products', href: '#produk' },
  { labelKey: 'nav.advantages', href: '#keunggulan' },
  { labelKey: 'nav.testimonials', href: '#testimoni' },
  { labelKey: 'nav.contact', href: '#kontak' },
] as const;

const layananLinks: Entry[] = [
  { id: 'Instalasi AC', en: 'AC Installation' },
  { id: 'Service AC', en: 'AC Service & Repair' },
  { id: 'Isi Freon', en: 'Freon Refill' },
  { id: 'Bongkar Pasang AC', en: 'AC Relocation' },
  { id: 'Cuci AC', en: 'AC Cleaning' },
  { id: 'Konsultasi Proyek', en: 'Project Consultation' },
];

const categories: Entry[] = [
  { id: 'AC Split', en: 'Split AC' },
  { id: 'Kompresor', en: 'Compressors' },
  { id: 'Refrigerant', en: 'Refrigerants' },
  { id: 'Spare Part AC', en: 'AC Spare Parts' },
  { id: 'Chiller & VRV/VRF', en: 'Chiller & VRV/VRF' },
  { id: 'Mesin Pendingin', en: 'Cooling Machines' },
];

const infoLinks = [
  { labelKey: 'footer.about', route: '#/tentang' },
  { labelKey: 'footer.faq', route: '#/faq' },
  { labelKey: 'footer.privacy', route: '#/privasi' },
  { labelKey: 'footer.terms', route: '#/syarat' },
] as const;

const brands = [
  'Daikin', 'Panasonic', 'Samsung', 'LG', 'Gree',
  'Mitsubishi', 'Toshiba', 'Fujitsu', 'Copeland', 'Danfoss',
];

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const t = useT();
  const lang = useLangStore((s) => s.lang);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={ref} className="bg-gray-900 text-gray-300">
      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-teal"
      >
        <div className="container mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t('footer.ctaTitle')}
          </h2>
          <p className="text-teal-100 max-w-2xl mx-auto mb-5 text-lg">
            {t('footer.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="bg-white text-teal-800 hover:bg-gray-100 shadow-lg h-12 px-8 font-bold"
                onClick={() => scrollTo('#kontak')}
              >
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {t('footer.ctaButton')}
                </motion.span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <a
                href="https://wa.me/6281350003423"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/15 hover:text-white h-12 px-8 font-semibold"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +62 813-5000-3423
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Footer */}
      <motion.div
        variants={footerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="container mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
            <BrandLogo dark size={40} className="mb-4" />
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {t('footer.desc')}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-3.5 w-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>Encep Sihabudin</span>
              </div>
              <a href="tel:02122682617" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>(021) 2268-2617</span>
              </a>
              <a href="mailto:juragankompresor@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>juragankompresor@gmail.com</span>
              </a>
            </div>
            {/* Contact & Platform Links */}
            <div className="flex items-center gap-2 mt-4">
              <motion.a
                href="https://wa.me/6281350003423"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </motion.a>
              <motion.a
                href="tel:081220030092"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Telepon"
              >
                <Phone className="h-3.5 w-3.5" />
              </motion.a>
              <motion.a
                href="mailto:juragankompresor@gmail.com"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </motion.a>
              <motion.a
                href="https://www.google.com/maps/search/?api=1&query=Kawasan+Industri+MM2100+Bekasi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Google Maps"
              >
                <MapPin className="h-3.5 w-3.5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2.5">
              {layananLinks.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo('#kontak')}
                    className="text-sm text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {item[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Navigasi */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {t(link.labelKey)}
                  </button>
                </li>
                  ))}
                    <li>
                      <a href="/insights" className="text-sm text-gray-400 hover:text-teal-300 transition-colors">
                        Insight HVAC
                      </a>
                    </li>
                  </ul>
                  <ul className="space-y-2.5 mt-5 pt-4 border-t border-gray-800">
              {infoLinks.map((link) => (
                <li key={link.route}>
                  <a
                    href={link.route}
                    className="text-sm text-teal-400/90 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => scrollTo('#produk')}
                    className="text-sm text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {cat[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Brands */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-white text-sm mb-4">{t('footer.brands')}</h4>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <span
                  key={b}
                  className="text-[11px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded hover:bg-gray-700 hover:text-white transition-colors cursor-default"
                >
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Separator className="bg-gray-800" />

      {/* Premium Credits — Strategic Consulting & Digital Platform */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="border-t border-gray-800/70"
      >
        <div className="container mx-auto px-4 py-10">
          {/* Center ornament — hairline + diamond */}
          <div className="flex items-center justify-center gap-4 mb-8" aria-hidden="true">
            <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent to-teal-700/60" />
            <div className="w-1.5 h-1.5 rotate-45 bg-teal-500/90" />
            <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent to-teal-700/60" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0">
            {/* Strategic Consulting Partner */}
            <div className="text-center md:w-1/2 md:px-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 mb-2">
                {t('footer.consulting')}
              </p>
              <p className="font-serif text-base sm:text-lg text-gray-100 tracking-wide">
                PT Top Konsultan Internasional
              </p>
            </div>

            {/* Vertical hairline divider */}
            <div className="hidden md:block w-px h-12 bg-gray-800" aria-hidden="true" />

            {/* Digital Platform Provider */}
            <div className="text-center md:w-1/2 md:px-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 mb-2">
                {t('footer.platform')}
              </p>
              <a
                href="https://digiman.id"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5"
              >
                <span className="font-serif text-base sm:text-lg text-gray-100 tracking-wide group-hover:text-teal-300 transition-colors duration-300">
                  PT Digital Bisnis Manajemen
                </span>
                <span className="text-xs font-medium text-teal-400/80 group-hover:text-teal-300 transition-colors duration-300">
                  digiman.id ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/70">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} PT Juragan Kompresor. {t('footer.rights')}</p>
            <div className="flex items-center gap-4">
              <a
                href="https://digiman.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 transition-colors"
              >
                {t('footer.systemBy')} DIGIMAN
              </a>
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label={t('footer.backToTop')}
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
