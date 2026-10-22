import { PGlite } from '@electric-sql/pglite';
const db = new PGlite('/home/z/my-project/db/pglite-data');
const cols = (await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name='site_settings'`)).rows.map(r=>r.column_name);
console.log('kolom:', cols.join(', '));
const before = (await db.query(`SELECT site_title FROM site_settings LIMIT 3`)).rows;
console.log('sebelum:', JSON.stringify(before));
const u = await db.query(`UPDATE site_settings SET site_title='KOMPRESA — Jual Kompresor AC & Spare Part Pendingin', site_description='Pusat Kompresor AC dan Spare Part Pendingin Indonesia. Periksa spesifikasi, kecocokan produk, harga, dan informasi pemesanan. Kirim ke 38 provinsi.' RETURNING site_title`);
console.log('updated:', u.rows.length, JSON.stringify(u.rows[0]));
await db.close();
