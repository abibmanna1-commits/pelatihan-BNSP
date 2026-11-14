
const express = require("express");
const Parser = require("rss-parser");

const router = express.Router();
const parser = new Parser();

const FEEDS = {
  cnn: {
    name: "CNN Indonesia",
    urls: ["https://www.cnnindonesia.com/rss"],
  },
  kompas: {
    name: "Kompas.com",
    urls: [
      "https://www.kompas.com/rss",
      "https://www.kompas.com/getrss/all",
    ],
  },
};

const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000;

function cleanText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getImage(item) {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  const html = [
    item["content:encoded"],
    item.content,
    item.description,
    item.summary,
  ].filter(Boolean).join(" ");

  const match = html.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  return match ? match[1] : null;
}

function normalizeArticle(item, index, source) {
  const link = item.link || "";
  const title = cleanText(item.title || "");

  if (!title || !/^https?:\/\//i.test(link)) {
    return null;
  }

  const image = getImage(item);

  return {
    id: `${source}-${link || index}`,
    title,
    description: cleanText(
      item.contentSnippet ||
      item.summary ||
      item.description ||
      item.content ||
      "Buka artikel untuk membaca berita selengkapnya."
    ),
    link,
    image: image && /^https?:\/\//i.test(image)
      ? image
      : null,
    publishedAt: item.isoDate || item.pubDate || null,
    source: FEEDS[source].name,
  };
}

async function readFeed(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NewsReader/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} dari ${url}`);
  }

  const xml = await response.text();

  if (!xml.trim().startsWith("<")) {
    throw new Error("Sumber tidak mengirimkan XML RSS.");
  }

  return parser.parseString(xml);
}

router.get("/:source", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const source = String(req.params.source).toLowerCase();

  if (!FEEDS[source]) {
    return res.status(400).json({
      success: false,
      message: "Sumber berita tidak dikenal.",
      articles: [],
    });
  }

  const now = Date.now();
  const cached = cache.get(source);

  if (cached && now - cached.time < CACHE_TIME) {
    return res.json({
      success: true,
      source: FEEDS[source].name,
      updatedAt: cached.updatedAt,
      cached: true,
      articles: cached.articles,
    });
  }

  let lastError;

  for (const url of FEEDS[source].urls) {
    try {
      const feed = await readFeed(url);

      const articles = (feed.items || [])
        .map((item, index) =>
          normalizeArticle(item, index, source)
        )
        .filter(Boolean)
        .slice(0, 30);

      if (articles.length === 0) {
        throw new Error("Feed tidak berisi artikel yang valid.");
      }

      const result = {
        time: Date.now(),
        updatedAt: new Date().toISOString(),
        articles,
      };

      cache.set(source, result);

      return res.json({
        success: true,
        source: FEEDS[source].name,
        updatedAt: result.updatedAt,
        cached: false,
        articles,
      });
    } catch (error) {
      lastError = error;
      console.error(
        `Gagal mengambil ${FEEDS[source].name} dari ${url}:`,
        error.message
      );
    }
  }

  // Gunakan cache lama jika feed sedang bermasalah.
  if (cached?.articles?.length) {
    return res.json({
      success: true,
      source: FEEDS[source].name,
      updatedAt: cached.updatedAt,
      cached: true,
      warning: "Feed sedang bermasalah. Menampilkan berita tersimpan.",
      articles: cached.articles,
    });
  }

  return res.status(502).json({
    success: false,
    message: `Berita ${FEEDS[source].name} tidak dapat diambil.`,
    detail: lastError?.message || "Koneksi ke feed gagal.",
    articles: [],
  });
});

module.exports = router;
