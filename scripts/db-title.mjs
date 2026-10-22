import { PGlite } from '@electric-sql/pglite';
const db = new PGlite('/home/z/my-project/db/pglite-data');
const r = await db.query(`SELECT id, site_title, site_description FROM site_settings LIMIT 5`);
console.log(JSON.stringify(r.rows));
const u = await db.query(`UPDATE site_settings SET site_title='KOMPRESA — Jual Kompresor AC & Spare Part Pendingin', site_description='Pusat Kompresor AC dan Spare Part Pendingin Indonesia. Periksa spesifikasi, kecocokan produk, harga, dan informasi pemesanan. Kirim ke 38 provinsi.' WHERE site_title='Kompresa' OR site_title LIKE '%KOMPRESA%' RETURNING id`);
console.log('updated:', u.rows.length);
await db.close();
