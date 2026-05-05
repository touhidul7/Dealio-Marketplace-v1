'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', subject: 'I want to buy a business', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymous_name: `${formData.firstName} ${formData.lastName}`.trim(),
          anonymous_email: formData.email,
          message: `${formData.subject}\n\n${formData.message}`,
          source_type: 'contact_form'
        })
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)', 
        color: 'white', 
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '150%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', transform: 'rotate(-15deg)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '150%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', transform: 'rotate(15deg)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Whether you're looking to acquire a new business, exit your current one, or simply have a question about our platform, our advisory team is here to help.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '-60px auto 100px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: 40,
          alignItems: 'start'
        }}>
          
          {/* Contact Form Card */}
          <div style={{ 
            background: 'white', 
            borderRadius: 24, 
            padding: 40, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            border: '1px solid var(--border)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✉️</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Message Sent!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 30, lineHeight: 1.6 }}>
                  Thank you for reaching out to Dealio. One of our M&A advisors will get back to you within 24 business hours.
                </p>
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30, color: 'var(--text-primary)' }}>Send us a message</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>First Name</label>
                    <input type="text" className="form-input" style={{ background: 'var(--gray-50)' }} required placeholder="Jane" value={formData.firstName} onChange={e => setFormData(f => ({...f, firstName: e.target.value}))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Last Name</label>
                    <input type="text" className="form-input" style={{ background: 'var(--gray-50)' }} required placeholder="Doe" value={formData.lastName} onChange={e => setFormData(f => ({...f, lastName: e.target.value}))} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                  <input type="email" className="form-input" style={{ background: 'var(--gray-50)' }} required placeholder="jane@example.com" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} />
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>How can we help?</label>
                  <select className="form-select" style={{ background: 'var(--gray-50)' }} value={formData.subject} onChange={e => setFormData(f => ({...f, subject: e.target.value}))}>
                    <option>I want to buy a business</option>
                    <option>I want to sell my business</option>
                    <option>I need a business valuation</option>
                    <option>I am an advisor/broker</option>
                    <option>General support or other inquiry</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 30 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Message</label>
                  <textarea className="form-textarea" rows="5" style={{ background: 'var(--gray-50)', resize: 'vertical' }} required placeholder="Tell us more about your needs..." value={formData.message} onChange={e => setFormData(f => ({...f, message: e.target.value}))}></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 700 }} disabled={submitting}>
                  {submitting ? <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span> : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info Side */}
          <div style={{ paddingTop: 40, paddingRight: 20 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40, color: 'var(--text-primary)' }}>
              Direct Contact
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  ✉️
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Email Us</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Our friendly team is here to help.</p>
                  <a href="mailto:support@dealiomarketplace.com" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>support@dealiomarketplace.com</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  📞
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Call Us</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Mon-Fri from 9am to 6pm EST.</p>
                  <a href="tel:+1800DEALIO9" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>1-800-DEALIO-9</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  🏢
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Headquarters</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    100 King Street West<br />
                    Suite 5600<br />
                    Toronto, ON M5X 1C9<br />
                    Canada
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 60, padding: 30, background: 'var(--gray-50)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Looking for Advisory Support?</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                If you are an active buyer or seller on Dealio, you can request dedicated advisory services directly from your dashboard.
              </p>
              <Link href="/login" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Dashboard
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
