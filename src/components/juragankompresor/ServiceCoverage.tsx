'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone } from 'lucide-react';
import { useT, type DictKey } from '@/lib/i18n';

const regions = [
  {
    name: 'Jawa',
    cities: ['Jakarta', 'Bekasi', 'Tangerang', 'Depok', 'Bogor', 'Bandung', 'Semarang', 'Surabaya', 'Yogyakarta'],
  },
  {
    name: 'Sumatera',
    cities: ['Medan', 'Palembang', 'Pekanbaru', 'Batam', 'Lampung'],
  },
  {
    name: 'Kalimantan',
    cities: ['Balikpapan', 'Pontianak', 'Banjarmasin', 'Samarinda'],
  },
  {
    name: 'Sulawesi',
    cities: ['Makassar', 'Manado', 'Kendari'],
  },
  {
    name: 'Bali & Nusa Tenggara',
    cities: ['Denpasar', 'Mataram', 'Kupang'],
  },
  {
    name: 'Papua',
    cities: ['Jayapura', 'Sorong'],
  },
];

const totalCities = regions.reduce((acc, r) => acc + r.cities.length, 0);

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

export function ServiceCoverage() {
  const t = useT();
  return (
    <section id="coverage" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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
            <MapPin className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">{t('coverage.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('coverage.heading1')} <span className="text-teal-800">{t('coverage.headingHighlight')}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('coverage.sub')}
          </p>

          {/* Total Count Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full px-5 py-2"
          >
            <MapPin className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-bold">50+ {t('coverage.cities')}</span>
          </motion.div>
        </motion.div>

        {/* Region Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {regions.map((region) => (
            <motion.div key={region.name} variants={cardVariants}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="h-full border-gray-200 hover:border-teal-400 shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-teal-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      {region.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {region.cities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-teal-100 hover:text-teal-800 cursor-default"
                        >
                          <MapPin className="h-3 w-3" />
                          {city}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Belum menemukan kota Anda?{' '}
            <span className="font-semibold text-gray-900">Hubungi kami!</span>
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-full px-6 py-2.5 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <a href="tel:081220030092">
              <Phone className="h-4 w-4 mr-2" />
              Hubungi Kami
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
