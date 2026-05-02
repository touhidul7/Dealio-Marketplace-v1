export default function ContactPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: 20 }}>Contact Us</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Have questions about buying, selling, or our advisory services? We're here to help.
      </p>

      <div className="card" style={{ padding: 30 }}>
        <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for contacting us! We will get back to you shortly.'); window.location.href = '/'; }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-select">
              <option>General Inquiry</option>
              <option>Help with Buying</option>
              <option>Help with Selling</option>
              <option>Advisory Services</option>
              <option>Technical Support</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" rows="6" required></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
        </form>
      </div>

      <div style={{ marginTop: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p><strong>Email:</strong> support@dealiomarketplace.com</p>
        <p><strong>Phone:</strong> 1-800-DEALIO-9</p>
        <p><strong>Hours:</strong> Monday - Friday, 9am - 5pm EST</p>
      </div>
    </div>
  );
}
