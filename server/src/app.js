
import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import Parser from 'rss-parser';

import { pool } from './db.js';

import {
  createBarangSchema,
  createMemberSchema,
  updateBarangSchema,
  updateMemberSchema,
} from './schema.js';

// ======================================================
// KONFIGURASI APLIKASI
// ======================================================

const COLUMNS =
  'id, nama_lengkap, email, posisi, status, rating, avatar, bio';

const BARANG_COLUMNS =
  'b.id, b.nama, b.kategori_id, k.nama AS kategori, b.stok';

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    namaLengkap: row.nama_lengkap,
    email: row.email,
    posisi: row.posisi,
    status: row.status,
    rating: row.rating,
    avatar: row.avatar,
    bio: row.bio,
  };
}

function mapBarangRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    nama: row.nama,
    kategoriId: row.kategori_id,
    kategori: row.kategori,
    stok: row.stok,
  };
}




const NEWS_CACHE_TTL_MS = 5 * 60 * 1000;

const rssParser = new Parser();

const NEWS_SOURCES = {
  cnn: {
    label: 'CNN Indonesia',
    urls: [
      'https://www.cnnindonesia.com/rss',
    ],
  },

  kompas: {
    label: 'Kompas',
    urls: [
      'https://www.kompas.com/sitemap-news-tren.xml',
      'https://money.kompas.com/sitemap.xml',
      'https://news.google.com/rss/search?q=site%3Akompas.com&hl=id&gl=ID&ceid=ID%3Aid',
      'https://news.google.com/rss/search?q=site%3Akompas.id&hl=id&gl=ID&ceid=ID%3Aid',
    ],
  },
};

const newsCache = {};

const DEFAULT_NEWS_IMAGES = [
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
];

function getFallbackImage(title) {
  let hash = 0;
  for (let i = 0; i < (title || '').length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_NEWS_IMAGES.length;
  return DEFAULT_NEWS_IMAGES[index];
}

function parseSitemapXml(xml) {
  const items = [];
  const urlRegex = /<url>([\s\S]*?)<\/url>/gi;
  let match;

  while ((match = urlRegex.exec(xml)) !== null && items.length < 30) {
    const block = match[1];
    const locMatch = block.match(/<loc>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/loc>/i);
    const titleMatch = block.match(/<news:title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/news:title>/i);
    const pubDateMatch = block.match(/<news:publication_date>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/news:publication_date>/i);
    const imageMatch = block.match(/<image:loc>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/image:loc>/i);

    const link = locMatch?.[1]?.trim();
    const title = titleMatch?.[1]?.trim();
    if (link && title) {
      items.push({
        title,
        link,
        isoDate: pubDateMatch?.[1]?.trim() || new Date().toISOString(),
        image: imageMatch?.[1]?.trim() ? { url: imageMatch[1].trim() } : null,
        description: 'Buka artikel untuk membaca berita selengkapnya dari Kompas.',
      });
    }
  }

  return { items };
}



// ======================================================
// NORMALISASI BERITA RSS
// ======================================================

function normalizeHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function normalizeNewsItem(item, sourceLabel) {
  const link = normalizeHttpUrl(item?.link);

  if (!item?.title || !link) {
    return null;
  }

  const content = [
    item['content:encoded'],
    item.content,
    item.contentSnippet,
    item.description,
    item.summary,
  ]
    .filter(Boolean)
    .join(' ');

  const imageMatch = content.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  const rawImageUrl =
    item.enclosure?.url ||
    imageMatch?.[1] ||
    item.image?.url ||
    null;

  const imageUrl = normalizeHttpUrl(rawImageUrl) || getFallbackImage(item.title);

  const publishedAt = item.isoDate || item.pubDate || null;
  const parsedDate = publishedAt ? new Date(publishedAt) : null;

  const date =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(parsedDate)
      : 'Tanggal tidak tersedia';

  const description = String(
    item.contentSnippet ||
      item.summary ||
      item.description ||
      'Buka artikel untuk membaca berita selengkapnya.'
  )
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    id: item.guid || link,
    title: item.title,
    description,
    image: imageUrl,
    link,
    url: link,
    source: sourceLabel,
    category: sourceLabel,
    publishedAt,
    date,
  };
}

// ======================================================
// MENGAMBIL RSS BERITA
// ======================================================

async function readNewsFeed(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
      'User-Agent': 'Mozilla/5.0 (compatible; DirektoriTim/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const xml = await response.text();

  if (!xml.trim().startsWith('<')) {
    throw new Error('Respons sumber bukan XML RSS yang valid.');
  }

  if (xml.includes('<urlset')) {
    return parseSitemapXml(xml);
  }

  return rssParser.parseString(xml);
}

async function fetchNewsFromSource(source) {
  const config = NEWS_SOURCES[source];

  if (!config) {
    throw new Error('Sumber berita tidak dikenal.');
  }

  const now = Date.now();
  const cached = newsCache[source];

  if (cached?.data?.length && now < cached.expiresAt) {
    return {
      articles: cached.data,
      updatedAt: cached.updatedAt,
      cached: true,
    };
  }

  let lastError;

  for (const url of config.urls) {
    try {
      console.log(`[server] Mengambil berita ${config.label}: ${url}`);

      const feed = await readNewsFeed(url);

      const articles = (feed.items || [])
        .map((item) => normalizeNewsItem(item, config.label))
        .filter(Boolean)
        .slice(0, 30);

      if (articles.length === 0) {
        throw new Error('Feed tidak berisi artikel yang valid.');
      }

      const result = {
        data: articles,
        updatedAt: new Date().toISOString(),
        expiresAt: Date.now() + NEWS_CACHE_TTL_MS,
      };

      newsCache[source] = result;

      console.log(
        `[server] Berhasil mengambil ${articles.length} berita ${config.label}.`
      );

      return {
        articles: result.data,
        updatedAt: result.updatedAt,
        cached: false,
      };
    } catch (error) {
      lastError = error;

      console.warn(
        `[server] Gagal mengambil ${config.label} dari ${url}: ${error.message}`
      );
    }
  }

  if (cached?.data?.length) {
    return {
      articles: cached.data,
      updatedAt: cached.updatedAt,
      cached: true,
      warning: 'Sumber berita sedang bermasalah. Menampilkan berita tersimpan.',
    };
  }

  throw lastError || new Error('Semua sumber berita gagal diakses.');
}


// ======================================================
// VALIDASI ID
// ======================================================

function parseId(value) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

// ======================================================
// HELPER DATABASE BARANG
// ======================================================

async function findBarangById(id) {
  const [rows] = await pool.query(
    `SELECT ${BARANG_COLUMNS}
     FROM barang b
     JOIN kategori k ON k.id = b.kategori_id
     WHERE b.id = ?`,
    [id]
  );

  return rows.length > 0
    ? mapBarangRow(rows[0])
    : null;
}

async function kategoriExists(id) {
  const [rows] = await pool.query(
    'SELECT id FROM kategori WHERE id = ?',
    [id]
  );

  return rows.length > 0;
}

// ======================================================
// HELPER ERROR DAN VALIDASI
// ======================================================

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function validate(schema, body) {
  const result = schema.safeParse(body);

  if (result.success) {
    return {
      data: result.data,
    };
  }

  const errors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (
      field !== undefined &&
      errors[field] === undefined
    ) {
      errors[field] = issue.message;
    }
  }

  return {
    errors,
    message: result.error.issues[0].message,
  };
}

// ======================================================
// MEMBUAT APLIKASI EXPRESS
// ======================================================

export function createApp() {
  const app = express();

  // ----------------------------------------------------
  // MIDDLEWARE
  // ----------------------------------------------------

  const allowedOrigins = (
    process.env.CORS_ORIGIN ??
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin: allowedOrigins,
  }));

  app.use(express.json());

  // ----------------------------------------------------
  // HEALTH CHECK
  // ----------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Backend Direktori Tim berjalan.',
      timestamp: new Date().toISOString(),
    });
  });

  // ====================================================
  // API ANGGOTA TIM
  // ====================================================

  // Menampilkan semua anggota.
  app.get(
    '/api/members',
    asyncHandler(async (req, res) => {
      const [rows] = await pool.query(
        `SELECT ${COLUMNS}
         FROM members
         ORDER BY created_at ASC, id ASC`
      );

      res.json(rows.map(mapRow));
    })
  );

  // Menambahkan anggota.
  app.post(
    '/api/members',
    asyncHandler(async (req, res) => {
      const parsed = validate(
        createMemberSchema,
        req.body
      );

      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      const id = randomUUID();

      const member = {
        id,
        ...parsed.data,
        status: 'Online',
        rating: 0,
        avatar: `https://i.pravatar.cc/150?u=${id}`,
        bio: parsed.data.bio,
      };

      await pool.query(
        `INSERT INTO members
         (id, nama_lengkap, email, posisi, status, rating, avatar, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          member.id,
          member.namaLengkap,
          member.email,
          member.posisi,
          member.status,
          member.rating,
          member.avatar,
          member.bio,
        ]
      );

      res.status(201).json(member);
    })
  );

  // Mengubah anggota.
  app.put(
    '/api/members/:id',
    asyncHandler(async (req, res) => {
      const parsed = validate(
        updateMemberSchema,
        req.body
      );

      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      const columnByField = {
        namaLengkap: 'nama_lengkap',
        email: 'email',
        posisi: 'posisi',
        status: 'status',
        rating: 'rating',
        bio: 'bio',
      };

      const assignments = [];
      const values = [];

      for (const [field, column] of Object.entries(
        columnByField
      )) {
        if (parsed.data[field] !== undefined) {
          assignments.push(`${column} = ?`);
          values.push(parsed.data[field]);
        }
      }

      const [existingRows] = await pool.query(
        `SELECT ${COLUMNS}
         FROM members
         WHERE id = ?`,
        [req.params.id]
      );

      if (existingRows.length === 0) {
        return res.status(404).json({
          message: 'Anggota tim tidak ditemukan',
        });
      }

      if (assignments.length > 0) {
        await pool.query(
          `UPDATE members
           SET ${assignments.join(', ')}
           WHERE id = ?`,
          [...values, req.params.id]
        );
      }

      const [rows] = await pool.query(
        `SELECT ${COLUMNS}
         FROM members
         WHERE id = ?`,
        [req.params.id]
      );

      res.json(mapRow(rows[0]));
    })
  );

  // Menghapus anggota.
  app.delete(
    '/api/members/:id',
    asyncHandler(async (req, res) => {
      const [result] = await pool.query(
        'DELETE FROM members WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Anggota tim tidak ditemukan',
        });
      }

      res.status(204).end();
    })
  );

  // ====================================================
  // API KATEGORI
  // ====================================================

  app.get(
    '/api/kategori',
    asyncHandler(async (req, res) => {
      const [rows] = await pool.query(
        'SELECT id, nama FROM kategori ORDER BY nama ASC'
      );

      res.json(rows);
    })
  );

  // ====================================================
  // API BARANG
  // ====================================================

  // Menampilkan semua barang.
  app.get(
    '/api/barang',
    asyncHandler(async (req, res) => {
      const [rows] = await pool.query(
        `SELECT ${BARANG_COLUMNS}
         FROM barang b
         JOIN kategori k ON k.id = b.kategori_id
         ORDER BY b.id ASC`
      );

      res.json(rows.map(mapBarangRow));
    })
  );

  // Menampilkan barang berdasarkan ID.
  app.get(
    '/api/barang/:id',
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message:
            'ID barang harus berupa angka positif',
        });
      }

      const barang = await findBarangById(id);

      if (!barang) {
        return res.status(404).json({
          message: 'Barang tidak ditemukan',
        });
      }

      res.json(barang);
    })
  );

  // Menambahkan barang.
  app.post(
    '/api/barang',
    asyncHandler(async (req, res) => {
      const parsed = validate(
        createBarangSchema,
        req.body
      );

      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      if (
        !(await kategoriExists(
          parsed.data.kategoriId
        ))
      ) {
        return res.status(400).json({
          message: 'Kategori tidak ditemukan',
          errors: {
            kategoriId: 'Kategori tidak ditemukan',
          },
        });
      }

      const [result] = await pool.query(
        `INSERT INTO barang
         (nama, kategori_id, stok)
         VALUES (?, ?, ?)`,
        [
          parsed.data.nama,
          parsed.data.kategoriId,
          parsed.data.stok,
        ]
      );

      res.status(201).json(
        await findBarangById(result.insertId)
      );
    })
  );

  // Mengubah barang: PUT dan PATCH.
  const updateBarang = asyncHandler(
    async (req, res) => {
      const id = parseId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message:
            'ID barang harus berupa angka positif',
        });
      }

      const parsed = validate(
        updateBarangSchema,
        req.body
      );

      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      const existing = await findBarangById(id);

      if (!existing) {
        return res.status(404).json({
          message: 'Barang tidak ditemukan',
        });
      }

      if (
        parsed.data.kategoriId !== undefined &&
        !(await kategoriExists(
          parsed.data.kategoriId
        ))
      ) {
        return res.status(400).json({
          message: 'Kategori tidak ditemukan',
          errors: {
            kategoriId: 'Kategori tidak ditemukan',
          },
        });
      }

      const columnByField = {
        nama: 'nama',
        kategoriId: 'kategori_id',
        stok: 'stok',
      };

      const assignments = [];
      const values = [];

      for (const [field, column] of Object.entries(
        columnByField
      )) {
        if (parsed.data[field] !== undefined) {
          assignments.push(`${column} = ?`);
          values.push(parsed.data[field]);
        }
      }

      if (assignments.length > 0) {
        await pool.query(
          `UPDATE barang
           SET ${assignments.join(', ')}
           WHERE id = ?`,
          [...values, id]
        );
      }

      res.json(await findBarangById(id));
    }
  );

  app.put('/api/barang/:id', updateBarang);
  app.patch('/api/barang/:id', updateBarang);

  // Menghapus barang.
  app.delete(
    '/api/barang/:id',
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message:
            'ID barang harus berupa angka positif',
        });
      }

      const [result] = await pool.query(
        'DELETE FROM barang WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Barang tidak ditemukan',
        });
      }

      res.status(204).end();
    })
  );

  // ====================================================
  // API BERITA CNN INDONESIA DAN KOMPAS
  // ====================================================

  const handleNewsRequest = asyncHandler(
    async (req, res) => {
      const source = String(
        req.params.source ||
          req.query.source ||
          'cnn'
      ).toLowerCase();

      if (!Object.hasOwn(NEWS_SOURCES, source)) {
        return res.status(400).json({
          success: false,
          message:
            'Sumber berita tidak dikenal. Gunakan cnn atau kompas.',
          articles: [],
        });
      }

      try {
        const result = await fetchNewsFromSource(
          source
        );

        return res.json({
          success: true,
          source: NEWS_SOURCES[source].label,
          updatedAt: result.updatedAt,
          cached: result.cached,
          warning: result.warning || null,
          articles: result.articles,
        });
      } catch (error) {
        console.error(
          `[server] Berita ${NEWS_SOURCES[source].label} gagal:`,
          error.message
        );

        return res.status(502).json({
          success: false,
          message:
            `Berita ${NEWS_SOURCES[source].label} sementara tidak tersedia.`,
          articles: [],
        });
      }
    }
  );

  // Mendukung dua format URL agar kompatibel
  // dengan frontend lama maupun frontend baru.
  app.get('/api/news', handleNewsRequest);
  app.get('/api/news/:source', handleNewsRequest);

  // ====================================================
  // ROUTE TIDAK DITEMUKAN
  // ====================================================

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint tidak ditemukan',
    });
  });

  // ====================================================
  // PENANGANAN ERROR
  // ====================================================

  // Express hanya mengenali middleware error lewat parameter keempat.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        message: 'Body JSON tidak valid',
      });
    }

    if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'EACCES' ||
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ER_ACCESS_DENIED_ERROR'
    ) {
      console.error('[server] Koneksi database MySQL bermasalah:', err.message);
      return res.status(503).json({
        success: false,
        message:
          'Koneksi database MySQL gagal. Pastikan service MySQL/Laragon sudah dijalankan pada port 3306.',
      });
    }

    console.error(
      '[server] Kesalahan tak terduga:',
      err
    );

    res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  });

  return app;
}

export default createApp;

