'use client';

import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLangStore, type Lang } from '@/stores/lang-store';
import { cn } from '@/lib/utils';

const options: { value: Lang; label: string }[] = [
  { value: 'id', label: 'ID' },
  { value: 'en', label: 'EN' },
];

export function LangSwitcher({ dark = false }: { dark?: boolean }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border p-0.5',
        dark ? 'border-white/25 bg-white/10' : 'border-gray-200 bg-gray-50'
      )}
      role="group"
      aria-label="Pilih bahasa / Select language"
    >
      <Languages className={cn('h-3 w-3 ml-1', dark ? 'text-white/70' : 'text-gray-400')} />
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          whileTap={{ scale: 0.92 }}
          onClick={() => setLang(opt.value)}
          aria-pressed={lang === opt.value}
          className={cn(
            'px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200 cursor-pointer',
            lang === opt.value
              ? 'bg-teal-600 text-white shadow-sm'
              : dark
                ? 'text-white/70 hover:text-white'
                : 'text-gray-500 hover:text-gray-800'
          )}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}
