
import { useCallback, useEffect, useState } from "react";
import "./NewsPage.css";

const SOURCES = {
  cnn: "CNN Indonesia",
  kompas: "Kompas.com",
};

const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80";

const API_BASE =
  import.meta.env.VITE_API_URL || "/api";

function formatDate(date) {
  if (!date) return "Tanggal tidak tersedia";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return value.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NewsPage() {
  const [source, setSource] = useState("cnn");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [cached, setCached] = useState(false);

  const loadNewsData = useCallback(
    async (manual = false) => {
      try {
        const response = await fetch(
          `${API_BASE}/news/${source}`,
          {
            headers: { Accept: "application/json" },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Respons backend bukan JSON. Periksa konfigurasi server."
          );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Permintaan gagal: HTTP ${response.status}`
          );
        }

        if (!Array.isArray(data.articles)) {
          throw new Error("Format daftar berita tidak valid.");
        }

        setArticles(data.articles);
        setUpdatedAt(data.updatedAt || null);
        setCached(Boolean(data.cached));
        setError(data.warning || "");
      } catch (err) {
        console.error("Gagal memuat berita:", err);

        setError(
          err.name === "TypeError"
            ? "Backend tidak terhubung. Pastikan server berjalan pada port yang benar."
            : err.message || "Berita gagal dimuat."
        );
      } finally {
        setLoading(false);
        if (manual) {
          setRefreshing(false);
        }
      }
    },
    [source]
  );

  useEffect(() => {
    let ignore = false;

    async function initialLoad() {
      try {
        const response = await fetch(
          `${API_BASE}/news/${source}`,
          {
            headers: { Accept: "application/json" },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Respons backend bukan JSON. Periksa konfigurasi server."
          );
        }

        const data = await response.json();

        if (ignore) return;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Permintaan gagal: HTTP ${response.status}`
          );
        }

        if (!Array.isArray(data.articles)) {
          throw new Error("Format daftar berita tidak valid.");
        }

        setArticles(data.articles);
        setUpdatedAt(data.updatedAt || null);
        setCached(Boolean(data.cached));
        setError(data.warning || "");
      } catch (err) {
        if (ignore) return;
        console.error("Gagal memuat berita:", err);

        setError(
          err.name === "TypeError"
            ? "Backend tidak terhubung. Pastikan server berjalan pada port yang benar."
            : err.message || "Berita gagal dimuat."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    const timer = setInterval(() => {
      loadNewsData(false);
    }, 5 * 60 * 1000);

    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [source, loadNewsData]);

  function changeSource(nextSource) {
    if (nextSource !== source) {
      setLoading(true);
      setArticles([]);
      setUpdatedAt(null);
      setCached(false);
      setError("");
      setSource(nextSource);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    setError("");
    loadNewsData(true);
  }

  return (
    <main className="news-page">
      <header className="news-header">
        <div className="news-heading-copy">
          <span className="news-eyebrow">
            INFORMASI DAN BERITA
          </span>
          <h1>Berita Terkini</h1>
          <p>
            Ikuti kabar terbaru langsung dari portal berita pilihan.
          </p>
        </div>

        <button
          className="news-refresh"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          type="button"
        >
          <span aria-hidden="true">↻</span>
          {refreshing ? "Memuat..." : "Segarkan Berita"}
        </button>
      </header>

      <nav className="news-source-tabs" aria-label="Sumber berita">
        <button
          type="button"
          className={
            source === "cnn" ? "news-tab active" : "news-tab"
          }
          aria-pressed={source === "cnn"}
          onClick={() => changeSource("cnn")}
        >
          CNN Indonesia
        </button>

        <button
          type="button"
          className={
            source === "kompas" ? "news-tab active" : "news-tab"
          }
          aria-pressed={source === "kompas"}
          onClick={() => changeSource("kompas")}
        >
          Kompas
        </button>
      </nav>

      <div className="news-live-status">
        <span className="news-live-dot" />
        <strong>{SOURCES[source]}</strong>
        <span>•</span>
        <span>Pembaruan otomatis setiap 5 menit</span>
      </div>

      {updatedAt && (
        <p className="news-updated">
          Diperbarui: {formatDate(updatedAt)}
          {cached ? " · Data cache" : ""}
        </p>
      )}

      {error && (
        <div className="news-error" role="alert">
          <strong>Pemberitahuan</strong>
          <p>{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading && articles.length === 0 && (
        <div className="news-loading">
          <div className="news-spinner" />
          <p>Mengambil berita dari {SOURCES[source]}...</p>
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="news-empty">
          <div className="news-empty-icon">📰</div>
          <h2>Berita belum tersedia</h2>
          <p>
            Feed berita belum dapat diakses. Periksa backend
            dan koneksi internet, lalu coba lagi.
          </p>
          <button
            type="button"
            className="news-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Coba Ambil Ulang
          </button>
        </div>
      )}

      {articles.length > 0 && (
        <section className="news-grid" aria-label="Berita terbaru">
          {articles.map((article) => (
            <article
              className="news-card"
              key={article.id || article.link}
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-image-link"
                aria-label={`Baca ${article.title}`}
              >
                <img
                  className="news-image"
                  src={article.image || DEFAULT_NEWS_IMAGE}
                  alt={article.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_NEWS_IMAGE;
                  }}
                />
              </a>

              <div className="news-card-content">
                <div className="news-meta">
                  <span className="news-source-label">
                    {article.source || SOURCES[source]}
                  </span>
                  <time>
                    {formatDate(article.publishedAt)}
                  </time>
                </div>

                <h2>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                </h2>

                <p className="news-description">
                  {article.description ||
                    "Buka artikel untuk membaca berita selengkapnya."}
                </p>

                <a
                  className="news-read-more"
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Baca berita selengkapnya →
                </a>
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="news-footer">
        <p>
          Berita bersumber dari{" "}
          <a
            href={
              source === "cnn"
                ? "https://www.cnnindonesia.com/"
                : "https://www.kompas.com/"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {SOURCES[source]}
          </a>
          .
        </p>
        <p>
          Judul dan ringkasan ditampilkan dari feed sumber.
          Klik artikel untuk membaca berita lengkap.
        </p>
      </footer>
    </main>
  );
}
