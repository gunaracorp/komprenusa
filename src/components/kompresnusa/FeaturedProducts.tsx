'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, Eye, Zap, Snowflake, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/format';
import { useT, type DictKey } from '@/lib/i18n';

type Product = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number | null;
  shortDesc?: string | null;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  specifications?: string | null;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
  minOrder: number;
  unit: string;
  images?: string | null;
  category?: { id?: string; name: string; slug?: string } | null;
};

interface Props {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 180, damping: 18 },
  },
} as const;

export function FeaturedProducts({ products, onProductClick }: Props) {
  const t = useT();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.price <= 0) {
      toast.info('Harga melalui penawaran', { description: 'Buka detail untuk menanyakan harga dan ketersediaan.' });
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      category: product.category?.name,
      image: product.images || undefined,
    });
    toast.success(t('catalog.added'), {
      description: product.name,
    });
  };

  const scrollToProducts = () => {
    document.querySelector('#produk')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-3"
            >
              <Zap className="h-3.5 w-3.5 text-teal-700" />
              <span className="text-teal-800 text-sm font-semibold">{t('featured.badge')}</span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {t('featured.heading1')} <span className="text-teal-800">{t('featured.headingHighlight')}</span>
            </h2>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              className="border-teal-400 text-teal-800 hover:bg-teal-50 font-semibold self-start sm:self-auto"
              onClick={scrollToProducts}
            >
              {t('featured.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={cardVariants}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card
                  className="group cursor-pointer border border-gray-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full"
                  onClick={() => onProductClick(product)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.images ? (
                      <img
                        src={product.images}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                        <Snowflake className="h-16 w-16 text-teal-300 opacity-40" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {product.isNew && (
                        <Badge className="bg-emerald-600 text-white text-[10px] px-2 font-semibold">
                          {t('catalog.badge.new')}
                        </Badge>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <Badge className="bg-red-600 text-white text-[10px] px-2 font-semibold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-end justify-center pb-6 z-10">
                      <motion.div
                        className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full shadow-sm hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProductClick(product);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 text-gray-800" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8 rounded-full bg-teal-600 hover:bg-teal-700 shadow-sm"
                          onClick={(e) => product.price > 0 ? handleAddToCart(e, product) : (e.stopPropagation(), onProductClick(product))}
                          aria-label={product.price > 0 ? 'Tambahkan ke keranjang' : 'Tanyakan harga dan ketersediaan'}
                        >
                          {product.price > 0 ? <ShoppingCart className="h-3.5 w-3.5 text-white" /> : <MessageCircle className="h-3.5 w-3.5 text-white" />}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {product.brand && (
                      <p className="text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wider">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-teal-800">
                        {product.price > 0 ? formatRupiah(product.price) : 'Harga melalui penawaran'}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-red-500 line-through font-medium">
                          {formatRupiah(product.originalPrice)}
                        </span>
                      )}
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
