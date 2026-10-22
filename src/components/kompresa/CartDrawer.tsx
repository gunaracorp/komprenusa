'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  MessageCircle,
  Send,
  Package,
  ArrowRight,
  CheckCircle2,
  Snowflake,
} from 'lucide-react';
import Image from 'next/image';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/format';
import { NoSSR } from '@/components/ui/no-ssr';
import { useT } from '@/lib/i18n';

const WA_NUMBER = '6281350003423';

const cartItemVariants = {
  initial: { opacity: 0, x: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 26 },
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
} as const;

export function CartDrawer() {
  const t = useT();
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, getTotal, getTotalItems } =
    useCartStore();
  const [showInquiry, setShowInquiry] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });

  const total = getTotal();
  const count = getTotalItems();

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const lines = items.map(
      (item) => `\u2022 ${item.name} x${item.quantity} = ${formatRupiah(item.price * item.quantity)}`
    );
    const msg = `Halo, saya ingin memesan:\n\n${lines.join('\n')}\n\nTotal: ${formatRupiah(total)}\n\nMohon info ketersediaan dan ongkos kirim. Terima kasih!`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSubmitInquiry = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error('Mohon isi nama, email, dan nomor telepon');
      return;
    }
    setSending(true);

    // Send inquiry via WhatsApp — no server needed!
    try {
      const orderLines = items.map(
        (item) => `  \u2022 ${item.name} x${item.quantity} = ${formatRupiah(item.price * item.quantity)}`
      );

      const lines = [
        `Halo, saya ingin *minta penawaran harga*:`,
        ``,
        `*Nama:* ${form.name}`,
        `*Email:* ${form.email}`,
        `*Telepon:* ${form.phone}`,
        form.company ? `*Perusahaan:* ${form.company}` : '',
        ``,
        `*Pesanan:*`,
        ...orderLines,
        ``,
        `*Total Estimasi:* ${formatRupiah(total)}`,
        form.message ? `*Catatan:* ${form.message}` : '',
        ``,
        `Mohon info ketersediaan dan harga terbaik. Terima kasih!`,
      ].filter(Boolean).join('\n');

      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`,
        '_blank'
      );

      setSent(true);
      toast.success('Penawaran dikirim via WhatsApp!', {
        description: 'Tim kami akan menghubungi Anda dalam 1x24 jam.',
      });
      setTimeout(() => {
        clearCart();
        setShowInquiry(false);
        closeCart();
        setSent(false);
      }, 1500);
    } catch {
      toast.error(t('contact.waError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <NoSSR>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent aria-describedby={undefined} className="w-full sm:max-w-md flex flex-col p-0">
        {showInquiry ? (
          // Inquiry Form View
          <>
            <SheetHeader className="p-4 pb-2 border-b">
              <SheetTitle className="text-base text-gray-900">{t('cart.quote')}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              <p className="text-sm text-gray-700">
                {t('contact.form.note')}
              </p>
              <div>
                <label className="text-xs font-medium text-gray-700">{t('cart.form.fullName')} *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('cart.form.namePh')}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@contoh.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">No. Telepon *</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08xx-xxxx-xxxx"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">{t('cart.form.company')}</label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder={t('cart.form.companyPh')}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">{t('cart.form.message')}</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t('cart.form.messagePh')}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Order summary in inquiry */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-2">{t('cart.subtotal')} Pesanan</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-700 py-1">
                    <span className="flex-1 truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="text-gray-900 font-medium">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-900">{t('cart.total')}</span>
                  <span className="text-teal-800">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowInquiry(false)}
              >
                {t('cart.back')}
              </Button>
              <Button
                className={`flex-1 ${sent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
                onClick={handleSubmitInquiry}
                disabled={sending}
              >
                {sent ? (
                  <><CheckCircle2 className="h-4 w-4 mr-1.5" /> {t('contact.sent')}</>
                ) : sending ? (
                  t('cart.sending')
                ) : (
                  <><Send className="h-4 w-4 mr-1.5" /> {t('contact.form.send')} (WA)</>
                )}
              </Button>
            </div>
          </>
        ) : (
          // Cart View
          <>
            <SheetHeader className="p-4 pb-2 border-b">
              <SheetTitle className="text-base flex items-center gap-2 text-gray-900">
                <ShoppingCart className="h-4 w-4" />
                {t('cart.title')}
                {count > 0 && (
                  <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                    {count} {t('cart.item')}
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700">{t('cart.empty')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('cart.emptyDesc')}
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="mt-4 border-teal-200 text-teal-800"
                    onClick={closeCart}
                  >
                    {t('cart.browse')}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  <div className="p-4 space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <CartItemRow
                          key={item.id}
                          item={item}
                          onRemove={() => removeItem(item.id)}
                          onUpdateQty={(q) => updateQuantity(item.id, q)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="border-t p-4 space-y-3"
                >
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('cart.subtotal')} ({count} {t('cart.item')})</span>
                    <span className="text-gray-900">{formatRupiah(total)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">{t('cart.total')}</span>
                    <span className="text-teal-800">{formatRupiah(total)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-sm"
                        onClick={handleWhatsAppOrder}
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        WhatsApp
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        className="w-full bg-teal-600 hover:bg-teal-700 h-10 text-sm"
                        onClick={() => setShowInquiry(true)}
                      >
                        <Send className="h-4 w-4 mr-1.5" />
                        {t('cart.quote')}
                      </Button>
                    </motion.div>
                  </div>
                  <button
                    className="w-full text-center text-xs text-gray-500 hover:text-red-500 transition-colors"
                    onClick={clearCart}
                  >
                    {t('cart.clear')}
                  </button>
                </motion.div>
              </>
            )}
          </>
        )}
      </SheetContent>
      </Sheet>
    </NoSSR>
  );
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (q: number) => void;
}) {
  return (
    <motion.div
      variants={cartItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
    >
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shrink-0 relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Snowflake className="h-5 w-5 text-teal-300 opacity-40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 pr-2">
            {item.name}
          </h4>
          <motion.button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>
        </div>
        {item.category && (
          <p className="text-[10px] text-gray-600 mt-0.5">{item.category}</p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center border rounded-md">
            <button
              className="h-7 w-7 flex items-center justify-center hover:bg-gray-200 rounded-l-md text-gray-600 transition-colors"
              onClick={() => onUpdateQty(item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-gray-900">{item.quantity}</span>
            <button
              className="h-7 w-7 flex items-center justify-center hover:bg-gray-200 rounded-r-md text-gray-600 transition-colors"
              onClick={() => onUpdateQty(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-teal-800">
            {formatRupiah(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}