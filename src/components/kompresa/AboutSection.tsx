'use client';

import { motion } from 'framer-motion';
import { Building2, Target, Eye, AirVent, Snowflake, Cog, Wrench, Fan, Thermometer, Droplets, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useT, type DictKey } from '@/lib/i18n';

const stats = [
  { value: '18+', labelKey: 'about.stat.years' },
  { value: '7439+', labelKey: 'about.stat.projects' },
  { value: '50+', labelKey: 'about.stat.brands' },
  { value: '38', labelKey: 'about.stat.provinces' },
] as const;

const specialties = [
  { icon: AirVent, labelKey: 'about.spec.ac' },
  { icon: Snowflake, labelKey: 'about.spec.refrigerant' },
  { icon: Cog, labelKey: 'about.spec.compressor' },
  { icon: Wrench, labelKey: 'about.spec.sparepart' },
  { icon: Fan, labelKey: 'about.spec.ventilation' },
  { icon: Thermometer, labelKey: 'about.spec.thermostat' },
  { icon: Droplets, labelKey: 'about.spec.chiller' },
  { icon: Zap, labelKey: 'about.spec.installation' },
] as const;

export function AboutSection() {
  const t = useT();
  return (
    <section id="tentang" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4"
          >
            <Building2 className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">{t('about.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('about.heading')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('about.sub')}
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
          {/* Left - Decorative Card with Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Card className="relative overflow-hidden border-0 shadow-xl h-full bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 text-white">
              {/* Decorative background elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-white" />
              </div>

              <CardContent className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full">
                {/* Company identity */}
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                    PT Kompresa
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {t('about.badge.founded')}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {t('about.badge.location')}
                    </Badge>
                  </div>
                  <Badge className="mt-3 bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-500/90">
                    {t('about.badge.distributor')}
                  </Badge>
                </div>

                {/* Specialization mini-grid */}
                <div className="relative my-6">
                  <p className="text-[11px] uppercase tracking-widest text-white/70 font-semibold mb-3">
                    {t('about.specialties')}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {specialties.map((item, i) => (
                      <motion.div
                        key={item.labelKey}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}
                        whileHover={{ scale: 1.06 }}
                        className="aspect-square rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center gap-1.5 hover:bg-white/25 transition-colors duration-300"
                      >
                        <item.icon className="h-5 w-5 text-white" />
                        <span className="text-[9px] leading-[1.15] text-white/85 font-medium text-center px-1">
                          {t(item.labelKey)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.labelKey}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200, damping: 16 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="text-2xl lg:text-3xl font-extrabold">
                        {stat.value}
                      </div>
                      <div className="text-sm text-teal-100 mt-0.5 font-medium">
                        {t(stat.labelKey)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right - Company Story + Vision & Mission */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            {/* Story */}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                {t('about.story.heading')}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                {t('about.story.text')}
              </p>
            </div>

            {/* Vision & Mission cards side by side */}
            <div className="grid sm:grid-cols-2 gap-5 mt-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
              >
                <Card className="h-full border-teal-200 bg-white hover:shadow-lg hover:shadow-teal-500/10 transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                      <Eye className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{t('about.vision')}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {t('about.vision.text')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
              >
                <Card className="h-full border-teal-200 bg-white hover:shadow-lg hover:shadow-teal-500/10 transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                      <Target className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{t('about.mission')}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {t('about.mission.text')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
