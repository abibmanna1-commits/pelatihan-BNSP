function NewsCard(props) {
  const item = props.news || props;
  const { title, image, category, date, link } = item;
  const fallback =
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&q=80';

  return (
    <div className="news-card">
      <div className="news-thumb-wrapper">
        <img
          src={image || fallback}
          alt={title || 'Berita'}
          className="news-thumb"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallback;
          }}
        />
        {category && <span className="news-category-badge">{category}</span>}
      </div>

      <div className="news-body">
        <h3 className="news-headline">{title}</h3>
        <div className="news-meta">
          <span>{date || 'Hari ini'}</span>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="news-link">
              Baca Selengkapnya →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
