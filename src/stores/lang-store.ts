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
    { name: 'jk-lang' }
  )
);
