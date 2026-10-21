'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Sparkles,
  Snowflake,
} from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/format';
import { NoSSR } from '@/components/ui/no-ssr';
import { useT, type DictKey } from '@/lib/i18n';

const guarantees = [
  { icon: Shield, labelKey: 'modal.warranty' },
  { icon: Truck, labelKey: 'modal.safeShipping' },
  { icon: RotateCcw, labelKey: 'modal.returnable' },
] as const;

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  shortDesc?: string | null;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  specifications?: string | null;
  images?: string | null;
  isNew: boolean;
  isFeatured: boolean;
  minOrder: number;
  unit: string;
  category: { name: string; slug: string } | null;
};

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
} as const;

const infoVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const infoItemVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
} as const;

export function ProductDetailModal({ product, open, onClose }: Props) {
  const t = useT();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const specs: Record<string, string> = product.specifications
    ? JSON.parse(product.specifications)
    : {};
  const displaySpecs = Object.entries(specs).filter(([key]) => !key.startsWith('_'));

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      category: product.category?.name,
      image: product.images || undefined,
    });
    toast.success(`${qty} ${t('categories.count')} ${t('catalog.added')}`, {
      description: product.name,
    });
    onClose();
  };

  const handleWhatsApp = () => {
    const priceLine = product.price > 0 ? `Harga: ${formatRupiah(product.price)}\n` : '';
    const msg = `Halo, saya tertarik dengan produk:\n\n*${product.name}*\n${priceLine}Jumlah: ${qty} ${product.unit}\n\nMohon konfirmasi harga, stok, dan kecocokan aplikasi. Terima kasih!`;
    window.open(
      `https://wa.me/6281350003423?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  return (
    <NoSSR>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 scrollbar-thin">
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid md:grid-cols-2"
          >
            {/* Image area */}
            <div className="relative aspect-square bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
              {product.images ? (
                <img
                  src={product.images}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full ${product.brand === 'Embraco' ? 'bg-white object-contain p-6' : 'object-cover'}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Snowflake className="h-24 w-24 text-teal-300 opacity-30" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isNew && (
                  <Badge className="bg-emerald-600 text-white font-semibold">{t('catalog.badge.new')}</Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-amber-600 text-white font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {t('catalog.badge.featured')}
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-600 text-white font-semibold">HEMAT {discount}%</Badge>
                )}
              </div>
            </div>

            {/* Info area */}
            <motion.div
              variants={infoVariants}
              initial="hidden"
              animate="visible"
              className="p-6 flex flex-col"
            >
              <DialogHeader className="mb-4">
                <motion.div variants={infoItemVariants}>
                  {product.brand && (
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      {product.brand}
                      {product.model && ` · ${product.model}`}
                    </span>
                  )}
                </motion.div>
                <motion.div variants={infoItemVariants}>
                  <DialogTitle className="text-xl leading-snug text-gray-900">
                    {product.name}
                  </DialogTitle>
                </motion.div>
                <motion.div variants={infoItemVariants}>
                  {product.category && (
                    <Badge variant="outline" className="w-fit text-xs text-gray-800 border-gray-300 font-semibold">
                      {product.category.name}
                    </Badge>
                  )}
                </motion.div>
              </DialogHeader>

              {/* Price */}
              <motion.div variants={infoItemVariants} className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-teal-800">
                    {product.price > 0 ? formatRupiah(product.price) : 'Harga melalui penawaran'}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-red-500 line-through font-medium">
                      {formatRupiah(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  Min. order: {product.minOrder} {product.unit}
                </p>
              </motion.div>

              {/* Description */}
              {(product.shortDesc || product.description) && (
                <motion.div variants={infoItemVariants} className="mb-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('modal.desc')}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {product.description || product.shortDesc}
                  </p>
                </motion.div>
              )}

              {/* Specs */}
              {displaySpecs.length > 0 && (
                <motion.div variants={infoItemVariants} className="mb-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('modal.specs')}
                  </h4>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    {displaySpecs.map(([key, val], i) => (
                      <div
                        key={key}
                        className={`flex justify-between text-xs px-3 py-2.5 ${
                          i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <span className="text-gray-600 font-semibold">{key}</span>
                        <span className="text-gray-900 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <Separator className="my-4" />

              {product.price > 0 && (
                <motion.div variants={infoItemVariants} className="flex items-center gap-4 mb-4">
                  {guarantees.map((g) => (
                    <div key={g.labelKey} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                      <g.icon className="h-3.5 w-3.5 text-teal-600" />
                      {t(g.labelKey)}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Quantity + Actions */}
              <motion.div variants={infoItemVariants} className="mt-auto space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 font-medium">{t('modal.qty')}</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 rounded-l-lg transition-colors text-gray-700"
                      onClick={() => setQty(Math.max(product.minOrder, qty - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-gray-900">
                      {qty}
                    </span>
                    <button
                      className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 rounded-r-lg transition-colors text-gray-700"
                      onClick={() => setQty(qty + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{product.unit}</span>
                </div>

                <div className="flex gap-2">
                  {product.price > 0 && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        className="w-full bg-teal-600 hover:bg-teal-700 h-11 text-white font-semibold"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t('modal.addToCart')}
                      </Button>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={product.price > 0 ? '' : 'flex-1'}>
                    <Button
                      variant={product.price > 0 ? 'outline' : 'default'}
                      className={product.price > 0 ? 'h-11 px-4 border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold' : 'h-11 w-full bg-teal-900 font-semibold text-white hover:bg-teal-800'}
                      onClick={handleWhatsApp}
                      aria-label="Tanyakan harga dan ketersediaan melalui WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" data-icon={product.price > 0 ? undefined : 'inline-start'} />
                      {product.price > 0 ? null : 'Tanyakan harga & stok'}
                    </Button>
                  </motion.div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success(t('modal.copied'));
                  }}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  {t('modal.share')}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </NoSSR>
  );
}
