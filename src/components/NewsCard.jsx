
export default function NewsCard({ news }) {
  return (
    <article className="news-card">
      <img
        src={news.image}
        alt={news.title}
        className="news-image"
        loading="lazy"
      />

      <div className="news-content">
        <span className="news-category">
          {news.category}
        </span>

        <h3>{news.title}</h3>

        <p>{news.description}</p>

        <div className="news-meta">
          <span>{news.date}</span>
          <span>{news.author}</span>
        </div>

        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="news-button"
        >
          Baca Selengkapnya →
        </a>
      </div>
    </article>
  );
}
