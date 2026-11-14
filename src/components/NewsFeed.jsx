import { useState, useEffect, useCallback } from 'react';
import NewsCard from './NewsCard';

const AUTO_REFRESH_MS = 5 * 60 * 1000;

const fallbackArticles = [
  {
    title: 'Perkembangan Teknologi AI Semakin Pesat di Berbagai Industri',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    category: 'CNN Indonesia',
    date: '12 November 2026',
    link: 'https://www.cnnindonesia.com/teknologi',
  },
  {
    title: 'Penguatan Keamanan Siber Menjadi Prioritas Perlindungan Data Pribadi',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    category: 'CNN Indonesia',
    date: '11 November 2026',
    link: 'https://www.cnnindonesia.com/nasional',
  },
  {
    title: 'Transformasi Digital di Dunia Pendidikan Membuka Akses Pembelajaran Interaktif',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    category: 'CNN Indonesia',
    date: '10 November 2026',
    link: 'https://www.cnnindonesia.com/edukasi',
  },
  {
    title: 'Inovasi Cloud Computing Permudah Akses dan Pengelolaan Data Skala Besar',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    category: 'CNN Indonesia',
    date: '9 November 2026',
    link: 'https://www.cnnindonesia.com/teknologi',
  },
  {
    title: 'Tren Kerja Kolaboratif Tim Developer Menggunakan Arsitektur Modern',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    category: 'CNN Indonesia',
    date: '8 November 2026',
    link: 'https://www.cnnindonesia.com/ekonomi',
  },
  {
    title: 'Perangkat Pintar Generasi Baru Hadirkan Fitur AI dan Efisiensi Tinggi',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    category: 'CNN Indonesia',
    date: '7 November 2026',
    link: 'https://www.cnnindonesia.com/teknologi',
  },
];

async function fetchNewsItems(source, signal) {
  const res = await fetch(`/api/news?source=${source}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error('Format data tidak sesuai');
  }

  return json;
}

function NewsFeed() {
  const [source, setSource] = useState('cnn');
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadNews = useCallback(async (signal, showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const items = await fetchNewsItems(source, signal);
      if (signal?.aborted) return;
      setNews(items);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal mengambil berita terkini dari API.');
      setNews(
        fallbackArticles.map((a) => ({
          ...a,
          category: source === 'kompas' ? 'Kompas' : a.category,
        }))
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [source]);

  useEffect(() => {
    const controller = new AbortController();
    const initialRequest = window.setTimeout(
      () => loadNews(controller.signal),
      0
    );

    const intervalId = window.setInterval(
      () => loadNews(controller.signal),
      AUTO_REFRESH_MS
    );

    return () => {
      controller.abort();
      window.clearTimeout(initialRequest);
      window.clearInterval(intervalId);
    };
  }, [loadNews]);

  const handleRefresh = () => loadNews(undefined, true);
  const sourceLabel = source === 'cnn' ? 'CNN Indonesia' : 'Kompas';

  return (
    <div className="news-container">
      <div className="news-sources" aria-label="Pilih sumber berita">
        {Object.entries({ cnn: 'CNN Indonesia', kompas: 'Kompas' }).map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              className={`news-source-btn ${source === key ? 'active' : ''}`}
              aria-pressed={source === key}
              onClick={() => {
                if (source === key) return;
                setSource(key);
                setNews([]);
                setLastUpdated(null);
                setError(null);
                setIsLoading(true);
              }}
            >
              {label}
            </button>
          )
        )}
      </div>

      <div className="news-toolbar">
        <div>
          <h2>Berita Terkini {sourceLabel}</h2>
          <p>
            {lastUpdated
              ? `Diperbarui ${lastUpdated.toLocaleTimeString('id-ID')} · otomatis setiap 5 menit`
              : 'Berita diperbarui otomatis setiap 5 menit'}
          </p>
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? '⌛ Memuat...' : '🔄 Segarkan Berita'}
        </button>
      </div>

      {isLoading && news.length === 0 && (
        <div className="spinner-box">
          <div className="css-spinner"></div>
          <p>Mengunduh berita terbaru...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="error-banner">
          <h5>Pemberitahuan Jaringan</h5>
          <p>
            {error}
            {news.length > 0 && ' (Menampilkan artikel tersimpan)'}
          </p>
          <button type="button" onClick={handleRefresh}>
            Coba Ambil Ulang
          </button>
        </div>
      )}

      {!isLoading && news.length === 0 && !error && (
        <div className="empty-state">Belum ada berita untuk ditampilkan.</div>
      )}

      {news.length > 0 && (
        <div className="news-grid">
          {news.map((item, index) => (
            <NewsCard
              key={item.link || `${source}-${item.title}-${index}`}
              {...item}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsFeed;
