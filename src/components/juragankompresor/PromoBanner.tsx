'use client';

import { motion } from 'framer-motion';
import { Package, Wrench } from 'lucide-react';
import { useT, type DictKey } from '@/lib/i18n';

const promoItems = [
  {
    icon: Package,
    titleKey: 'promo.shipping',
    descKey: 'promo.shippingDesc',
    gradient: 'from-teal-600 via-teal-500 to-emerald-500',
    hoverGradient: 'hover:from-teal-700 hover:via-teal-600 hover:to-emerald-600',
  },
  {
    icon: Wrench,
    titleKey: 'promo.install',
    descKey: 'promo.installDesc',
    gradient: 'from-amber-600 via-orange-500 to-amber-500',
    hoverGradient: 'hover:from-amber-700 hover:via-orange-600 hover:to-amber-600',
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

export function PromoBanner() {
  const t = useT();
  const scrollToContact = () => {
    const el = document.getElementById('kontak');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto"
        >
          {promoItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.titleKey}
                variants={cardVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToContact}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} ${item.hoverGradient} p-6 lg:p-8 text-left text-white shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group`}
              >
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-2 tracking-wide">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-sm lg:text-base text-white/90 font-medium leading-relaxed">
                    {t(item.descKey)}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                    <span>Syarat & Ketentuan berlaku</span>
                    <span className="text-white/50">→</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
