import Link from 'next/link';

export default function SEOCTA({ ctaType }) {
  let title = "Ready to Make a Move?";
  let subtitle = "Join Dealio Marketplace to access exclusive tools and opportunities.";
  let btnText = "Get Started";
  let btnLink = "/signup";

  if (ctaType === 'buyer') {
    title = "Looking to Acquire a Business?";
    subtitle = "Create a free buyer profile to view confidential listings, financials, and contact sellers directly.";
    btnText = "Create Buyer Profile";
    btnLink = "/signup?role=buyer";
  } else if (ctaType === 'seller') {
    title = "Ready to Sell Your Business?";
    subtitle = "List your business on Canada's premier marketplace. Maintain confidentiality and connect with qualified buyers.";
    btnText = "List Your Business";
    btnLink = "/pricing";
  } else if (ctaType === 'buyer-alert') {
    title = "Don't Miss Out on New Opportunities";
    subtitle = "Set up customized buyer alerts to be the first to know when a business matching your criteria hits the market.";
    btnText = "Set Up Alerts";
    btnLink = "/signup?role=buyer";
  }

  return (
    <div style={{ 
      background: 'var(--primary-50)', 
      borderRadius: 'var(--radius-2xl)', 
      padding: '40px', 
      textAlign: 'center',
      marginTop: '60px',
      border: '1px solid var(--primary-100)'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--primary-900)' }}>{title}</h2>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
        {subtitle}
      </p>
      <Link href={btnLink} className="btn btn-primary btn-lg">
        {btnText}
      </Link>
    </div>
  );
}
