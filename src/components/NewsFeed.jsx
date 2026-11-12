
import NewsCard from './NewsCard';

const newsData = [
  {
    id: 1,
    title: 'Perkembangan Teknologi AI Semakin Pesat',
    category: 'Teknologi',
    description: 'Kecerdasan buatan semakin banyak digunakan dalam berbagai bidang kehidupan.',
    date: '10 November 2026',
    author: 'Tim Redaksi',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    link: 'https://www.kompas.com/',
  },
  {
    id: 2,
    title: 'Inovasi Digital Mengubah Dunia Pendidikan',
    category: 'Pendidikan',
    description: 'Teknologi digital membantu proses belajar menjadi lebih mudah dan interaktif.',
    date: '10 November 2026',
    author: 'Tim Redaksi',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    link: 'https://www.kompas.com/',
  },
  {
    id: 3,
    title: 'Keamanan Siber Menjadi Perhatian Utama',
    category: 'Teknologi',
    description: 'Perlindungan data pribadi menjadi hal penting di era internet.',
    date: '9 November 2026',
    author: 'Tim Redaksi',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    link: 'https://www.kompas.com/',
  },
  {
    id: 4,
    title: 'Transformasi Digital di Dunia Industri',
    category: 'Bisnis',
    description: 'Perusahaan mulai mengembangkan sistem digital untuk meningkatkan produktivitas.',
    date: '8 November 2026',
    author: 'Tim Redaksi',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    link: 'https://www.kompas.com/',
  },
  {
    id: 5,
    title: 'Inovasi Smartphone Terus Berkembang',
    category: 'Gadget',
    description: 'Perkembangan perangkat pintar menghadirkan fitur yang semakin canggih.',
    date: '7 November 2026',
    author: 'Tim Redaksi',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    link: 'https://www.kompas.com/',
  },
  {
    id: 6,
    title: 'Masa Depan Teknologi Cloud Computing',
    category: 'Teknologi',
    description: 'Komputasi awan mempermudah penyimpanan dan pengelolaan data.',
    date: '6 November 2026',
    author: 'Tim Redaksi',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    link: 'https://www.kompas.com/',
  },
];

export default function NewsFeed() {
  return (
    <section className="news-feed">
      <div className="news-header">
        <h1>Berita Terkini</h1>
        <p>
          Informasi teknologi dan perkembangan digital.
        </p>
      </div>

      <div className="news-grid">
        {newsData.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </section>
  );
}
