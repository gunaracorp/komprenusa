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
    default: 'Juragan Kompresor | Pusat AC, Kompresor, Refrigerant & Spare Part Terlengkap di Indonesia',
    template: '%s | Juragan Kompresor',
  },
  description: 'PT Juragan Kompresor — Distributor HVAC resmi sejak 2010 di Kawasan MM2100 Bekasi. Pusat penjualan AC, kompresor, refrigerant, spare part, chiller, VRV/VRF, dan sistem pendingin gedung terlengkap. Harga kompetitif, garansi resmi, pengiriman ke 34 provinsi Indonesia.',
  authors: [{ name: 'PT Juragan Kompresor', url: SITE_URL }],
  creator: 'PT Digital Bisnis Manajemen',
  publisher: 'PT Juragan Kompresor',
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
    siteName: 'Juragan Kompresor',
    title: 'Juragan Kompresor | Distributor HVAC Resmi Sejak 2010',
    description: 'Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.',
    images: [{ url: '/images/hero/hero-1.png', alt: 'Sistem pendingin HVAC modern — PT Juragan Kompresor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juragan Kompresor | Distributor HVAC Resmi Sejak 2010',
    description: 'Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.',
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
