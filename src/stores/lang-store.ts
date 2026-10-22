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
      name: 'kn-lang',
      // Migrasi satu kali dari kunci lama (era rebrand) agar preferensi bahasa tidak hilang
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined' && !localStorage.getItem('kn-lang')) {
          const legacy = localStorage.getItem('jk-lang');
          if (legacy) {
            try { localStorage.setItem('kn-lang', legacy); } catch { /* abaikan */ }
          }
        }
      },
    }
  )
);
