import Link from 'next/link';

export default function Breadcrumbs({ slugArray }) {
  if (!slugArray || slugArray.length === 0) return null;

  const breadcrumbs = [];
  let path = '';

  slugArray.forEach((slugPart, i) => {
    path += `/${slugPart}`;
    const name = slugPart.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    breadcrumbs.push({ name, path });
  });

  return (
    <nav style={{ padding: '20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      <ol style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
        {breadcrumbs.map((crumb, i) => (
          <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>/</span>
            {i === breadcrumbs.length - 1 ? (
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{crumb.name}</span>
            ) : (
              <Link href={crumb.path} style={{ color: 'var(--primary)' }}>{crumb.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
