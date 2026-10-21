import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpenText, DatabaseBackup, FileText, Globe2, Images, LayoutDashboard, LogOut, PackageSearch, Settings2, Snowflake } from 'lucide-react';
import { getAdminUser, signOutAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const navigation = [
  { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Artikel', icon: FileText },
  { href: '/admin/products', label: 'Produk katalog', icon: PackageSearch },
  { href: '/admin/image-intelligence', label: 'Aset & hak gambar', icon: Images },
  { href: '/admin/backups', label: 'Cadangan CMS', icon: DatabaseBackup },
  { href: '/admin/settings', label: 'SEO website', icon: Settings2 },
  { href: '/admin/seo-guide', label: 'Panduan SEO', icon: BookOpenText },
];

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-slate-950 lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-900 text-white"><Snowflake aria-hidden="true" className="size-5" /></span>
          <span className="min-w-0"><span className="block text-sm font-semibold">Juragan CMS</span><span className="block text-xs text-muted-foreground">Editorial workspace</span></span>
        </div>
        <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-900">
              <Icon aria-hidden="true" className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden flex-1 lg:block" />
        <div className="hidden border-t border-border p-4 lg:block">
          <div className="truncate text-xs text-muted-foreground">Masuk sebagai</div>
          <div className="mt-1 truncate text-sm font-medium">{user.name || user.email}</div>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 lg:flex-col lg:items-stretch lg:gap-2">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><Globe2 aria-hidden="true" className="size-4" /> Lihat website</Link>
          <form action={signOutAction}>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><LogOut aria-hidden="true" className="size-4" /> Keluar</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
