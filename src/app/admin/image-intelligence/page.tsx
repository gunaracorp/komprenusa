import type { Metadata } from 'next';
import { CheckCircle2, FileImage, FolderSync, Images, Scale, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import {
  getDropboxStatusForAdmin,
  getProductImageIntelligenceOverview,
  PRODUCT_IMAGE_EXPERT_COUNCIL,
  PRODUCT_IMAGE_REVIEW_STATUSES,
  type ProductImageReviewStatus,
} from '@/lib/product-image-intelligence';
import { disconnectDropboxAction, processProductImageBatchAction, saveProductImageReviewAction, syncDropboxBatchAction } from './actions';
import { DropboxControls } from './dropbox-controls';

export const metadata: Metadata = {
  title: 'Aset & hak gambar | Juragan CMS',
  robots: { index: false, follow: false },
};

export const runtime = 'nodejs';
export const maxDuration = 60;

const statusLabels: Record<ProductImageReviewStatus, string> = {
  PENDING_REVIEW: 'Perlu ditinjau',
  OWNED: 'Milik perusahaan',
  LICENSED: 'Berlisensi',
  SUPPLIER_AUTHORIZED: 'Diizinkan pemasok',
  MANUFACTURER_AUTHORIZED: 'Diizinkan produsen',
  PARTNER_AUTHORIZED: 'Diizinkan partner',
  PUBLIC_REUSE_PERMITTED: 'Diizinkan untuk digunakan ulang',
  REJECTED: 'Jangan digunakan',
};

const approvedStatuses = new Set<ProductImageReviewStatus>([
  'OWNED',
  'LICENSED',
  'SUPPLIER_AUTHORIZED',
  'MANUFACTURER_AUTHORIZED',
  'PARTNER_AUTHORIZED',
  'PUBLIC_REUSE_PERMITTED',
]);

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value / 1024;
  let unit = units[0];
  for (let index = 1; size >= 1024 && index < units.length; index += 1) {
    size /= 1024;
    unit = units[index];
  }
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(size)} ${unit}`;
}

function formatDate(value: Date | null) {
  if (!value) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(value);
}

export default async function ProductImageIntelligencePage({
  searchParams,
}: {
    searchParams: Promise<{
      error?: string;
      synced?: string;
      hasMore?: string;
      scanned?: string;
      images?: string;
      reviewed?: string;
      disconnected?: string;
      processed?: string;
      attempted?: string;
      completed?: string;
      duplicates?: string;
      failed?: string;
      invalid?: string;
      remaining?: string;
      folder?: string;
    }>;
}) {
  const [user, params] = await Promise.all([requireAdmin(), searchParams]);
  if (!user) redirect('/admin/login');
  const [connectionStatus, overview] = await Promise.all([
    getDropboxStatusForAdmin({ id: user.id }),
    getProductImageIntelligenceOverview(user.id),
  ]);
  const folderPath = params.folder?.slice(0, 500) || '/';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Katalog · sumber gambar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Product Image Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Indeks metadata gambar dari Dropbox, tinjau bukti hak penggunaan, lalu gunakan hanya aset yang telah disetujui.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900">
          <ShieldCheck aria-hidden="true" className="size-4" /> Foto produk asli · tanpa generasi gambar
        </span>
      </header>

      {params.synced ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Batch selesai: {Number(params.scanned) || 0} entri diperiksa, {Number(params.images) || 0} gambar ditemukan.{params.hasMore === '1' ? ' Masih ada batch berikutnya; jalankan sinkronisasi lagi.' : ' Semua perubahan saat ini sudah terindeks.'}</p> : null}
      {params.processed ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">Batch pemrosesan: {Number(params.attempted) || 0} dicoba, {Number(params.completed) || 0} diproses, {Number(params.duplicates) || 0} duplikat, {Number(params.failed) || 0} gagal, {Number(params.invalid) || 0} tidak valid. Sisa siap proses: {Number(params.remaining) || 0}.{Number(params.remaining) > 0 ? ' Jalankan batch berikutnya untuk melanjutkan.' : ''}</p> : null}
      {params.reviewed ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Tinjauan hak penggunaan berhasil disimpan.</p> : null}
      {params.disconnected ? <p role="status" className="rounded-xl border border-border bg-white p-3 text-sm">Akses Dropbox telah dicabut untuk akun admin ini.</p> : null}
      {params.error === 'sync' ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Sinkronisasi gagal. Pastikan Dropbox terhubung dan folder dapat diakses.</p> : null}
      {params.error === 'process' ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Batch tidak dapat diproses. Periksa koneksi Dropbox, izin membaca konten file, dan konfigurasi Blob lalu coba lagi.</p> : null}
      {params.error === 'review' ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Tinjauan belum tersimpan. Untuk menyetujui gambar, isi bukti hak penggunaan minimal 20 karakter.</p> : null}
      {params.error === 'withdraw' ? <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">Status hak sudah diperbarui, tetapi penarikan salinan publik belum selesai. Simpan ulang tinjauan aset ini untuk mengulang pencabutan.</p> : null}
      {params.error === 'disconnect' ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Akses Dropbox belum dapat dicabut. Coba lagi.</p> : null}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan aset gambar">
        {[
          { label: 'Total terindeks', value: overview.stats.total, icon: Images },
          { label: 'Menunggu tinjauan', value: overview.stats.pending, icon: FileImage },
          { label: 'Disetujui dengan bukti', value: overview.stats.approved, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon aria-hidden="true" className="size-5 text-teal-800" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{value.toLocaleString('id-ID')}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-900"><FolderSync aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 className="font-semibold">Sumber Dropbox</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Dropbox tetap menjadi arsip file asli. Aplikasi hanya mengindeks metadata ke database agar folder besar diproses bertahap.</p>
            </div>
          </div>
          <div className="mt-5"><DropboxControls status={connectionStatus} /></div>
          {connectionStatus === 'connected' ? (
            <div className="mt-5 border-t border-border pt-5">
              <form action={syncDropboxBatchAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium" htmlFor="dropbox-folder">
                  Path folder Dropbox
                  <input
                    id="dropbox-folder"
                    name="folderPath"
                    maxLength={500}
                    defaultValue={folderPath}
                    placeholder="/Katalog/Produk"
                    className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-xs font-normal text-muted-foreground">Gunakan / untuk seluruh Dropbox atau masukkan folder tertentu.</span>
                </label>
                <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
                  Sinkronkan satu batch
                </button>
              </form>
              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
                <h3 className="font-semibold">Pemrosesan katalog</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Satu eksekusi menangani maksimal 10 gambar yang telah disetujui, memvalidasi file, membuat hash dan watermark katalog, lalu menyimpan hasil publik ke Blob. Master Dropbox tidak diubah.</p>
                <p className="mt-2 text-xs text-muted-foreground">Siap diproses: {overview.stats.ready.toLocaleString('id-ID')} · Gagal yang dapat dicoba ulang: {overview.stats.retryable.toLocaleString('id-ID')} · Selesai: {overview.stats.processed.toLocaleString('id-ID')} · Duplikat: {overview.stats.duplicates.toLocaleString('id-ID')}</p>
                {overview.stats.ready > 0 ? (
                  <form action={processProductImageBatchAction} className="mt-3">
                    <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-900 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Proses batch berikutnya (maks. 10)</button>
                  </form>
                ) : null}
                {overview.stats.retryable > 0 ? (
                  <form action={processProductImageBatchAction} className="mt-2">
                    <input type="hidden" name="retryFailed" value="1" />
                    <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-teal-900 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Coba ulang batch gagal</button>
                  </form>
                ) : null}
              </div>
              <form action={disconnectDropboxAction} className="mt-4">
                <button type="submit" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">Cabut koneksi Dropbox</button>
              </form>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900"><Scale aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 className="font-semibold">Gerbang hak penggunaan</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Persetujuan memerlukan bukti kepemilikan, lisensi, atau izin pemasok/partner. Nama file saja bukan bukti izin.</p>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm leading-6 text-muted-foreground">
            {PRODUCT_IMAGE_EXPERT_COUNCIL.length} disiplin pemeriksaan tercakup dalam kerangka kerja. Aset tanpa persetujuan dan dasar hak minimal 20 karakter tidak masuk batch publikasi. Pencocokan produk hanya dilakukan bila nama file sama persis dengan slug produk dan gambar produk masih kosong.
          </p>
        </article>
      </section>

      <section aria-labelledby="assets-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="assets-heading" className="text-xl font-semibold tracking-tight">Antrean aset</h2><p className="text-sm text-muted-foreground">Metadata terbaru dari akun Dropbox admin yang sedang terhubung.</p></div>
          <p className="text-xs text-muted-foreground">Menampilkan maksimal {overview.assets.length} aset terbaru</p>
        </div>
        {overview.assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <FileImage aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Belum ada aset terindeks</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Hubungkan Dropbox lalu sinkronkan folder yang berisi foto produk. Berkas sumber tidak dipindahkan atau diubah.</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {overview.assets.map((asset) => {
              const status = asset.rightsStatus as ProductImageReviewStatus;
              const canUse = approvedStatuses.has(status);
              return (
                <article key={asset.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><FileImage aria-hidden="true" className="size-5" /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-all font-semibold">{asset.fileName}</h3>
                      <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">{asset.sourcePath}</p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{asset.mimeType}</span><span>{formatBytes(asset.sizeBytes)}</span><span>Diubah {formatDate(asset.sourceModifiedAt)}</span>
                        {asset.width && asset.height ? <span>{asset.width} × {asset.height}px</span> : null}
                        {asset.qualityScore !== null ? <span>Kualitas {Math.round(asset.qualityScore)}/100</span> : null}
                        <span>Proses: {asset.processingStatus}</span>
                      </div>
                      {asset.processingError ? <p className="mt-2 text-xs leading-5 text-destructive">{asset.processingError}</p> : null}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${canUse ? 'bg-emerald-50 text-emerald-900' : status === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-900'}`}>
                      {statusLabels[status] ?? 'Perlu ditinjau'}
                    </span>
                  </div>
                  <form action={saveProductImageReviewAction} className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
                    <input type="hidden" name="assetId" value={asset.id} />
                    <input type="hidden" name="folderPath" value={folderPath} />
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Status penggunaan
                      <select name="status" defaultValue={status} className="h-10 rounded-lg border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {PRODUCT_IMAGE_REVIEW_STATUSES.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Dasar hak / catatan review
                      <textarea name="rightsBasis" defaultValue={asset.rightsBasis} maxLength={2000} rows={2} placeholder="Contoh: surat izin penggunaan foto dari pemasok, nomor dokumen/tanggal…" className="resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                      <span className="text-xs font-normal text-muted-foreground">Minimal 20 karakter untuk status yang menyetujui penggunaan.</span>
                    </label>
                    <div><button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-teal-900 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Simpan tinjauan</button></div>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
