export default function PlaceholderPage() {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Page Under Construction</h1>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', textAlign: 'center' }}>
        <div style={{fontSize: 48, marginBottom: 16}}>🚧</div>
        <h3>Coming Soon</h3>
        <p style={{color: 'var(--text-secondary)'}}>This view is being built out as part of Phase 2.</p>
      </div>
    </div>
  );
}
