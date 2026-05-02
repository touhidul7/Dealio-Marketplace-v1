export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', lineHeight: 1.7 }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: 30 }}>Terms of Service</h1>
      
      <div style={{ color: 'var(--text-secondary)' }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>1. Acceptance of Terms</h2>
        <p>By accessing and using the Dealio Marketplace website and services, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>2. User Responsibilities</h2>
        <p>Users are solely responsible for the accuracy, content, and legality of the information they provide in listings or buyer profiles. Dealio acts as a marketplace and does not independently verify the financial data submitted by sellers.</p>
        
        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>3. Confidentiality Agreements</h2>
        <p>As a buyer, you agree that any information obtained about a confidential listing is strictly for the purpose of evaluating a potential acquisition. You may not disclose this information to third parties or use it to compete with the business.</p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>4. Payments and Subscriptions</h2>
        <p>Listing packages are billed at the time of publication. Upgrades and advisory services are billed as requested. All payments are non-refundable unless otherwise required by law or explicitly stated.</p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 15 }}>5. Limitation of Liability</h2>
        <p>Dealio shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
      </div>
    </div>
  );
}
