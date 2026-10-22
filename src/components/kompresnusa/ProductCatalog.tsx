'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ShoppingCart,
  Eye,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  MessageCircle,
  Grid3X3,
  List,
  Sparkles,
  Snowflake,
} from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/format';
import { NoSSR } from '@/components/ui/no-ssr';
import { useT, type DictKey } from '@/lib/i18n';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

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
  images?: string | null;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  minOrder: number;
  unit: string;
  category: { name: string; slug: string } | null;
};

interface Props {
  categories: Category[];
  allProducts: Product[];
  onProductClick: (product: Product) => void;
}

const PAGE_SIZE = 12;

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
} as const;

const listItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 22 },
  },
} as const;

export function ProductCatalog({ categories, allProducts, onProductClick }: Props) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const addItem = useCartStore((s) => s.addItem);

  // Compute available brands from filtered products
  const brands = useMemo(() => {
    const filtered = category === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category?.slug === category);
    const uniqueBrands = [...new Set(filtered.map((p) => p.brand).filter(Boolean) as string[])];
    return uniqueBrands.sort();
  }, [allProducts, category]);

  // Client-side filtering, sorting, and pagination — NO API needed!
  const { products, total } = useMemo(() => {
    let filtered = [...allProducts];

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter((p) => p.category?.slug === category);
    }

    // Brand filter
    if (brand !== 'all') {
      filtered = filtered.filter((p) => p.brand === brand);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q)) ||
          (p.shortDesc?.toLowerCase().includes(q)) ||
          (p.category?.name.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default: // newest — keep original order (already sorted by createdAt desc from seed)
        break;
    }

    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const products = filtered.slice(start, start + PAGE_SIZE);

    return { products, total };
  }, [allProducts, category, brand, search, sort, page]);

  // Reset page when category/brand/sort changes (via handlers, not effect)

  // Listen for category filter events from CategoryGrid
  useEffect(() => {
    const handler = (e: Event) => {
      const slug = (e as CustomEvent).detail;
      setCategory(slug);
      setBrand('all');
      setPage(1);
    };
    window.addEventListener('filter-category', handler);
    return () => window.removeEventListener('filter-category', handler);
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setBrand('all');
    setPage(1);
  };

  const handleBrandChange = (val: string) => {
    setBrand(val);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSort(val);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
    toast.success(t('catalog.added'), { description: product.name });
  };

  return (
    <section id="produk" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
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
            className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-3"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">{t('catalog.badge')}</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('catalog.heading1')} <span className="text-teal-800">{t('catalog.headingHighlight')}</span>{' '}
            {t('catalog.heading2')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('catalog.sub')}
          </p>
          <Link href="/produk" className="mt-5 inline-flex h-10 items-center rounded-lg border border-teal-700 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
            Telusuri katalog kompresor lengkap
          </Link>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t('catalog.searchPlaceholder')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11"
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                  onClick={() => { setSearch(''); setPage(1); }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="sm:hidden h-11"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('catalog.filter')}
              </Button>
              <NoSSR fallback={
                <div className="flex gap-2">
                  <div className="w-full sm:w-48 h-11 rounded-md border border-input bg-gray-100 animate-pulse" />
                  <div className="w-full sm:w-44 h-11 rounded-md border border-input bg-gray-100 animate-pulse" />
                  <div className="w-full sm:w-44 h-11 rounded-md border border-input bg-gray-100 animate-pulse" />
                </div>
              }>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48 h-11">
                    <SelectValue placeholder={t('catalog.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('catalog.allCategories')}</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={brand} onValueChange={handleBrandChange} disabled={brands.length === 0}>
                  <SelectTrigger className="w-full sm:w-44 h-11">
                    <SelectValue placeholder={t('catalog.allBrands')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('catalog.allBrands')}</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-44 h-11">
                    <SelectValue placeholder={t('catalog.sort')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('catalog.sort.newest')}</SelectItem>
                    <SelectItem value="name">{t('catalog.sort.name')}</SelectItem>
                    <SelectItem value="price-asc">{t('catalog.sort.priceLow')}</SelectItem>
                    <SelectItem value="price-desc">{t('catalog.sort.priceHigh')}</SelectItem>
                  </SelectContent>
                </Select>
              </NoSSR>
            </div>
          </div>
          {/* Active filters & info */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {category !== 'all' && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-800 font-semibold gap-1">
                  {categories.find(c => c.slug === category)?.name}
                  <button onClick={() => setCategory('all')}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {brand !== 'all' && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 font-semibold gap-1">
                  {brand}
                  <button onClick={() => setBrand('all')}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="bg-gray-200 text-gray-800 font-semibold gap-1">
                  &quot;{search}&quot;
                  <button onClick={() => { setSearch(''); setPage(1); }}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 font-medium">{total} {t('categories.count')}</span>
              <div className="hidden sm:flex items-center gap-1 border rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-teal-100 text-teal-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-teal-100 text-teal-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <PackageSearch className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-900 font-semibold text-lg">{t('catalog.notFound')}</p>
            <p className="text-sm text-gray-600">{t('catalog.notFoundSub')}</p>
            <Button
              variant="outline"
              className="mt-2 border-teal-300 text-teal-800 hover:bg-teal-50"
              onClick={() => { setSearch(''); setCategory('all'); setBrand('all'); setPage(1); }}
            >
              {t('catalog.reset')}
            </Button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            layout
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductCardGrid
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            layout
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductCardList
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mt-10"
          >
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-2">
                    {showEllipsis && <span className="text-gray-500">...</span>}
                    <Button
                      variant={page === p ? 'default' : 'outline'}
                      size="icon"
                      className={`h-9 w-9 ${page === p ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </span>
                );
              })}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ProductCardGrid({ product, onClick, onAddToCart }: {
  product: Product;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}) {
  const t = useT();
  return (
    <motion.div
      layout
      variants={gridItemVariants}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      <Card
        className="group cursor-pointer border border-gray-200 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden h-full"
        onClick={onClick}
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images ? (
            <img
              src={product.images}
              alt={product.name}
              className={`absolute inset-0 w-full h-full ${product.brand === 'Embraco' ? 'bg-white object-contain p-5' : 'object-cover'} group-hover:scale-105 transition-transform duration-500`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
              <Snowflake className="h-12 w-12 text-teal-300 opacity-40" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 font-semibold">{t('catalog.badge.new')}</Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-0.5 font-semibold">
                <Sparkles className="h-2.5 w-2.5" />
                {t('catalog.badge.featured')}
              </Badge>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 font-semibold">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>
          <motion.div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-md hover:bg-gray-200"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              <Eye className="h-4 w-4 text-gray-800" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-full bg-teal-600 hover:bg-teal-700 shadow-md text-white"
              onClick={(event) => product.price > 0 ? onAddToCart(event) : (event.stopPropagation(), onClick())}
              aria-label={product.price > 0 ? 'Tambahkan ke keranjang' : 'Tanyakan harga dan ketersediaan'}
            >
              {product.price > 0 ? <ShoppingCart className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
        <CardContent className="p-3">
          {product.brand && (
            <p className="text-[10px] font-semibold text-teal-700 mb-0.5 uppercase tracking-wider">
              {product.brand}
            </p>
          )}
          <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 mb-1.5 group-hover:text-teal-700 transition-colors leading-snug min-h-[2.25rem]">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-[10px] text-gray-600 mb-1.5 font-medium">{product.category.name}</p>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-teal-800">
              {product.price > 0 ? formatRupiah(product.price) : 'Harga melalui penawaran'}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-red-500 line-through font-medium">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProductCardList({ product, onClick, onAddToCart }: {
  product: Product;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}) {
  const t = useT();
  return (
    <motion.div
      layout
      variants={listItemVariants}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      <Card
        className="group cursor-pointer border border-gray-200 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
        onClick={onClick}
      >
        <CardContent className="p-4 flex gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shrink-0 relative overflow-hidden">
            {product.images ? (
              <img
                src={product.images}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Snowflake className="h-8 w-8 text-teal-300 opacity-40" />
            )}
            <div className="absolute top-1 left-1 flex flex-col gap-0.5">
              {product.isNew && <Badge className="bg-emerald-600 text-white text-[8px] px-1 py-0 font-semibold">{t('catalog.badge.new')}</Badge>}
              {product.originalPrice && product.originalPrice > product.price && (
                <Badge className="bg-red-600 text-white text-[8px] px-1 py-0 font-semibold">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </Badge>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {product.brand && (
                  <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
                {product.category && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-700 border-gray-300">
                    {product.category.name}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                {product.name}
              </h3>
              {product.shortDesc && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 hidden sm:block">
                  {product.shortDesc}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs hover:bg-gray-100"
                  onClick={(e) => { e.stopPropagation(); onClick(); }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {t('catalog.detail')}
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={(event) => product.price > 0 ? onAddToCart(event) : (event.stopPropagation(), onClick())}
                  aria-label={product.price > 0 ? t('catalog.cart') : 'Tanyakan harga dan ketersediaan'}
                >
                  {product.price > 0 ? <ShoppingCart className="h-3.5 w-3.5 mr-1" /> : <MessageCircle className="h-3.5 w-3.5 mr-1" />}
                  {product.price > 0 ? t('catalog.cart') : 'Tanya harga'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
