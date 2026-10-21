'use client';

import { useState, useEffect } from 'react';
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
  Mail,
  X,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useT, type DictKey } from '@/lib/i18n';
import { LangSwitcher } from './LangSwitcher';
import { BrandLogo } from './BrandLogo';

const navItems = [
  { labelKey: 'nav.home', href: '#beranda' },
  { labelKey: 'nav.categories', href: '#kategori' },
  { labelKey: 'nav.products', href: '#produk' },
  { labelKey: 'nav.advantages', href: '#keunggulan' },
  { labelKey: 'nav.testimonials', href: '#testimoni' },
  { labelKey: 'nav.contact', href: '#kontak' },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = useT();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-teal-900 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:081220030092" className="flex items-center gap-1 hover:text-teal-200 transition-colors">
              <Phone className="h-3 w-3" />
              081220030092
            </a>
            <span className="hidden sm:flex items-center gap-1">
              WhatsApp: +62 813-5000-3423
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.a
                href="https://wa.me/6281350003423"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -1 }}
                className="hover:text-teal-200 transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </motion.a>
              <motion.a
                href="tel:081220030092"
                whileHover={{ scale: 1.15, y: -1 }}
                className="hover:text-teal-200 transition-colors"
                aria-label="Telepon"
              >
                <Phone className="h-3 w-3" />
              </motion.a>
              <motion.a
                href="mailto:juragankompresor@gmail.com"
                whileHover={{ scale: 1.15, y: -1 }}
                className="hover:text-teal-200 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-3 w-3" />
              </motion.a>
            </div>
            <span className="text-teal-200">{t('topbar.shipping')}</span>
            <LangSwitcher dark />
          </div>
        </div>
      </div>
      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-900/[0.06]'
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('#beranda')}
              className="shrink-0"
              aria-label="Juragan Kompresor — kembali ke beranda"
            >
              <BrandLogo size={44} uid="hdr" />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200"
                >
                  {t(item.labelKey)}
                </button>
              ))}
              <a href="/produk" className="px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200">
                Katalog kompresor
              </a>
              <a href="/insights" className="px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all duration-200">
                Insight HVAC
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden sm:flex bg-gradient-teal hover:opacity-90 shadow-md text-white"
                  onClick={() => scrollToSection('#kontak')}
                >
                  <Phone className="h-4 w-4 mr-1.5" />
                  {t('header.contactUs')}
                </Button>
              </motion.div>

              {/* Search - Desktop: expandable input, Mobile: scroll to #produk */}
              <div className="flex items-center">
                <motion.div
                  className="hidden md:flex items-center"
                  animate={{
                    width: searchExpanded ? 200 : 36,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="relative w-full">
                    {searchExpanded && (
                      <motion.input
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        type="text"
                        placeholder={t('header.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-full text-sm rounded-lg border border-gray-200 bg-gray-50 px-3 pr-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        autoFocus
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-9 w-9"
                      onClick={() => setSearchExpanded(!searchExpanded)}
                      aria-label={t('header.searchAria')}
                    >
                      {searchExpanded ? (
                        <X className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Search className="h-4 w-4 text-gray-600" />
                      )}
                    </Button>
                  </div>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => scrollToSection('#produk')}
                  aria-label={t('header.searchProductAria')}
                >
                  <Search className="h-4 w-4 text-gray-600" />
                </Button>
              </div>

              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={openCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <NoSSR>
                    {totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-teal-600 text-white text-[10px] border-2 border-white">
                          {totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </NoSSR>
                </Button>
              </motion.div>

              {/* Mobile menu - wrapped in NoSSR to prevent hydration mismatch */}
              <NoSSR fallback={
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              }>
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" aria-describedby={undefined} className="w-72 p-0">
                    <SheetTitle className="sr-only">{t('header.menuTitle')}</SheetTitle>
                    <div className="p-4 border-b border-teal-800 bg-teal-900 text-white">
                      <BrandLogo dark size={40} uid="mnu" />
                    </div>
                    <nav className="p-2">
                      {navItems.map((item, i) => (
                        <motion.button
                          key={item.href}
                          onClick={() => scrollToSection(item.href)}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-800 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.25 }}
                        >
                          {t(item.labelKey)}
                        </motion.button>
                      ))}
                      <a href="/insights" onClick={() => setMobileOpen(false)} className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-teal-50 hover:text-teal-700">Insight HVAC</a>
                      <motion.div
                        className="mt-3 px-4 flex flex-col gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: navItems.length * 0.05, duration: 0.25 }}
                      >
                        <Button
                          className="w-full bg-gradient-teal hover:opacity-90 text-white"
                          onClick={() => {
                            setMobileOpen(false);
                            scrollToSection('#kontak');
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {t('header.contactUs')}
                        </Button>
                        <div className="flex justify-center">
                          <LangSwitcher dark />
                        </div>
                      </motion.div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </NoSSR>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
