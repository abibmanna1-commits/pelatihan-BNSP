
export default function NewsCard({ news }) {
  return (
    <article
      style={{
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#fff',
        color: '#222',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          backgroundColor: '#e0edff',
          color: '#174ea6',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '12px',
        }}
      >
        {news.category}
      </span>

      <h2 style={{ fontSize: '20px', marginTop: '16px' }}>
        {news.title}
      </h2>

      <p style={{ color: '#777', fontSize: '13px' }}>
        {news.date}
      </p>

      <p style={{ lineHeight: 1.6 }}>
        {news.description}
      </p>
    </article>
  );
}
