'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useT, type DictKey } from '@/lib/i18n';

type Testimonial = {
  id: string;
  name: string;
  company?: string | null;
  position?: string | null;
  content: string;
  rating: number;
};

interface Props {
  testimonials: Testimonial[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 160, damping: 18 },
  },
};

export function Testimonials({ testimonials }: Props) {
  const t = useT();
  return (
    <section id="testimoni" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
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
            <Star className="h-3.5 w-3.5 text-teal-700 fill-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">{t('testimonials.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('testimonials.heading1')} <span className="text-teal-800">{t('testimonials.headingHighlight')}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('testimonials.sub')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <motion.div key={t.id} variants={cardVariants}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="h-full border-gray-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-teal-600 mb-4" />
                    <p className="text-sm text-gray-700 leading-relaxed mb-5 line-clamp-4">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${
                            j < t.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                        {(t.position || t.company) && (
                          <div className="text-xs text-gray-500 font-medium">
                            {t.position}{t.position && t.company && ' · '}{t.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
