'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Shield,
  Truck,
  Clock,
  Headphones,
  Award,
  ThumbsUp,
  Wrench,
  Users,
  Zap,
} from 'lucide-react';
import { useT, type DictKey } from '@/lib/i18n';

const features = [
  {
    icon: Shield,
    titleKey: 'why.f1.title',
    descKey: 'why.f1.desc',
    color: 'bg-teal-100 text-teal-800',
  },
  {
    icon: Truck,
    titleKey: 'why.f2.title',
    descKey: 'why.f2.desc',
    color: 'bg-sky-100 text-sky-800',
  },
  {
    icon: Clock,
    titleKey: 'why.f3.title',
    descKey: 'why.f3.desc',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    icon: Headphones,
    titleKey: 'why.f4.title',
    descKey: 'why.f4.desc',
    color: 'bg-fuchsia-100 text-fuchsia-800',
  },
  {
    icon: Award,
    titleKey: 'why.f5.title',
    descKey: 'why.f5.desc',
    color: 'bg-emerald-100 text-emerald-800',
  },
  {
    icon: ThumbsUp,
    titleKey: 'why.f6.title',
    descKey: 'why.f6.desc',
    color: 'bg-rose-100 text-rose-800',
  },
  {
    icon: Wrench,
    titleKey: 'why.f7.title',
    descKey: 'why.f7.desc',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    icon: Users,
    titleKey: 'why.f8.title',
    descKey: 'why.f8.desc',
    color: 'bg-cyan-100 text-cyan-800',
  },
] as const;

const stats = [
  { value: 13, suffix: '+', labelKey: 'why.stat.years' },
  { value: 5000, suffix: '+', labelKey: 'why.stat.projects' },
  { value: 50, suffix: '+', labelKey: 'why.stat.brands' },
  { value: 34, suffix: '', labelKey: 'why.stat.provinces' },
] as const;

function formatNumber(n: number): string {
  if (n >= 1000) {
    return n.toLocaleString('id-ID');
  }
  return n.toString();
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const [count, setCount] = useState(0);

  const animate = useCallback(() => {
    const duration = 2000;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [target]);

  useEffect(() => {
    if (isInView) {
      animate();
    }
  }, [isInView, animate]);

  return (
    <span ref={ref}>
      {formatNumber(count)}{suffix}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const featureVariants = {
  hidden: { opacity: 0, rotateX: -25, y: 20, transformPerspective: 800 },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { type: 'spring', stiffness: 160, damping: 18 },
  },
};

export function WhyChooseUs() {
  const t = useT();
  return (
    <section id="keunggulan" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
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
            <Zap className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">{t('why.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('why.heading')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('why.sub')}
          </p>
        </motion.div>

        {/* Stats bar with counter animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 16 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className="text-center p-5 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 border border-teal-500 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 cursor-default"
            >
              <div className="text-3xl lg:text-4xl font-extrabold text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-teal-100 mt-1 font-medium">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feat) => (
            <motion.div key={feat.titleKey} variants={featureVariants}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group p-5 rounded-xl border border-gray-200 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/10 transition-colors duration-300 h-full cursor-default"
              >
                <div
                  className={`w-11 h-11 rounded-lg ${feat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{t(feat.titleKey)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(feat.descKey)}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
