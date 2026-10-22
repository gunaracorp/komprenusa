'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useT, type DictKey } from '@/lib/i18n';

const WA_NUMBER = '6281350003423';

const contactInfo = [
  {
    icon: Phone,
    labelKey: 'contact.phone' as const,
    value: '081220030092',
    descKey: 'contact.hoursDesc' as const,
    href: 'tel:081220030092',
  },
  {
    icon: MessageCircle,
    labelKey: 'contact.whatsapp' as const,
    value: '+62 813-5000-3423',
    descKey: 'contact.waDesc' as const,
    href: 'https://wa.me/6281350003423?text=Halo%20Kompresa%20Kompresor%2C%20saya%20ingin%20bertanya.',
  },
  {
    icon: Mail,
    labelKey: 'contact.email' as const,
    value: 'info@juragankompresor.com',
    descKey: 'contact.emailDesc' as const,
    href: 'mailto:info@juragankompresor.com',
  },
  {
    icon: MapPin,
    labelKey: 'contact.address' as const,
    value: 'Jl. Raya Industri No. 88',
    desc: 'Kawasan Industri MM2100, Bekasi 17520',
  },
  {
    icon: Clock,
    labelKey: 'contact.hours' as const,
    valueKey: 'contact.hoursValue' as const,
    desc: '08:00 - 17:00 WIB',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 150, damping: 20, delay: 0.2 },
  },
};

export function ContactSection() {
  const t = useT();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t('contact.error'));
      return;
    }
    setSending(true);

    // Send via WhatsApp — no server/API needed!
    try {
      const lines = [
        `Halo, saya ingin menghubungi Kompresa:`,
        ``,
        `*Nama:* ${form.name}`,
        form.email ? `*Email:* ${form.email}` : '',
        form.phone ? `*Telepon:* ${form.phone}` : '',
        form.subject ? `*Subjek:* ${form.subject}` : '',
        ``,
        `*Pesan:*`,
        form.message,
      ].filter(Boolean).join('\n');

      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`,
        '_blank'
      );

      setSent(true);
      toast.success(t('contact.sent'), {
        description: t('contact.sentDesc'),
      });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 3000);
    } catch {
      toast.error(t('contact.waError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="kontak" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4"
          >
            <span className="w-2 h-2 bg-teal-600 rounded-full" />
            <span className="text-teal-800 text-sm font-semibold">{t('contact.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('contact.heading1')} <span className="text-teal-800">{t('contact.headingHighlight')}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('contact.sub')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info Cards */}
          <motion.div
            className="lg:col-span-2 space-y-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactInfo.map((info) => (
              <motion.div key={info.labelKey} variants={cardVariants}>
                {info.href ? (
                  <a
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block"
                  >
                    <Card className="border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                          <info.icon className="h-5 w-5 text-teal-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {t(info.labelKey)}
                            </p>
                            <ArrowUpRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5 group-hover:text-teal-700 transition-colors">
                            {'valueKey' in info ? t(info.valueKey) : info.value}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{'descKey' in info ? t(info.descKey) : info.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ) : (
                  <Card className="border-gray-200">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <info.icon className="h-5 w-5 text-teal-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          {t(info.labelKey)}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {'valueKey' in info ? t(info.valueKey) : info.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{'descKey' in info ? t(info.descKey) : info.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {t('contact.form.heading')}
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  {t('contact.form.note')}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">{t('contact.form.name')} *</label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t('contact.form.namePh')}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Email *</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@contoh.com"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">{t('contact.form.phone')}</label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="08xx-xxxx-xxxx"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">{t('contact.form.subject')}</label>
                      <Input
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder={t('contact.form.subjectPh')}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">{t('contact.form.message')} *</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t('contact.form.messagePh')}
                      className="mt-1"
                      rows={5}
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        type="submit"
                        className={`w-full h-11 text-white font-semibold ${sent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                        disabled={sending}
                      >
                        {sent ? (
                          <><CheckCircle2 className="h-4 w-4 mr-1.5" /> {t('contact.sent')}</>
                        ) : sending ? (
                          t('cart.sending')
                        ) : (
                          <><Send className="h-4 w-4 ml-1.5" /> {t('contact.form.send')} (WhatsApp)</>
                        )}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-11 font-semibold"
                        onClick={() => {
                          const msg = `Halo, saya ingin bertanya tentang produk di Kompresa.`;
                          window.open(
                            `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
                            '_blank'
                          );
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        Chat WhatsApp
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}