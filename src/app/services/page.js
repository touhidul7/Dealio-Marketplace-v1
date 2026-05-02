import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 20px' }}>
      <h1 className="page-title" style={{ textAlign: 'center', fontSize: '3rem', marginBottom: 20 }}>Dealio Services</h1>
      <p className="page-subtitle" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
        Expert M&A advisory, business valuations, and deal support for buyers and sellers on the Dealio Marketplace.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
        <div className="card" id="advisory" style={{ padding: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🤝</div>
          <h2 style={{ fontSize: 24, marginBottom: 15 }}>Advisory Services</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Engage a dedicated Dealio M&A advisor to proactively manage your transaction. For sellers, we handle buyer sourcing, screening, and negotiation. For buyers, we conduct targeted outreach to find your ideal acquisition.
          </p>
          <Link href="/signup" className="btn btn-secondary">Get Advisory Support</Link>
        </div>

        <div className="card" id="valuations" style={{ padding: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>💰</div>
          <h2 style={{ fontSize: 24, marginBottom: 15 }}>Business Valuations</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Don't guess what a business is worth. Our expert team provides comprehensive, market-based valuation reports using comparable transaction data to ensure you price correctly or avoid overpaying.
          </p>
          <Link href="/signup" className="btn btn-secondary">Request Valuation</Link>
        </div>

        <div className="card" id="outreach" style={{ padding: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>📢</div>
          <h2 style={{ fontSize: 24, marginBottom: 15 }}>Buyer Outreach</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Accelerate your sale with targeted outbound campaigns. We leverage our proprietary network and private equity contacts to confidentially market your business to qualified, well-funded buyers.
          </p>
          <Link href="/signup" className="btn btn-secondary">Start a Campaign</Link>
        </div>

        <div className="card" id="support" style={{ padding: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 24, marginBottom: 15 }}>Deal Support & Diligence</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Navigate complex financial, operational, and legal due diligence with our team of M&A veterans. We provide deal-readiness reviews, CIM creation, and data room management.
          </p>
          <Link href="/signup" className="btn btn-secondary">Get Deal Support</Link>
        </div>
      </div>
    </div>
  );
}
