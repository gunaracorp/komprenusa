import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const SITE_URL = 'https://www.juragankompresor.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jual Kompresor AC & Spare Part Pendingin | KOMPRESNUSA',
    template: '%s | KOMPRESNUSA',
  },
  description: 'KOMPRESNUSA — Pusat Kompresor AC dan Spare Part Pendingin Indonesia. Distributor HVAC resmi sejak 2008: periksa spesifikasi, kecocokan produk, harga, dan informasi pemesanan. Kirim ke 38 provinsi Indonesia.',
  authors: [{ name: 'PT KompresNusa', url: SITE_URL }],
  creator: 'PT Digital Bisnis Manajemen',
  publisher: 'PT KompresNusa',
  category: 'business',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'KOMPRESNUSA',
    title: 'KOMPRESNUSA — Pusat Kompresor AC & Spare Part Pendingin Indonesia',
    description: 'Temukan kompresor AC dan spare part pendingin sesuai kebutuhan Anda. Periksa spesifikasi, kecocokan produk, harga, dan informasi pemesanan di KompresNusa.',
    images: [{ url: '/images/hero/hero-1.png', alt: 'Sistem pendingin HVAC modern — PT KompresNusa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KOMPRESNUSA — Pusat Kompresor AC & Spare Part Pendingin Indonesia',
    description: 'Temukan kompresor AC dan spare part pendingin sesuai kebutuhan Anda. Periksa spesifikasi, kecocokan produk, harga, dan informasi pemesanan di KompresNusa.',
    images: ['/images/hero/hero-1.png'],
  },
  icons: { icon: '/images/logo.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
