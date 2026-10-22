'use client';

import { useLangStore, type Lang } from '@/stores/lang-store';

export type Entry = { id: string; en: string };

/** Central UI dictionary — Indonesian & English. */
export const dict = {
  // ── Navigation ──
  'nav.home': { id: 'Beranda', en: 'Home' },
  'nav.categories': { id: 'Kategori', en: 'Categories' },
  'nav.products': { id: 'Produk', en: 'Products' },
  'nav.advantages': { id: 'Keunggulan', en: 'Why Us' },
  'nav.testimonials': { id: 'Testimoni', en: 'Testimonials' },
  'nav.contact': { id: 'Kontak', en: 'Contact' },
  'topbar.shipping': { id: 'Pengiriman Seluruh Indonesia', en: 'Nationwide Delivery Across Indonesia' },
  'header.contactUs': { id: 'Hubungi Kami', en: 'Contact Us' },
  'header.searchPlaceholder': { id: 'Cari produk...', en: 'Search products...' },
  'header.searchAria': { id: 'Cari', en: 'Search' },
  'header.searchProductAria': { id: 'Cari produk', en: 'Search products' },
  'header.menuTitle': { id: 'Menu Navigasi', en: 'Navigation Menu' },

  // ── Hero ──
  'hero.badge': { id: 'Distributor Resmi HVAC Terpercaya Sejak 2008', en: 'Trusted Official HVAC Distributor Since 2008' },
  'hero.title1': { id: 'Solusi', en: 'Cooling' },
  'hero.titleHighlight': { id: 'Pendingin', en: 'Solutions' },
  'hero.title2': { id: 'Terlengkap untuk', en: 'Complete for' },
  'hero.titleHighlight2': { id: 'Setiap Kebutuhan', en: 'Every Need' },
  'hero.subtitle': {
    id: 'Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung dari brand-brand terkemuka dunia. Harga bersaing, garansi resmi, dan layanan purna jual terbaik.',
    en: 'Your central hub for air conditioners, compressors, refrigerants, spare parts, and building cooling systems from the world\u2019s leading brands. Competitive prices, official warranty, and best-in-class after-sales service.',
  },
  'hero.ctaCatalog': { id: 'Lihat Katalog Produk', en: 'Browse Product Catalog' },
  'hero.ctaConsult': { id: 'Konsultasi Gratis', en: 'Free Consultation' },
  'hero.badge.warranty': { id: 'Garansi Resmi', en: 'Official Warranty' },
  'hero.badge.shipping': { id: 'Pengiriman Se-Indonesia', en: 'Nationwide Shipping' },
  'hero.badge.fast': { id: 'Respon Cepat 24 Jam', en: '24-Hour Fast Response' },
  'hero.badge.consult': { id: 'Konsultasi Gratis', en: 'Free Consultation' },
  'hero.stat.projects': { id: 'Proyek Selesai', en: 'Projects Completed' },
  'hero.stat.rating': { id: 'Rating Kepuasan', en: 'Satisfaction Rating' },

  // ── About ──
  'about.badge': { id: 'Tentang Kami', en: 'About Us' },
  'about.heading': { id: 'Profil Perusahaan', en: 'Company Profile' },
  'about.sub': {
    id: 'Mengenal lebih dekat PT KompresNusa, mitra terpercaya Anda dalam solusi pendingin.',
    en: 'Get to know PT KompresNusa, your trusted partner in cooling solutions.',
  },
  'about.badge.founded': { id: 'Didirikan 2008', en: 'Established 2008' },
  'about.badge.location': { id: 'Kawasan MM2100 Bekasi', en: 'MM2100 Estate, Bekasi' },
  'about.badge.distributor': { id: 'Distributor HVAC Resmi', en: 'Official HVAC Distributor' },
  'about.specialties': { id: 'Spesialisasi Kami', en: 'Our Specialties' },
  'about.spec.ac': { id: 'AC Split', en: 'Split AC' },
  'about.spec.refrigerant': { id: 'Refrigerant', en: 'Refrigerant' },
  'about.spec.compressor': { id: 'Kompresor', en: 'Compressor' },
  'about.spec.sparepart': { id: 'Spare Part', en: 'Spare Parts' },
  'about.spec.ventilation': { id: 'Ventilasi', en: 'Ventilation' },
  'about.spec.thermostat': { id: 'Termostat', en: 'Thermostat' },
  'about.spec.chiller': { id: 'Chiller', en: 'Chiller' },
  'about.spec.installation': { id: 'Instalasi', en: 'Installation' },
  'about.stat.years': { id: 'Tahun', en: 'Years' },
  'about.stat.projects': { id: 'Proyek', en: 'Projects' },
  'about.stat.brands': { id: 'Brand', en: 'Brands' },
  'about.stat.provinces': { id: 'Provinsi', en: 'Provinces' },
  'about.story.heading': { id: 'Cerita Kami', en: 'Our Story' },
  'about.story.text': {
    id: 'KompresNusa didirikan pada tahun 2008 di kawasan industri MM2100 Bekasi. Bermula dari toko spare part AC kecil, kami terus berkembang menjadi salah satu distributor pendingin terbesar di Indonesia. Dengan komitmen menghadirkan produk berkualitas tinggi dan layanan terbaik, kami telah menyelesaikan 7.439 proyek di 38 provinsi seluruh Indonesia. Kami percaya bahwa setiap proyek pendingin membutuhkan mitra yang dapat dipercaya \u2014 itulah mengapa kami selalu mengutamakan kejujuran, kualitas, dan pelayanan prima dalam setiap transaksi.',
    en: 'KompresNusa was founded in 2008 in the MM2100 industrial estate, Bekasi. Starting from a small air-conditioning spare parts store, we have grown into one of Indonesia\u2019s largest cooling distributors. With a commitment to high-quality products and excellent service, we have completed 7,439 projects across all 38 provinces of Indonesia. We believe every cooling project needs a trustworthy partner \u2014 that is why we always prioritize honesty, quality, and excellence in every transaction.',
  },
  'about.vision': { id: 'Visi', en: 'Vision' },
  'about.vision.text': {
    id: 'Menjadi distributor pendingin terpercaya dan terlengkap di Indonesia dengan jaringan distribusi terluas.',
    en: 'To become Indonesia\u2019s most trusted and most complete cooling distributor with the widest distribution network.',
  },
  'about.mission': { id: 'Misi', en: 'Mission' },
  'about.mission.text': {
    id: 'Menyediakan produk pendingin berkualitas tinggi dengan harga kompetitif, didukung layanan purna jual terbaik untuk kepuasan pelanggan.',
    en: 'To provide high-quality cooling products at competitive prices, backed by excellent after-sales service for customer satisfaction.',
  },

  // ── Categories ──
  'categories.badge': { id: 'Kategori Produk', en: 'Product Categories' },
  'categories.heading1': { id: 'Solusi Pendingin', en: 'Complete Cooling' },
  'categories.headingHighlight': { id: 'Lengkap', en: 'Solutions' },
  'categories.sub': {
    id: 'Temukan berbagai macam produk pendingin berkualitas tinggi dari brand-brand terkemuka dunia untuk kebutuhan residensial, komersial, dan industri.',
    en: 'Discover a wide range of high-quality cooling products from the world\u2019s leading brands for residential, commercial, and industrial needs.',
  },
  'categories.count': { id: 'produk', en: 'products' },

  // ── Catalog ──
  'catalog.badge': { id: 'Katalog Produk', en: 'Product Catalog' },
  'catalog.heading1': { id: 'Semua', en: 'All Our' },
  'catalog.headingHighlight': { id: 'Produk', en: 'Products' },
  'catalog.heading2': { id: 'Kami', en: '' },
  'catalog.sub': {
    id: 'Jelajahi koleksi lengkap produk pendingin berkualitas tinggi. Gunakan filter untuk menemukan produk yang Anda butuhkan.',
    en: 'Explore our complete collection of high-quality cooling products. Use the filters to find exactly what you need.',
  },
  'catalog.searchPlaceholder': { id: 'Cari produk, brand, atau model...', en: 'Search products, brands, or models...' },
  'catalog.filter': { id: 'Filter', en: 'Filter' },
  'catalog.allCategories': { id: 'Semua Kategori', en: 'All Categories' },
  'catalog.allBrands': { id: 'Semua Brand', en: 'All Brands' },
  'catalog.sort': { id: 'Urutkan', en: 'Sort by' },
  'catalog.sort.newest': { id: 'Terbaru', en: 'Newest' },
  'catalog.sort.name': { id: 'Nama A-Z', en: 'Name A-Z' },
  'catalog.sort.priceLow': { id: 'Harga Terendah', en: 'Lowest Price' },
  'catalog.sort.priceHigh': { id: 'Harga Tertinggi', en: 'Highest Price' },
  'catalog.notFound': { id: 'Produk tidak ditemukan', en: 'No products found' },
  'catalog.notFoundSub': { id: 'Coba ubah filter atau kata kunci pencarian Anda.', en: 'Try adjusting your filters or search keywords.' },
  'catalog.reset': { id: 'Reset Filter', en: 'Reset Filters' },
  'catalog.badge.new': { id: 'BARU', en: 'NEW' },
  'catalog.badge.featured': { id: 'UNGGULAN', en: 'FEATURED' },
  'catalog.detail': { id: 'Detail', en: 'Details' },
  'catalog.cart': { id: 'Keranjang', en: 'Cart' },
  'catalog.added': { id: 'Ditambahkan ke keranjang', en: 'Added to cart' },

  // ── Why Choose Us ──
  'why.badge': { id: 'Mengapa KompresNusa?', en: 'Why KompresNusa?' },
  'why.heading': { id: 'Keunggulan Kami', en: 'Our Advantages' },
  'why.sub': {
    id: 'Komitmen kami menghadirkan produk pendingin berkualitas tinggi dengan layanan terbaik untuk memastikan kepuasan pelanggan.',
    en: 'Our commitment to delivering high-quality cooling products with the best service to ensure customer satisfaction.',
  },
  'why.stat.years': { id: 'Tahun Pengalaman', en: 'Years of Experience' },
  'why.stat.projects': { id: 'Proyek Selesai', en: 'Projects Completed' },
  'why.stat.brands': { id: 'Brand Ternama', en: 'Leading Brands' },
  'why.stat.provinces': { id: 'Provinsi Terjangkau', en: 'Provinces Served' },
  'why.f1.title': { id: 'Garansi Resmi', en: 'Official Warranty' },
  'why.f1.desc': {
    id: 'Semua produk bergaransi resmi dari brand ternama dengan jaminan kualitas.',
    en: 'All products carry official warranties from leading brands with quality assurance.',
  },
  'why.f2.title': { id: 'Pengiriman Se-Indonesia', en: 'Nationwide Delivery' },
  'why.f2.desc': {
    id: 'Jaringan logistik luas memastikan pesanan sampai aman dan tepat waktu.',
    en: 'An extensive logistics network ensures orders arrive safely and on time.',
  },
  'why.f3.title': { id: 'Respon 24 Jam', en: '24-Hour Response' },
  'why.f3.desc': {
    id: 'Tim customer service siap membantu Anda kapan saja, termasuk hari libur.',
    en: 'Our customer service team is ready to help anytime, including holidays.',
  },
  'why.f4.title': { id: 'Konsultasi Gratis', en: 'Free Consultation' },
  'why.f4.desc': {
    id: 'Tim ahli HVAC siap memberikan konsultasi teknis untuk proyek Anda.',
    en: 'Our HVAC experts are ready to provide technical consultation for your project.',
  },
  'why.f5.title': { id: 'Distributor Resmi', en: 'Official Distributor' },
  'why.f5.desc': {
    id: 'Mitra resmi brand Daikin, Panasonic, Samsung, LG, Gree, dan lainnya.',
    en: 'Official partner of Daikin, Panasonic, Samsung, LG, Gree, and more.',
  },
  'why.f6.title': { id: 'Harga Kompetitif', en: 'Competitive Pricing' },
  'why.f6.desc': {
    id: 'Harga langsung dari distributor dengan penawaran terbaik di kelasnya.',
    en: 'Direct-from-distributor pricing with the best deals in its class.',
  },
  'why.f7.title': { id: 'Layanan Instalasi', en: 'Installation Service' },
  'why.f7.desc': {
    id: 'Tim teknisi berpengalaman siap membantu pemasangan dan instalasi.',
    en: 'Experienced technicians ready to assist with mounting and installation.',
  },
  'why.f8.title': { id: '7,439+ Klien Puas', en: '7,439+ Happy Clients' },
  'why.f8.desc': {
    id: 'Dipercaya oleh ribuan perusahaan, hotel, rumah sakit, dan pabrik di Indonesia.',
    en: 'Trusted by thousands of companies, hotels, hospitals, and factories across Indonesia.',
  },

  // ── Footer ──
  'footer.services': { id: 'Layanan', en: 'Services' },
  'footer.navigation': { id: 'Navigasi', en: 'Navigation' },
  'footer.categories': { id: 'Kategori', en: 'Categories' },
  'footer.brands': { id: 'Brand Tersedia', en: 'Available Brands' },
  'footer.desc': {
    id: 'Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.',
    en: 'Indonesia\u2019s most complete hub for air conditioners, compressors, refrigerants, spare parts, and building cooling systems.',
  },
  'footer.consulting': { id: 'Konsultan Strategis', en: 'Strategic Consulting' },
  'footer.platform': { id: 'Platform & Sistem Digital', en: 'Digital Platform & System' },
  'footer.rights': { id: 'Seluruh Hak Cipta Dilindungi.', en: 'All Rights Reserved.' },
  'footer.systemBy': { id: 'Sistem oleh', en: 'System by' },
  'footer.backToTop': { id: 'Kembali ke atas', en: 'Back to top' },
  'footer.ctaTitle': { id: 'Butuh Solusi Pendingin untuk Proyek Anda?', en: 'Need Cooling Solutions for Your Project?' },
  'footer.ctaSub': {
    id: 'Tim ahli kami siap membantu Anda memilih produk yang tepat dengan penawaran harga terbaik. Konsultasi gratis!',
    en: 'Our expert team is ready to help you choose the right products with the best price offer. Free consultation!',
  },
  'footer.ctaButton': { id: 'Hubungi Kami Sekarang', en: 'Contact Us Now' },
  'footer.about': { id: 'Tentang Kami', en: 'About Us' },
  'footer.faq': { id: 'FAQ', en: 'FAQ' },
  'footer.privacy': { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
  'footer.terms': { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
  'footer.infoPages': { id: 'Informasi', en: 'Information' },

  // ── Featured Products ──
  'featured.badge': { id: 'Pilihan Terbaik', en: 'Top Picks' },
  'featured.heading1': { id: 'Produk', en: 'Featured' },
  'featured.headingHighlight': { id: 'Unggulan', en: 'Products' },
  'featured.viewAll': { id: 'Lihat Semua Produk', en: 'View All Products' },

  // ── Promo Banner ──
  'promo.shipping': { id: 'GRATIS ONGKIR', en: 'FREE SHIPPING' },
  'promo.shippingDesc': { id: 'Untuk pembelian di atas Rp10.000.000', en: 'For purchases above IDR 10,000,000' },
  'promo.install': { id: 'INSTALASI GRATIS', en: 'FREE INSTALLATION' },
  'promo.installDesc': { id: 'Untuk pembelian unit AC minimal 2 unit', en: 'With any purchase of 2+ AC units' },

  // ── Testimonials ──
  'testimonials.badge': { id: 'Testimoni Pelanggan', en: 'Customer Testimonials' },
  'testimonials.heading1': { id: 'Dipercaya', en: 'Trusted by' },
  'testimonials.headingHighlight': { id: 'Ribuan Klien', en: 'Thousands of Clients' },
  'testimonials.sub': {
    id: 'Kepuasan pelanggan adalah prioritas utama kami. Berikut beberapa testimoni dari klien yang telah bekerja sama dengan kami.',
    en: 'Customer satisfaction is our top priority. Here are some testimonials from clients who have worked with us.',
  },

  // ── Gallery ──
  'gallery.badge': { id: 'Galeri & Aktivitas', en: 'Gallery & Activities' },
  'gallery.heading1': { id: 'Dokumentasi', en: 'Documenting' },
  'gallery.headingHighlight': { id: 'Kegiatan Kami', en: 'Our Activities' },
  'gallery.sub': {
    id: 'Dokumentasi kegiatan operasional, pengiriman, dan kemitraan kami di bidang HVAC.',
    en: 'Documentation of our operations, deliveries, and HVAC partnerships.',
  },
  'gallery.cap1': { id: 'Proses Pengiriman AC ke Proyek Hotel Jakarta', en: 'AC Delivery Process to a Jakarta Hotel Project' },
  'gallery.cap2': { id: 'Demo Unit Chiller Daikin 20 PK', en: 'Daikin 20 HP Chiller Unit Demo' },
  'gallery.cap3': { id: 'Pemasangan VRV/VRF di Gedung Perkantoran', en: 'VRV/VRF Installation in an Office Building' },
  'gallery.cap4': { id: 'Pameran HVAC Indonesia 2024', en: 'HVAC Indonesia Expo 2024' },
  'gallery.cap5': { id: 'Pelatihan Teknisi Bersama Daikin', en: 'Technician Training with Daikin' },
  'gallery.cap6': { id: 'Kunjungan Pabrik Mitsubishi Electric', en: 'Mitsubishi Electric Factory Visit' },

  // ── Service Coverage ──
  'coverage.badge': { id: 'Jangkauan Layanan', en: 'Service Coverage' },
  'coverage.heading1': { id: 'Melayani', en: 'Serving' },
  'coverage.headingHighlight': { id: 'Seluruh Indonesia', en: 'All of Indonesia' },
  'coverage.sub': {
    id: 'Jaringan distribusi dan layanan purna jual kami mencakup 38 provinsi di seluruh Indonesia, memastikan produk dan layanan HVAC terbaik selalu terjangkau di dekat Anda.',
    en: 'Our distribution and after-sales service network covers all 38 provinces across Indonesia, ensuring the best HVAC products and services are always within your reach.',
  },
  'coverage.provinces': { id: 'Provinsi Indonesia', en: 'Provinces of Indonesia' },

  // ── Contact ──
  'contact.badge': { id: 'Hubungi Kami', en: 'Contact Us' },
  'contact.heading1': { id: 'Siap', en: 'Ready to' },
  'contact.headingHighlight': { id: 'Membantu Anda', en: 'Help You' },
  'contact.sub': {
    id: 'Hubungi tim kami untuk konsultasi gratis, penawaran harga, atau informasi lebih lanjut mengenai produk dan layanan kami.',
    en: 'Contact our team for a free consultation, price quotes, or more information about our products and services.',
  },
  'contact.phone': { id: 'Telepon', en: 'Phone' },
  'contact.whatsapp': { id: 'WhatsApp', en: 'WhatsApp' },
  'contact.email': { id: 'Email', en: 'Email' },
  'contact.hoursDesc': { id: 'Senin - Sabtu, 08:00 - 17:00', en: 'Mon - Sat, 08:00 - 17:00' },
  'contact.waDesc': { id: 'Respon cepat 24 jam', en: 'Fast 24-hour response' },
  'contact.emailDesc': { id: 'Respon dalam 1x24 jam', en: 'Response within 1x24 hours' },
  'contact.address': { id: 'Alamat', en: 'Address' },
  'contact.hours': { id: 'Jam Operasional', en: 'Business Hours' },
  'contact.hoursValue': { id: 'Senin - Sabtu', en: 'Monday - Saturday' },
  'contact.error': { id: 'Mohon isi nama, email, dan pesan', en: 'Please fill in your name, email, and message' },
  'contact.sent': { id: 'Pesan dikirim via WhatsApp!', en: 'Message sent via WhatsApp!' },
  'contact.sentDesc': { id: 'Tim kami akan segera merespon.', en: 'Our team will respond shortly.' },
  'contact.waError': { id: 'Gagal membuka WhatsApp', en: 'Failed to open WhatsApp' },
  'contact.form.heading': { id: 'Kirim Pesan', en: 'Send a Message' },
  'contact.form.note': {
    id: 'Isi formulir di bawah — pesan akan dikirim langsung via WhatsApp ke tim kami.',
    en: 'Fill in the form below — your message will be sent directly to our team via WhatsApp.',
  },
  'contact.form.name': { id: 'Nama', en: 'Name' },
  'contact.form.namePh': { id: 'Nama Anda', en: 'Your name' },
  'contact.form.phone': { id: 'No. Telepon', en: 'Phone Number' },
  'contact.form.phonePh': { id: 'No. telepon Anda', en: 'Your phone number' },
  'contact.form.subject': { id: 'Subjek', en: 'Subject' },
  'contact.form.subjectPh': { id: 'Subjek pesan', en: 'Message subject' },
  'contact.form.message': { id: 'Pesan', en: 'Message' },
  'contact.form.messagePh': { id: 'Tulis pesan Anda...', en: 'Write your message...' },
  'contact.form.send': { id: 'Kirim Pesan', en: 'Send Message' },

  // ── Cart Drawer ──
  'cart.title': { id: 'Keranjang Belanja', en: 'Shopping Cart' },
  'cart.empty': { id: 'Keranjang Anda masih kosong', en: 'Your cart is still empty' },
  'cart.emptyDesc': {
    id: 'Jelajahi katalog produk kami dan tambahkan produk yang Anda butuhkan.',
    en: 'Browse our product catalog and add the products you need.',
  },
  'cart.browse': { id: 'Jelajahi Produk', en: 'Browse Products' },
  'cart.subtotal': { id: 'Subtotal', en: 'Subtotal' },
  'cart.item': { id: 'item', en: 'item(s)' },
  'cart.total': { id: 'Total', en: 'Total' },
  'cart.clear': { id: 'Kosongkan Keranjang', en: 'Clear Cart' },
  'cart.quote': { id: 'Minta Penawaran', en: 'Request a Quote' },
  'cart.error': { id: 'Mohon isi nama, email, dan nomor telepon', en: 'Please fill in your name, email, and phone number' },
  'cart.quoteSent': { id: 'Penawaran dikirim via WhatsApp!', en: 'Quote request sent via WhatsApp!' },
  'cart.quoteSentDesc': { id: 'Tim kami akan menghubungi Anda dalam 1x24 jam.', en: 'Our team will contact you within 1x24 hours.' },
  'cart.waError': { id: 'Gagal membuka WhatsApp', en: 'Failed to open WhatsApp' },
  'cart.back': { id: 'Kembali', en: 'Back' },
  'cart.sending': { id: 'Mengirim...', en: 'Sending...' },
  'cart.form.fullName': { id: 'Nama Lengkap', en: 'Full Name' },
  'cart.form.namePh': { id: 'Nama Anda', en: 'Your name' },
  'cart.form.company': { id: 'Nama Perusahaan', en: 'Company Name' },
  'cart.form.companyPh': { id: 'Nama perusahaan (opsional)', en: 'Company name (optional)' },
  'cart.form.message': { id: 'Catatan Tambahan', en: 'Additional Notes' },
  'cart.form.messagePh': { id: 'Catatan untuk pesanan Anda (opsional)', en: 'Notes for your order (optional)' },

  // ── Product Detail Modal ──
  'modal.warranty': { id: 'Garansi Resmi', en: 'Official Warranty' },
  'modal.safeShipping': { id: 'Pengiriman Aman', en: 'Safe Shipping' },
  'modal.returnable': { id: 'Bisa Tukar', en: 'Returnable' },
  'modal.desc': { id: 'DESKRIPSI', en: 'DESCRIPTION' },
  'modal.specs': { id: 'SPESIFIKASI', en: 'SPECIFICATIONS' },
  'modal.qty': { id: 'Jumlah:', en: 'Qty:' },
  'modal.minOrder': { id: 'Minimal order:', en: 'Min. order:' },
  'modal.addToCart': { id: 'Tambah ke Keranjang', en: 'Add to Cart' },
  'modal.share': { id: 'Bagikan Produk', en: 'Share Product' },
  'modal.copied': { id: 'Link produk disalin!', en: 'Product link copied!' },
  'modal.category': { id: 'Kategori:', en: 'Category:' },

  // ── WhatsApp Button ──
  'wa.help': { id: 'Butuh bantuan? 💬', en: 'Need help? 💬' },
  'wa.tooltip': {
    id: 'Chat langsung via WhatsApp untuk respon cepat!',
    en: 'Chat directly via WhatsApp for a fast response!',
  },
  'wa.aria': { id: 'Chat via WhatsApp', en: 'Chat via WhatsApp' },
} satisfies Record<string, Entry>;

export type DictKey = keyof typeof dict;

/** Hook: returns a translate function bound to the active language. */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key: DictKey): string => dict[key]?.[lang] ?? key;
}

/** Non-hook helper for module-level contexts. */
export function tx(key: DictKey, lang: Lang): string {
  return dict[key]?.[lang] ?? key;
}

export function pick(entry: Entry, lang: Lang): string {
  return entry[lang];
}

export type { Lang };
