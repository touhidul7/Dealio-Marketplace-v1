export default function SEOHero({ title, intro }) {
  return (
    <section style={{ 
      background: 'linear-gradient(135deg, var(--gray-900), var(--primary-900))', 
      color: 'white', 
      padding: '80px 20px', 
      textAlign: 'center', 
      position: 'relative' 
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.2 }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
          {intro}
        </p>
      </div>
    </section>
  );
}
