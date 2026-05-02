export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', lineHeight: 1.7 }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: 30 }}>Privacy Policy</h1>
      
      <div style={{ color: 'var(--text-secondary)' }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, financial and business data, and other information you choose to provide.</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>2. How We Use Your Information</h2>
        <p>We may use the information we collect about you to:</p>
        <ul>
          <li>Provide, maintain, and improve our Services</li>
          <li>Match buyers with sellers via our intelligent matching engine</li>
          <li>Send you technical notices, updates, security alerts and support and administrative messages</li>
          <li>Respond to your comments, questions and requests and provide customer service</li>
          <li>Communicate with you about products, services, offers, promotions, rewards, and events offered by Dealio</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>3. Confidentiality and NDAs</h2>
        <p>We take confidentiality seriously. Listings can be set to confidential, and identifying information is only shared with verified buyers who have signed a Non-Disclosure Agreement (NDA). All users are strictly bound by our terms regarding the sharing of confidential business data.</p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>4. Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@dealiomarketplace.com.</p>
      </div>
    </div>
  );
}
