import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { mapNewsItems } from './newsMapper';

const NEWS_URL = 'https://berita-indo-api.vercel.app/v1/cnn-news';

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

async function fetchNewsItems(signal) {
  const res = await fetch(NEWS_URL, { signal });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  const json = await res.json();
  const mapped = mapNewsItems(json.data);
  if (!mapped || mapped.length === 0) throw new Error('Format data tidak sesuai');
  return mapped;
}

function NewsFeed() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const items = await fetchNewsItems(controller.signal);
        setNews(items);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Gagal mengambil berita terkini dari API.');
        // Gunakan berita cadangan agar tampilan tetap informatif
        setNews(fallbackArticles);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchNewsItems();
      setNews(items);
    } catch (err) {
      setError(err.message || 'Gagal mengambil berita terkini dari API.');
      setNews(fallbackArticles);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="news-container">
      <div className="news-toolbar">
        <div>
          <h2>Berita Terkini CNN Indonesia</h2>
          <p>
            {error
              ? `Menampilkan ${news.length} artikel arsip (mode cadangan offline)`
              : `Menampilkan ${news.length} artikel dari Berita Indo API`}
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

      {isLoading && (
        <div className="spinner-box">
          <div className="css-spinner"></div>
          <p>Mengunduh berita nasional terbaru...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="error-banner">
          <h5>Pemberitahuan Jaringan</h5>
          <p>{error} (Menampilkan data cadangan)</p>
          <button type="button" onClick={handleRefresh}>
            Coba Ambil Ulang
          </button>
        </div>
      )}

      {!isLoading && (
        <div className="news-grid">
          {news.map((item, i) => (
            <NewsCard key={i} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsFeed;
