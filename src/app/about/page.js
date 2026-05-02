import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', lineHeight: 1.7 }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: 30 }}>About Dealio</h1>
      
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: 40 }}>
        Dealio Marketplace is the modern platform for buying and selling businesses. We connect founders, investors, and expert advisors in one trusted, secure environment.
      </p>

      <h2 style={{ fontSize: '1.8rem', marginTop: 40, marginBottom: 20 }}>Our Mission</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Historically, the M&A process for small and medium-sized businesses has been opaque, slow, and fragmented. We built Dealio to bring transparency, speed, and institutional-grade tools to the Main Street and lower-middle market.
      </p>

      <h2 style={{ fontSize: '1.8rem', marginTop: 40, marginBottom: 20 }}>How It Works</h2>
      <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, marginBottom: 40 }}>
        <li style={{ marginBottom: 10 }}><strong>For Sellers:</strong> List your business confidentially, manage inquiries securely, and leverage our advisory add-ons when you need expert help.</li>
        <li style={{ marginBottom: 10 }}><strong>For Buyers:</strong> Create a targeted acquisition profile and let our intelligent matching engine bring the right deals directly to your dashboard.</li>
        <li style={{ marginBottom: 10 }}><strong>For Brokers & Advisors:</strong> Manage your entire client portfolio, source new leads, and streamline your transaction workflow.</li>
      </ul>

      <div style={{ background: 'var(--primary)', color: 'white', padding: 40, borderRadius: 16, textAlign: 'center', marginTop: 60 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 20, color: 'white' }}>Ready to get started?</h2>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/signup?role=seller" className="btn btn-secondary" style={{ color: 'var(--primary)', background: 'white' }}>Sell a Business</Link>
          <Link href="/signup?role=buyer" className="btn btn-secondary" style={{ background: 'transparent', borderColor: 'white', color: 'white' }}>Buy a Business</Link>
        </div>
      </div>
    </div>
  );
}
