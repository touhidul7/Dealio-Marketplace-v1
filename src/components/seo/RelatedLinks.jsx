'use client';
import Link from 'next/link';

export default function RelatedLinks({ links }) {
  if (!links || links.length === 0) return null;

  return (
    <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Related Searches</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {links.map((link, i) => {
          const text = link.split('/').filter(Boolean).map(segment => 
            segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          ).join(' › ');
          
          return (
            <Link 
              key={i} 
              href={link}
              className="seo-related-link"
            >
              {text}
            </Link>
          );
        })}
      </div>
      <style jsx>{`
        :global(.seo-related-link) {
          padding: 8px 16px;
          background: var(--gray-50);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.9rem;
          color: var(--text-primary);
          transition: all 0.2s;
        }
        :global(.seo-related-link:hover) {
          border-color: var(--primary);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
