
const express = require("express");
const Parser = require("rss-parser");

const router = express.Router();
const parser = new Parser();

const RSS_URL = "https://www.kompas.com/getrss/all";
const CACHE_DURATION = 5 * 60 * 1000;

let cachedArticles = [];
let lastUpdated = null;
let lastFetchTime = 0;

function cleanText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getImage(item) {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  const html =
    item["content:encoded"] ||
    item.content ||
    item.description ||
    "";

  const match = html.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  return match ? match[1] : null;
}

function formatArticle(item, index) {
  const title = cleanText(item.title || "Tanpa judul");
  const link = item.link || "";

  return {
    id: link || `${title}-${index}`,
    title,
    description: cleanText(
      item.contentSnippet ||
      item.summary ||
      item.content ||
      item.description ||
      "Buka artikel untuk membaca berita selengkapnya."
    ),
    link,
    image: getImage(item),
    publishedAt: item.isoDate || item.pubDate || null,
    source: "Kompas.com",
  };
}

// GET /api/news/kompas
router.get("/kompas", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const now = Date.now();

  // Gunakan cache selama 5 menit.
  if (
    cachedArticles.length > 0 &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return res.json({
      success: true,
      source: "Kompas.com",
      updatedAt: lastUpdated,
      cached: true,
      articles: cachedArticles,
    });
  }

  try {
    const response = await fetch(RSS_URL, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsReader/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS Kompas merespons HTTP ${response.status}`);
    }

    const xml = await response.text();

    if (!xml.trim().startsWith("<")) {
      throw new Error("Sumber Kompas tidak mengirimkan XML RSS.");
    }

    const feed = await parser.parseString(xml);

    const articles = (feed.items || [])
      .filter((item) => item.title && item.link)
      .map(formatArticle)
      .filter((item) => item.link.startsWith("http"))
      .slice(0, 30);

    if (articles.length === 0) {
      throw new Error("Feed Kompas belum berisi artikel yang valid.");
    }

    cachedArticles = articles;
    lastUpdated = new Date().toISOString();
    lastFetchTime = Date.now();

    return res.json({
      success: true,
      source: "Kompas.com",
      updatedAt: lastUpdated,
      cached: false,
      articles,
    });
  } catch (error) {
    console.error("Gagal mengambil berita Kompas:", error.message);

    // Jika sumber berita sementara gagal, tampilkan cache
    // sebelumnya daripada langsung mengosongkan halaman.
    if (cachedArticles.length > 0) {
      return res.json({
        success: true,
        source: "Kompas.com",
        updatedAt: lastUpdated,
        cached: true,
        warning: "Sumber berita sedang sulit diakses.",
        articles: cachedArticles,
      });
    }

    return res.status(502).json({
      success: false,
      message: "Berita Kompas tidak dapat diambil saat ini.",
      detail: error.message,
      articles: [],
    });
  }
});

module.exports = router;
