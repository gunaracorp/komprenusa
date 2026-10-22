'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'id' | 'en';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'id',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'ka-lang',
      // Migrasi satu kali dari kunci lama (era rebrand) agar preferensi bahasa tidak hilang
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined' && !localStorage.getItem('ka-lang')) {
          const legacy = localStorage.getItem('jk-lang');
          if (legacy) {
            try { localStorage.setItem('ka-lang', legacy); } catch { /* abaikan */ }
          }
        }
      },
    }
  )
);
