'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Wrench,
  Headphones,
  Building2,
  Snowflake,
  Droplets,
  Fan,
  HelpCircle,
  Lock,
  FileText,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLangStore } from '@/stores/lang-store';
import { pick, type Entry } from '@/lib/i18n';

/* ────────────────────────────── Router ────────────────────────────── */

export const INFO_ROUTES = ['tentang', 'layanan', 'faq', 'privasi', 'syarat'] as const;
export type InfoRoute = (typeof INFO_ROUTES)[number];

function useHashRoute(): string | null {
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    const parse = () => {
      const h = window.location.hash;
      if (h.startsWith('#/')) {
        const r = h.slice(2).split('/')[0];
        setRoute((INFO_ROUTES as readonly string[]).includes(r) ? r : null);
      } else {
        setRoute(null);
      }
    };
    parse();
    window.addEventListener('hashchange', parse);
    return () => window.removeEventListener('hashchange', parse);
  }, []);

  return route;
}

/** Public hook: returns the active info route (or null when on the main page). */
export function useInfoRoute(): InfoRoute | null {
  return useHashRoute() as InfoRoute | null;
}

export function navigateInfo(route: InfoRoute) {
  window.location.hash = `#/${route}`;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

/* ────────────────────────────── Shell ────────────────────────────── */

function PageShell({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const goHome = () => {
    window.location.hash = '';
    requestAnimationFrame(() => {
      document.querySelector('#beranda')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <div className="bg-gray-50 min-h-[70vh]">
      {/* Page hero */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-14 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={goHome}
              className="mb-8 bg-transparent border-white/40 text-white hover:bg-white/15 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Beranda / Home
            </Button>
            <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-5">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-3">{title}</h1>
            <p className="text-teal-100 text-base lg:text-lg max-w-2xl">{subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Page body */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="max-w-3xl mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full bg-teal-600 inline-block" aria-hidden="true" />
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed space-y-3 text-[15px]">{children}</div>
    </section>
  );
}

/* ────────────────────────────── Content ────────────────────────────── */

const L = pick;

function AboutPage({ lang }: { lang: 'id' | 'en' }) {
  return (
    <PageShell
      title={L({ id: 'Tentang Kami', en: 'About Us' }, lang)}
      subtitle={L(
        {
          id: 'PT Kompresa — distributor HVAC resmi sejak 2008, melayani seluruh Indonesia.',
          en: 'PT Kompresa — official HVAC distributor since 2008, serving all of Indonesia.',
        },
        lang
      )}
      icon={Building2}
    >
      <Section title={L({ id: 'Siapa Kami', en: 'Who We Are' }, lang)}>
        <p>
          {L(
            {
              id: 'PT Kompresa adalah perusahaan distribusi sistem pendingin (HVAC) yang berkantor pusat di Kawasan Industri MM2100, Bekasi, Jawa Barat. Berdiri sejak 2008, kami telah tumbuh dari toko spare part AC kecil menjadi salah satu distributor pendingin terlengkap di Indonesia dengan lebih dari 50 brand ternama dan 120+ produk aktif.',
              en: 'PT Kompresa is a cooling-system (HVAC) distribution company headquartered in the MM2100 Industrial Estate, Bekasi, West Java. Founded in 2008, we have grown from a small AC spare-parts store into one of Indonesia\u2019s most complete cooling distributors, carrying more than 50 leading brands and 120+ active products.',
            },
            lang
          )}
        </p>
        <p>
          {L(
            {
              id: 'Kami melayani kebutuhan residensial, komersial, dan industri — dari rumah tangga, hotel, rumah sakit, mal, hingga pabrik — dengan pengiriman ke 38 provinsi di seluruh Indonesia.',
              en: 'We serve residential, commercial, and industrial needs — from households to hotels, hospitals, shopping malls, and factories — with delivery to all 38 provinces of Indonesia.',
            },
            lang
          )}
        </p>
      </Section>

      <Section title={L({ id: 'Nilai-Nilai Kami', en: 'Our Values' }, lang)}>
        <ul className="list-none space-y-3">
          {[
            {
              icon: ShieldCheck,
              t: { id: 'Kejujuran', en: 'Honesty' },
              d: { id: 'Transparan dalam harga, stok, dan spesifikasi produk.', en: 'Transparent in pricing, stock, and product specifications.' },
            },
            {
              icon: Snowflake,
              t: { id: 'Kualitas', en: 'Quality' },
              d: { id: 'Hanya menjual produk bergaransi resmi dari distributor resmi.', en: 'We only sell products with official distributor warranties.' },
            },
            {
              icon: Headphones,
              t: { id: 'Pelayanan Prima', en: 'Service Excellence' },
              d: { id: 'Respon cepat 24 jam dan konsultasi teknis gratis.', en: '24-hour fast response and free technical consultation.' },
            },
          ].map((v, i) => (
            <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <v.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{L(v.t, lang)}</p>
                <p className="text-sm">{L(v.d, lang)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={L({ id: 'Hubungi Kami', en: 'Contact Us' }, lang)}>
        <div className="space-y-2.5">
          <a href="tel:081220030092" className="flex items-center gap-3 text-teal-700 hover:text-teal-800 font-medium">
            <Phone className="h-4 w-4" /> (021) 2268-2617 / 0812-2003-0092
          </a>
          <a href="https://wa.me/6281350003423" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-teal-700 hover:text-teal-800 font-medium">
            <Phone className="h-4 w-4" /> WhatsApp +62 813-5000-3423
          </a>
          <a href="mailto:kompresa@gmail.com" className="flex items-center gap-3 text-teal-700 hover:text-teal-800 font-medium break-all">
            <Mail className="h-4 w-4" /> kompresa@gmail.com
          </a>
          <p className="flex items-start gap-3 text-gray-600">
            <MapPin className="h-4 w-4 mt-1 shrink-0 text-teal-700" />
            {L(
              { id: 'Jl. Raya Industri No. 88, Kawasan Industri MM2100, Bekasi 17520, Jawa Barat', en: 'Jl. Raya Industri No. 88, MM2100 Industrial Estate, Bekasi 17520, West Java' },
              lang
            )}
          </p>
        </div>
      </Section>
    </PageShell>
  );
}

function ServicesPage({ lang }: { lang: 'id' | 'en' }) {
  const services: { icon: React.ComponentType<{ className?: string }>; t: Entry; d: Entry }[] = [
    {
      icon: Snowflake,
      t: { id: 'Penjualan Unit AC & Sistem Pendingin', en: 'AC Units & Cooling System Sales' },
      d: {
        id: 'AC Split, Cassette, Standing Floor, Ducting, VRV/VRF, hingga Chiller industri dari brand ternama dunia dengan garansi resmi.',
        en: 'Split, Cassette, Standing Floor, Ducting, VRV/VRF, up to industrial Chillers from leading global brands with official warranty.',
      },
    },
    {
      icon: Droplets,
      t: { id: 'Suplai Refrigerant & Kimia Pendingin', en: 'Refrigerant & Cooling Chemicals Supply' },
      d: {
        id: 'Freon R32, R410A, R134a, R22, oli kompresor, dan refrigerant lain dengan kualitas terjamin dan harga kompetitif.',
        en: 'R32, R410A, R134a, R22 refrigerants, compressor oils, and more — guaranteed quality at competitive prices.',
      },
    },
    {
      icon: Wrench,
      t: { id: 'Spare Part & Aksesoris', en: 'Spare Parts & Accessories' },
      d: {
        id: 'Kompresor, fan motor, PCB, kapasitor, remote, termostat, braket, hingga pipa tembaga — tersedia lengkap dan siap kirim.',
        en: 'Compressors, fan motors, PCBs, capacitors, remotes, thermostats, brackets, and copper pipes — fully stocked and ready to ship.',
      },
    },
    {
      icon: Wrench,
      t: { id: 'Instalasi & Pemasangan', en: 'Installation & Mounting' },
      d: {
        id: 'Tim teknisi berpengalaman untuk pemasangan AC residensial maupun proyek komersial skala besar.',
        en: 'Experienced technicians for residential installations as well as large-scale commercial projects.',
      },
    },
    {
      icon: Fan,
      t: { id: 'Service & Maintenance Berkala', en: 'Periodic Service & Maintenance' },
      d: {
        id: 'Kontrak perawatan rutin untuk gedung, hotel, dan pabrik — cuci AC, isi freon, hingga perbaikan sistem.',
        en: 'Routine maintenance contracts for buildings, hotels, and factories — AC cleaning, freon refill, and system repair.',
      },
    },
    {
      icon: Truck,
      t: { id: 'Pengiriman Seluruh Indonesia', en: 'Nationwide Delivery' },
      d: {
        id: 'Jaringan ekspedisi terpercaya dengan packing aman (kayu & bubble wrap) ke 38 provinsi.',
        en: 'Trusted logistics partners with secure packing (wooden crating & bubble wrap) to all 38 provinces.',
      },
    },
    {
      icon: Headphones,
      t: { id: 'Konsultasi Proyek Gratis', en: 'Free Project Consultation' },
      d: {
        id: 'Tim ahli HVAC kami membantu menghitung kebutuhan BTU, pemilihan unit, hingga perencanaan sistem.',
        en: 'Our HVAC experts help calculate BTU requirements, unit selection, and system planning.',
      },
    },
  ];

  return (
    <PageShell
      title={L({ id: 'Layanan Kami', en: 'Our Services' }, lang)}
      subtitle={L(
        {
          id: 'Solusi pendingin end-to-end: dari suplai produk, instalasi, hingga maintenance berkala.',
          en: 'End-to-end cooling solutions: from product supply and installation to periodic maintenance.',
        },
        lang
      )}
      icon={Wrench}
    >
      <div className="space-y-4">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{L(s.t, lang)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{L(s.d, lang)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}

function FaqPage({ lang }: { lang: 'id' | 'en' }) {
  const faqs: { q: Entry; a: Entry }[] = [
    {
      q: { id: 'Bagaimana cara memesan produk?', en: 'How do I place an order?' },
      a: {
        id: 'Pilih produk di katalog, klik "Tambah ke Keranjang", lalu klik tombol keranjang dan pilih "Minta Penawaran" atau hubungi WhatsApp kami di +62 813-5000-3423. Tim kami akan memandu proses selanjutnya.',
        en: 'Pick a product in the catalog, click "Add to Cart", open the cart and choose "Request a Quote", or contact us on WhatsApp at +62 813-5000-3423. Our team will guide you through the next steps.',
      },
    },
    {
      q: { id: 'Apakah produk bergaransi resmi?', en: 'Are products covered by an official warranty?' },
      a: {
        id: 'Ya. Semua produk kami 100% bergaransi resmi distributor/brand. Kartu garansi disertakan pada setiap unit yang dikirim.',
        en: 'Yes. All our products are 100% covered by official distributor/brand warranties. A warranty card is included with every unit shipped.',
      },
    },
    {
      q: { id: 'Berapa lama pengiriman dan apakah ke luar pulau?', en: 'How long does shipping take, and do you ship outside Java?' },
      a: {
        id: 'Jabodetabek 1-2 hari kerja. Luar Jawa 2-5 hari kerja via ekspedisi terpercaya dengan packing kayu untuk keamanan unit. Kami mengirim ke seluruh 38 provinsi Indonesia.',
        en: 'Greater Jakarta 1-2 business days. Outside Java 2-5 business days via trusted couriers with wooden crating for unit safety. We ship to all 38 provinces of Indonesia.',
      },
    },
    {
      q: { id: 'Apakah tersedia gratis ongkir?', en: 'Is free shipping available?' },
      a: {
        id: 'Ya, gratis ongkir untuk pembelian di atas Rp10.000.000 (khusus area Jabodetabek). Untuk luar Jawa, ongkir dihitung sesuai berat dan tujuan.',
        en: 'Yes, free shipping for purchases above IDR 10,000,000 (Greater Jakarta area only). For other regions, shipping is calculated by weight and destination.',
      },
    },
    {
      q: { id: 'Metode pembayaran apa saja yang diterima?', en: 'Which payment methods do you accept?' },
      a: {
        id: 'Transfer bank (BCA, Mandiri, BRI, BNI), dan pembayaran tunai di toko. Untuk proyek/korporasi tersedia termin pembayaran sesuai kesepakatan kontrak.',
        en: 'Bank transfer (BCA, Mandiri, BRI, BNI) and cash at our store. For projects/corporates, payment terms are available per contract agreement.',
      },
    },
    {
      q: { id: 'Apakah melayani instalasi dan service?', en: 'Do you provide installation and servicing?' },
      a: {
        id: 'Ya. Kami menyediakan jasa instalasi, cuci AC, isi freon, dan kontrak maintenance berkala untuk gedung, hotel, rumah sakit, dan pabrik. Gratis instalasi untuk pembelian unit AC minimal 2 unit.',
        en: 'Yes. We provide installation, AC cleaning, freon refill, and periodic maintenance contracts for buildings, hotels, hospitals, and factories. Free installation for purchases of 2+ AC units.',
      },
    },
    {
      q: { id: 'Berapa minimal order untuk harga distributor?', en: 'What is the minimum order for distributor pricing?' },
      a: {
        id: 'Harga khusus distributor/reseller tersedia untuk pembelian quantity tertentu. Silakan hubungi tim sales kami untuk penawaran terbaik.',
        en: 'Special distributor/reseller pricing is available for bulk quantities. Contact our sales team for the best offer.',
      },
    },
    {
      q: { id: 'Bisakah konsultasi dulu sebelum membeli?', en: 'Can I consult before buying?' },
      a: {
        id: 'Tentu — konsultasi teknis kami gratis. Tim ahli HVAC kami siap membantu menghitung kebutuhan BTU, pemilihan tipe unit, hingga perencanaan instalasi untuk proyek Anda.',
        en: 'Absolutely — technical consultation is free. Our HVAC experts are ready to help with BTU calculations, unit selection, and installation planning for your project.',
      },
    },
  ];

  return (
    <PageShell
      title={L({ id: 'Pertanyaan yang Sering Diajukan', en: 'Frequently Asked Questions' }, lang)}
      subtitle={L(
        { id: 'Semua yang perlu Anda ketahui sebelum bertransaksi dengan kami.', en: 'Everything you need to know before doing business with us.' },
        lang
      )}
      icon={HelpCircle}
    >
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl bg-white border border-gray-200 hover:border-teal-300 transition-colors overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer font-semibold text-gray-900 text-[15px] list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {L(f.q, lang)}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform shrink-0" />
            </summary>
            <p className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 ml-0">
              {L(f.a, lang)}
            </p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}

function PrivacyPage({ lang }: { lang: 'id' | 'en' }) {
  return (
    <PageShell
      title={L({ id: 'Kebijakan Privasi', en: 'Privacy Policy' }, lang)}
      subtitle={L(
        { id: 'Bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.', en: 'How we collect, use, and protect your data.' },
        lang
      )}
      icon={Lock}
    >
      <Section title={L({ id: '1. Data yang Kami Kumpulkan', en: '1. Data We Collect' }, lang)}>
        <p>
          {L(
            {
              id: 'Kami mengumpulkan data yang Anda berikan secara langsung saat menghubungi kami: nama, nomor telepon/WhatsApp, alamat email, dan alamat pengiriman. Data pesanan (produk, jumlah, tanggal transaksi) juga kami simpan untuk keperluan layanan.',
              en: 'We collect data you provide directly when contacting us: name, phone/WhatsApp number, email address, and shipping address. Order data (products, quantities, transaction dates) is also stored for service purposes.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '2. Penggunaan Data', en: '2. How We Use Data' }, lang)}>
        <p>
          {L(
            {
              id: 'Data Anda digunakan solely untuk: memproses pesanan dan pengiriman, menjawab pertanyaan/permintaan penawaran, memberikan informasi garansi dan layanan purna jual, serta meningkatkan kualitas layanan kami.',
              en: 'Your data is used solely to: process orders and deliveries, answer questions/quote requests, provide warranty and after-sales information, and improve our services.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '3. Berbagi Data', en: '3. Data Sharing' }, lang)}>
        <p>
          {L(
            {
              id: 'Kami tidak menjual data pribadi Anda. Data hanya dibagikan dengan mitra ekspedisi untuk keperluan pengiriman, dan aparat berwenang bila diwajibkan oleh hukum yang berlaku di Indonesia.',
              en: 'We never sell your personal data. Data is shared only with logistics partners for delivery purposes, and with authorities when required by applicable Indonesian law.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '4. Keamanan & Retensi', en: '4. Security & Retention' }, lang)}>
        <p>
          {L(
            {
              id: 'Kami menerapkan langkah keamanan yang wajar untuk melindungi data Anda. Data pesanan disimpan selama diperlukan untuk kewajiban garansi, pajak, dan pembukuan sesuai ketentuan hukum.',
              en: 'We apply reasonable security measures to protect your data. Order data is retained as needed for warranty, tax, and bookkeeping obligations under applicable regulations.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '5. Hak Anda', en: '5. Your Rights' }, lang)}>
        <p>
          {L(
            {
              id: 'Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda dengan menghubungi kompresa@gmail.com. Kami akan merespons dalam 1x24 jam kerja.',
              en: 'You may request access to, correction of, or deletion of your personal data by contacting kompresa@gmail.com. We will respond within 1x24 business hours.',
            },
            lang
          )}
        </p>
      </Section>
    </PageShell>
  );
}

function TermsPage({ lang }: { lang: 'id' | 'en' }) {
  return (
    <PageShell
      title={L({ id: 'Syarat & Ketentuan', en: 'Terms & Conditions' }, lang)}
      subtitle={L(
        { id: 'Ketentuan penggunaan website dan ketentuan transaksi PT Kompresa.', en: 'Website usage and transaction terms of PT Kompresa.' },
        lang
      )}
      icon={FileText}
    >
      <Section title={L({ id: '1. Umum', en: '1. General' }, lang)}>
        <p>
          {L(
            {
              id: 'Dengan mengakses website ini dan bertransaksi dengan PT Kompresa ("Kami"), Anda menyetujui Syarat & Ketentuan ini. Website ini dioperasikan dan dikelola oleh PT Kompresa, Bekasi, Indonesia.',
              en: 'By accessing this website and transacting with PT Kompresa ("we/us"), you agree to these Terms & Conditions. This website is operated and managed by PT Kompresa, Bekasi, Indonesia.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '2. Harga & Penawaran', en: '2. Pricing & Quotations' }, lang)}>
        <p>
          {L(
            {
              id: 'Harga yang tercantum adalah harga indikatif dan dapat berubah mengikuti harga distributor resmi tanpa pemberitahuan. Penawaran formal (quotation) berlaku 7 hari kalender sejak diterbitkan, kecuali dinyatakan lain.',
              en: 'Listed prices are indicative and may change following official distributor pricing without notice. Formal quotations are valid for 7 calendar days from issuance unless stated otherwise.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '3. Pesanan & Pembayaran', en: '3. Orders & Payment' }, lang)}>
        <p>
          {L(
            {
              id: 'Pesanan dianggap sah setelah konfirmasi ketersediaan stok dan pembayaran/DP diterima. Minimal order mengikuti ketentuan pada masing-masing produk. Pembayaran dilakukan melalui transfer bank ke rekening resmi perusahaan.',
              en: 'An order is considered valid once stock availability is confirmed and payment/down payment is received. Minimum order quantities follow each product\u2019s terms. Payments are made via bank transfer to the company\u2019s official account.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '4. Pengiriman', en: '4. Delivery' }, lang)}>
        <p>
          {L(
            {
              id: 'Risiko kerusakan selama pengiriman ditanggung bersama mitra ekspedisi. Mohon periksa kondisi unit saat diterima (video unboxing disarankan); klaim kerusakan pengiriman hanya diterima maksimal 2x24 jam setelah paket diterima.',
              en: 'Shipping damage risk is handled jointly with our logistics partners. Please inspect the unit upon arrival (unboxing video recommended); shipping damage claims are accepted within 2x24 hours after package receipt only.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '5. Garansi', en: '5. Warranty' }, lang)}>
        <p>
          {L(
            {
              id: 'Garansi resmi mengikuti ketentuan masing-masing brand dan berlaku untuk kerusakan pabrik (manufacture defects). Garansi tidak mencakup kerusakan akibat kelalaian penggunaan, tegangan listrik tidak stabil, bencana alam, atau pembongkaran oleh pihak tidak resmi.',
              en: 'Official warranties follow each brand\u2019s terms and cover manufacturing defects only. Warranty does not cover damage from user negligence, unstable electrical voltage, natural disasters, or unauthorized disassembly.',
            },
            lang
          )}
        </p>
      </Section>
      <Section title={L({ id: '6. Hak Kekayaan Intelektual', en: '6. Intellectual Property' }, lang)}>
        <p>
          {L(
            {
              id: 'Seluruh konten website ini (teks, logo, gambar produk) merupakan milik PT Kompresa atau pemilik hak terkait. Dilarang menyalin atau mendistribusikan tanpa izin tertulis. Website dikelola dengan sistem oleh PT Digital Bisnis Manajemen (digiman.id) dengan konsultan strategis PT Top Konsultan Internasional.',
              en: 'All content on this website (text, logo, product images) belongs to PT Kompresa or the respective rights holders. Copying or distribution without written permission is prohibited. This website is operated on a system by PT Digital Bisnis Manajemen (digiman.id) with strategic consulting from PT Top Konsultan Internasional.',
            },
            lang
          )}
        </p>
      </Section>
    </PageShell>
  );
}

/* ────────────────────────────── Export ────────────────────────────── */

export function InfoPages() {
  const lang = useLangStore((s) => s.lang);
  const route = useHashRoute();

  if (!route) return null;

  switch (route) {
    case 'tentang':
      return <AboutPage lang={lang} />;
    case 'layanan':
      return <ServicesPage lang={lang} />;
    case 'faq':
      return <FaqPage lang={lang} />;
    case 'privasi':
      return <PrivacyPage lang={lang} />;
    case 'syarat':
      return <TermsPage lang={lang} />;
    default:
      return null;
  }
}
