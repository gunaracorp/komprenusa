'use client';

import { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Header } from './Header';
import { Hero } from './Hero';
import { AboutSection } from './AboutSection';
import { CategoryGrid } from './CategoryGrid';
import { FeaturedProducts } from './FeaturedProducts';
import { PromoBanner } from './PromoBanner';
import { WhyChooseUs } from './WhyChooseUs';
import { BrandPartners } from './BrandPartners';
import { Testimonials } from './Testimonials';
import { GallerySection } from './GallerySection';
import { ProductCatalog } from './ProductCatalog';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { ContactSection } from './ContactSection';
import { ServiceCoverage } from './ServiceCoverage';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';
import { InfoPages, useInfoRoute } from './InfoPages';

// Plain types — no Prisma dependency needed for client components
type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  _count?: { products: number };
};

type Testimonial = {
  id: string;
  name: string;
  company?: string | null;
  position?: string | null;
  content: string;
  rating: number;
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
  isFeatured: boolean;
  isNew: boolean;
  minOrder: number;
  unit: string;
  category: { name: string; slug: string } | null;
};

interface Props {
  categories: Category[];
  featuredProducts: Product[];
  allProducts: Product[];
  testimonials: Testimonial[];
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 z-[100] origin-left"
      style={{ scaleX }}
    />
  );
}

export function PageClient({
  categories,
  featuredProducts,
  allProducts,
  testimonials,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const infoRoute = useInfoRoute();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        {infoRoute ? (
          <InfoPages />
        ) : (
          <>
            <Hero />
            <AboutSection />
            <CategoryGrid categories={categories} />
            <FeaturedProducts
              products={featuredProducts}
              onProductClick={handleProductClick}
            />
            <PromoBanner />
            <WhyChooseUs />
            <BrandPartners />
            <ProductCatalog
              categories={categories}
              allProducts={allProducts}
              onProductClick={handleProductClick}
            />
            <Testimonials testimonials={testimonials} />
            <GallerySection />
            <ContactSection />
            <ServiceCoverage />
          </>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
      <ProductDetailModal
        product={selectedProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}