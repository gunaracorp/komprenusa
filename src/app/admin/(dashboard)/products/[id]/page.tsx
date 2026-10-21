import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { updateCatalogProductAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAdminProduct } from '@/lib/cms-db';

export const metadata = { title: 'Kelola produk', robots: { index: false, follow: false } };
type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> };
type ProductSpecs = Record<string, string>;

function readSpecs(value: string | null): ProductSpecs {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as ProductSpecs : {};
  } catch {
    return {};
  }
}

export default async function AdminProductEditorPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const product = await getAdminProduct(id);
  if (!product) notFound();

  const specs = readSpecs(product.specifications);
  const sourceUrl = specs._sourceUrl;
  const sourceName = specs._sourceName || 'Sumber data produk';

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link href="/admin/products" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-teal-800"><ArrowLeft aria-hidden="true" className="size-4" /> Kembali ke katalog</Link>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Editor katalog</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{product.model || product.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Merek: {product.brand || '—'} · Harga 0 menampilkan tombol permintaan penawaran.</p>
      </header>

      {query.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Perubahan belum tersimpan. Periksa nilai harga, deskripsi, dan URL foto.</p>}
      {query.saved && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Produk berhasil diperbarui.</p>}

      <form action={updateCatalogProductAction} className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
        <input type="hidden" name="id" value={product.id} />
        <label className="flex flex-col gap-2 text-sm font-medium">
          Nama produk
          <Input name="name" required minLength={5} maxLength={180} defaultValue={product.name} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Deskripsi ringkas
          <Input name="shortDesc" maxLength={320} defaultValue={product.shortDesc || ''} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Deskripsi produk
          <Textarea name="description" required minLength={20} maxLength={5000} rows={6} defaultValue={product.description || ''} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Harga (rupiah)
            <Input name="price" type="number" min="0" max="1000000000000" step="1000" required defaultValue={product.price} />
            <span className="text-xs font-normal text-muted-foreground">Isi 0 bila harga belum dikonfirmasi.</span>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Visibilitas katalog
            <select name="visibility" defaultValue={product.inStock ? 'listed' : 'hidden'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="listed">Tampilkan di katalog</option>
              <option value="hidden">Sembunyikan dari katalog</option>
            </select>
            <span className="text-xs font-normal text-muted-foreground">Status ini mengatur publikasi, bukan jaminan stok fisik.</span>
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          URL foto produk
          <Input name="images" type="url" inputMode="url" maxLength={2048} defaultValue={product.images || ''} placeholder="https://..." />
          <span className="text-xs font-normal text-muted-foreground">Gunakan URL HTTPS untuk foto model yang benar.</span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Produk unggulan
          <select name="featured" defaultValue={product.isFeatured ? 'yes' : 'no'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="no">Tidak</option>
            <option value="yes">Tampilkan sebagai unggulan</option>
          </select>
        </label>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold">Data teknis dan sumber</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Atribut model dan spesifikasi sumber terkunci agar tidak tertimpa oleh perubahan harga atau konten.</p>
          {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-800 underline underline-offset-2">{sourceName}<ExternalLink aria-hidden="true" className="size-3.5" /></a>}
          {product.model && <p className="mt-3 text-xs text-muted-foreground">Model produsen: <span className="font-medium text-slate-900">{product.model}</span></p>}
        </section>

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          <Link href={`/produk/${product.slug}`} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-teal-800">Lihat halaman publik <ExternalLink aria-hidden="true" className="size-4" /></Link>
          <Button type="submit" className="h-11 bg-teal-900 px-5 text-white hover:bg-teal-800">Simpan perubahan</Button>
        </div>
      </form>
    </div>
  );
}
