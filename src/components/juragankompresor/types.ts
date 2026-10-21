// Shared plain types — no Prisma dependency needed
// Used by components that receive data as props

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  _count?: { products: number };
};

export type Product = {
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

export type Testimonial = {
  id: string;
  name: string;
  company?: string | null;
  position?: string | null;
  content: string;
  rating: number;
};
