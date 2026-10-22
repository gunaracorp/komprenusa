'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { NoSSR } from '@/components/ui/no-ssr';
import {
  Menu,
  ShoppingCart,
  Phone,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useT, type DictKey } from '@/lib/i18n';
import { LangSwitcher } from './LangSwitcher';
import { BrandLogo } from './BrandLogo';

type NavItem = {
  labelKey: DictKey;
  href: string;
  /** true = hanya tampil mulai breakpoint xl (hemat ruang di laptop 1024–1279px) */
  xlOnly?: boolean;
};

/**
 * Produk → halaman katalog (/produk). Item anchor (#) scroll mulus di homepage,
 * item path dinavigasi SPA via router. Item sekunder disembunyikan di bawah xl
 * agar nav tidak pernah meluber/terpotong (bug v2.0.1 di viewport 1024px).
 */
const navItems: NavItem[] = [
  { labelKey: 'nav.home', href: '#beranda' },
  { labelKey: 'nav.categories', href: '#kategori' },
  { labelKey: 'nav.products', href: '/produk' },
  { labelKey: 'nav.advantages', href: '#keunggulan' },
  { labelKey: 'nav.testimonials', href: '#testimoni', xlOnly: true },
  { labelKey: 'nav.contact', href: '#kontak' },
  { labelKey: 'nav.insights', href: '/insights', xlOnly: true },
];

const WHATSAPP_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const t = useT();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (href: string) => {
    setMobileOpen(false);
    setSearchExpanded(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.push(href);
    }
  };

  return (
    <>
      {/* ═══ TOPBAR — dua zona bersih: kontak (kiri) · layanan & bahasa (kanan) ═══ */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-teal-50/90 text-xs">
        <div className="container mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-3">
          {/* Kiri: WhatsApp online + telepon */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <a
              href="https://wa.me/6281350003423"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium hover:text-white transition-colors"
              aria-label="Chat WhatsApp +62 813-5000-3423"
            >
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={WHATSAPP_PATH} />
              </svg>
              +62 813-5000-3423
            </a>
            <span className="hidden sm:block h-3 w-px bg-white/15" aria-hidden="true" />
            <a
              href="tel:+6281220030092"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
              aria-label="Telepon +62 812-2003-0092"
            >
              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
              +62 812-2003-0092
            </a>
          </div>
          {/* Kanan: pengiriman + bahasa */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-teal-100/80">
              <Truck className="h-3.5 w-3.5 text-amber-300/90" aria-hidden="true" />
              {t('topbar.shipping')}
            </span>
            <LangSwitcher dark />
          </div>
        </div>
      </div>

      {/* ═══ MAIN HEADER ═══ */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300 ease-out',
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(4,47,46,0.18)] border-b border-teal-900/[0.06]'
            : 'bg-white border-b border-transparent'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div
            className={cn(
              'flex items-center justify-between gap-2 lg:gap-4 transition-[height] duration-300',
              scrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-[72px]'
            )}
          >
            {/* Logo */}
            <button
              onClick={() => goTo('#beranda')}
              className="shrink-0"
              aria-label="Kompresa — kembali ke beranda"
            >
              <BrandLogo size={42} uid="hdr" />
            </button>

            {/* Desktop Nav — terpusat, pil halus, tidak pernah meluber */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0" aria-label="Navigasi utama">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => goTo(item.href)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium text-slate-600 rounded-full hover:text-teal-800 hover:bg-teal-50/80 transition-all duration-200',
                    item.xlOnly && 'hidden xl:inline-block'
                  )}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* CTA utama — gradasi emas, konsisten dengan CTA hero */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-gold text-slate-900 font-semibold shadow-md shadow-amber-500/20 hover:opacity-90 px-4"
                  onClick={() => goTo('#kontak')}
                >
                  <Phone className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  {t('header.contactUs')}
                </Button>
              </motion.div>

              {/* Search — desktop: pil expand; tablet kecil: ikon scroll ke katalog */}
              <div className="flex items-center">
                <motion.div
                  className="hidden md:flex items-center"
                  animate={{ width: searchExpanded ? 244 : 40 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="relative w-full">
                    {searchExpanded && (
                      <motion.input
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        type="text"
                        placeholder={t('header.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setSearchExpanded(false);
                        }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 h-9 w-full text-sm rounded-full border border-slate-200 bg-slate-50/90 pl-4 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-300"
                        autoFocus
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-9 w-9 rounded-full hover:bg-teal-50"
                      onClick={() => setSearchExpanded(!searchExpanded)}
                      aria-label={t('header.searchAria')}
                      aria-expanded={searchExpanded}
                    >
                      {searchExpanded ? (
                        <X className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      ) : (
                        <Search className="h-4 w-4 text-slate-600" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex md:hidden h-9 w-9 rounded-full hover:bg-teal-50"
                  onClick={() => goTo('/produk')}
                  aria-label={t('header.searchProductAria')}
                >
                  <Search className="h-4 w-4 text-slate-600" aria-hidden="true" />
                </Button>
              </div>

              {/* Keranjang */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative rounded-full h-10 w-10 border-slate-200 hover:border-amber-300 hover:bg-amber-50/60 transition-colors"
                  onClick={openCart}
                  aria-label="Buka keranjang belanja"
                >
                  <ShoppingCart className="h-5 w-5 text-slate-700" aria-hidden="true" />
                  <NoSSR>
                    {totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center p-0 bg-amber-500 text-white text-[10px] font-bold border-2 border-white">
                          {totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </NoSSR>
                </Button>
              </motion.div>

              {/* Mobile menu — NoSSR mencegah hydration mismatch badge/keranjang era zustand */}
              <NoSSR
                fallback={
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10" onClick={() => setMobileOpen(true)} aria-label={t('header.menuTitle')}>
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                }
              >
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" aria-label={t('header.menuTitle')}>
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" aria-describedby={undefined} className="w-72 p-0 flex flex-col">
                    <SheetTitle className="sr-only">{t('header.menuTitle')}</SheetTitle>
                    <div className="p-4 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 text-white">
                      <BrandLogo dark size={40} uid="mnu" />
                    </div>
                    <nav className="p-3 flex-1 overflow-y-auto" aria-label="Menu navigasi">
                      {navItems.map((item, i) => {
                        const isAnchor = item.href.startsWith('#');
                        const inner = (
                          <>
                            <span>{t(item.labelKey)}</span>
                            <span className="text-teal-400/0 group-hover:text-amber-500 transition-colors" aria-hidden="true">
                              →
                            </span>
                          </>
                        );
                        const cls =
                          'group w-full flex items-center justify-between text-left px-4 py-3 text-sm font-medium text-slate-700 hover:text-teal-800 hover:bg-teal-50 rounded-xl transition-colors';
                        return isAnchor ? (
                          <motion.button
                            key={item.href}
                            onClick={() => goTo(item.href)}
                            className={cls}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.25 }}
                          >
                            {inner}
                          </motion.button>
                        ) : (
                          <motion.a
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cls}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.25 }}
                          >
                            {inner}
                          </motion.a>
                        );
                      })}
                    </nav>
                    <motion.div
                      className="p-4 border-t border-slate-100 flex flex-col gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navItems.length * 0.05, duration: 0.25 }}
                    >
                      <Button
                        className="w-full rounded-full bg-gradient-gold text-slate-900 font-semibold hover:opacity-90"
                        onClick={() => goTo('#kontak')}
                      >
                        <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t('header.contactUs')}
                      </Button>
                      <div className="flex items-center justify-center gap-5 text-xs text-slate-500">
                        <a href="tel:+6281220030092" className="flex items-center gap-1 hover:text-teal-700 transition-colors">
                          <Phone className="h-3 w-3" aria-hidden="true" />
                          +62 812-2003-0092
                        </a>
                        <a
                          href="https://wa.me/6281350003423"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-teal-700 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d={WHATSAPP_PATH} />
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                      <div className="flex justify-center">
                        <LangSwitcher dark={false} />
                      </div>
                    </motion.div>
                  </SheetContent>
                </Sheet>
              </NoSSR>
            </div>
          </div>
        </div>
        {/* Hairline emas — aksen merek halus di bawah header */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
        />
      </header>
    </>
  );
}
