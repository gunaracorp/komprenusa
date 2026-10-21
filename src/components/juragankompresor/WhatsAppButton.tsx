'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n';

export function WhatsAppButton() {
  const t = useT();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-3 bg-white rounded-xl shadow-2xl p-3.5 max-w-[220px] border border-gray-100"
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 transition-colors"
              onClick={() => setShowTooltip(false)}
              aria-label="Tutup tooltip"
            >
              ✕
            </button>
            <p className="text-xs text-gray-900 font-bold">{t('wa.help')}</p>
            <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
              {t('wa.tooltip')}
            </p>
            <a
              href="https://wa.me/6281350003423?text=Halo%20Juragan%20Kompresor%2C%20saya%20ingin%20bertanya."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
            >
              +62 813-5000-3423 →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href="https://wa.me/6281350003423?text=Halo%20Juragan%20Kompresor%2C%20saya%20ingin%20bertanya."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-emerald-500/50 transition-all"
        aria-label={t('wa.aria')}
      >
        <MessageCircle className="h-7 w-7" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/40" />
      </motion.a>
    </div>
  );
}
