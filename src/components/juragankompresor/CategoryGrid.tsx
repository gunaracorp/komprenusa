'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Wind, Droplets, Wrench, Building2, Factory, Layers } from 'lucide-react';
import Image from 'next/image';
import type { Category } from './types';
import { useT } from '@/lib/i18n';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'ac-split': Wind,
  'kompresor': Snowflake,
  'refrigerant': Droplets,
  'spare-part-ac': Wrench,
  'chiller-vrv-vrf': Building2,
  'mesin-pendingin': Factory,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 18 },
  },
};

interface Props {
  categories: (Category & { _count?: { products: number } })[];
}

export function CategoryGrid({ categories }: Props) {
  const t = useT();
  const scrollToProducts = (slug?: string) => {
    const el = document.querySelector('#produk');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (slug) {
        window.dispatchEvent(new CustomEvent('filter-category', { detail: slug }));
      }
    }
  };

  return (
    <section id="kategori" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4"
          >
            <Layers className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">{t('categories.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('categories.heading1')} <span className="text-teal-800">{t('categories.headingHighlight')}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('categories.sub')}
          </p>
        </motion.div>

        {/* Category cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Snowflake;
            const count = (cat as any)._count?.products || 0;
            return (
              <motion.div key={cat.id} variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.06, y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card
                    className="group cursor-pointer border-2 border-transparent hover:border-teal-400 shadow-sm hover:shadow-xl hover:shadow-teal-500/15 transition-all duration-300 overflow-hidden"
                    onClick={() => scrollToProducts(cat.slug)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-100">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-teal-50">
                            <Icon className="h-10 w-10 text-teal-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 font-semibold">{count} {t('categories.count')}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
