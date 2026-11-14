import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';
import { ensureSchema, pool } from './db.js';

// Muat berkas .env secara otomatis jika ada
for (const envPath of ['.env', 'server/.env', path.join(import.meta.dirname, '../.env')]) {
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
      break;
    } catch {
      // Lanjutkan bila sudah termuat oleh Node
    }
  }
}

const port = Number(process.env.PORT || 3000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`\n==================================================`);
  console.log(`  Backend berjalan di http://localhost:${port}`);
  console.log(`  - Berita:  http://localhost:${port}/api/news`);
  console.log(`  - Anggota: http://localhost:${port}/api/members`);
  console.log(`  - Barang:  http://localhost:${port}/api/barang`);
  console.log(`==================================================\n`);
});

// Coba inisialisasi skema database tanpa mematikan proses jika MySQL offline
try {
  await ensureSchema();
  console.log('[db] Terhubung ke MySQL & skema database siap digunakan.');
} catch (error) {
  console.warn(`[db] PERINGATAN: Tidak dapat terhubung ke MySQL di ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
  console.warn(`[db] Detail: ${error.message}`);
  console.warn(`[db] CATATAN: Jika menggunakan Laragon / XAMPP, pastikan Anda telah menekan tombol "Start All" / menjalankan MySQL.`);
  console.warn(`[db] Server tetap aktif untuk fitur non-database (misal: endpoint Berita RSS).\n`);
}

async function shutdown(signal) {
  console.log(`\n${signal} diterima — menutup server...`);
  server.close(async () => {
    try {
      await pool.end();
    } catch {
      // Abaikan bila pool belum terhubung
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
