'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatDate } from '@/lib/constants';

const SERVICES = [
  {
    id: 'teaser_creation',
    name: 'Professional Teaser',
    price: 299,
    icon: '📄',
    color: '#0F52BA',
    desc: 'A polished one-page executive summary designed to attract qualified buyers. Our advisors write it for you.',
    deliverable: 'PDF teaser document within 5 business days',
  },
  {
    id: 'CIM_creation',
    name: 'CIM Creation',
    price: 999,
    icon: '📊',
    color: '#10B981',
    desc: 'A full Confidential Information Memorandum written by our advisory team — the gold standard for serious M&A deals.',
    deliverable: 'Comprehensive CIM document within 10 business days',
  },
  {
    id: 'valuation_guidance',
    name: 'Valuation Guidance',
    price: 499,
    icon: '💰',
    color: '#D97706',
    desc: 'Market-based valuation range with comparable transaction data to help you price your business confidently.',
    deliverable: 'Valuation report with comparable transactions',
  },
  {
    id: 'buyer_outreach',
    name: 'Buyer Outreach Campaign',
    price: 699,
    icon: '📢',
    color: '#7C3AED',
    desc: 'Targeted outreach to our proprietary network of qualified buyers actively seeking businesses like yours.',
    deliverable: 'Campaign report with buyer engagement metrics',
  },
  {
    id: 'deal_readiness_review',
    name: 'Deal-Readiness Review',
    price: 349,
    icon: '✅',
    color: '#059669',
    desc: 'An advisor-led review of your business readiness to sell — identify gaps before buyers do.',
    deliverable: 'Readiness report with actionable recommendations',
  },
  {
    id: 'paid_promotion',
    name: 'Paid Promotion',
    price: 199,
    icon: '🚀',
    color: '#DC2626',
    desc: 'Feature your listing in Dealio email newsletters and targeted social campaigns to reach more buyers faster.',
    deliverable: 'Campaign runs for 30 days with performance report',
  },
  {
    id: 'listing_optimization',
    name: 'Listing Optimization',
    price: 149,
    icon: '⚡',
    color: '#0891B2',
    desc: 'Our team reviews and rewrites your listing to maximize buyer engagement, search placement, and inquiry conversion.',
    deliverable: 'Optimized listing live within 3 business days',
  },
  {
    id: 'advisory_consultation',
    name: 'Advisory Consultation',
    price: 199,
    icon: '🤝',
    color: '#9333EA',
    desc: 'A 60-minute 1-on-1 session with a Dealio M&A advisor to answer your questions and map out your sale strategy.',
    deliverable: '60-min video call + summary notes',
  },
  {
    id: 'full_representation_request',
    name: 'Full Advisory Representation',
    price: null,
    icon: '👑',
    color: '#D97706',
    desc: 'Full Dealio representation — we handle buyer sourcing, negotiations, due diligence, and closing on your behalf.',
    deliverable: 'Custom engagement — contact us for pricing',
  },
];

const STATUS_STYLES = {
  new:         { label: 'Submitted',   bg: '#EFF6FF', color: '#1D4ED8' },
  assigned:    { label: 'Assigned',    bg: '#F0FDF4', color: '#15803D' },
  in_progress: { label: 'In Progress', bg: '#FFFBEB', color: '#B45309' },
  complete:    { label: 'Completed',   bg: '#F0FDF4', color: '#15803D' },
  canceled:    { label: 'Canceled',    bg: '#FEF2F2', color: '#B91C1C' },
};

export default function SellerServicesPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // service object
  const [selectedListing, setSelectedListing] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: reqs }, { data: listingData }] = await Promise.all([
        supabase
          .from('service_requests')
          .select('*, listings(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('listings')
          .select('id, title')
          .eq('owner_user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      if (reqs) setRequests(reqs);
      if (listingData) setListings(listingData);
      setLoading(false);
    };
    load();
  }, [user]);

  const openModal = (service) => {
    setModal(service);
    setSelectedListing(listings[0]?.id || '');
    setNotes('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !modal) return;
    setSubmitting(true);
    const { error } = await supabase.from('service_requests').insert({
      user_id: user.id,
      listing_id: selectedListing || null,
      request_type: modal.id,
      notes: notes || null,
      status: 'new',
    });
    if (!error) {
      // Refresh requests
      const { data } = await supabase
        .from('service_requests')
        .select('*, listings(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
      setSuccessMsg(`Your request for "${modal.name}" has been submitted! Our team will be in touch within 1 business day.`);
      setModal(null);
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Services & Add-ons</h1>
          <p className="page-subtitle">Accelerate your sale with expert advisory services</p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <p style={{ margin: 0, color: '#15803D', fontWeight: 500 }}>{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#15803D', fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Active Requests */}
      {!loading && requests.length > 0 && (
        <div className="card" style={{ marginBottom: 32, padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>My Service Requests</h2>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{requests.length} request{requests.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {requests.map(req => {
              const svc = SERVICES.find(s => s.id === req.request_type);
              const st = STATUS_STYLES[req.status] || STATUS_STYLES.new;
              return (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 24 }}>{svc?.icon || '📋'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{svc?.name || req.request_type}</div>
                    {req.listings?.title && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📋 {req.listings.title}</div>}
                    {req.notes && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{req.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{formatDate(req.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Available Services</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Click any service to request it. Our team will reach out within 1 business day to confirm details.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {SERVICES.map(svc => (
            <div key={svc.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'box-shadow 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
              onClick={() => openModal(svc)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 36 }}>{svc.icon}</span>
                <div style={{ textAlign: 'right' }}>
                  {svc.price !== null ? (
                    <div style={{ fontSize: 22, fontWeight: 800, color: svc.color }}>${svc.price.toLocaleString()}</div>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 700, color: svc.color }}>Custom Pricing</div>
                  )}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{svc.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{svc.desc}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 12px' }}>📦 {svc.deliverable}</p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', background: svc.color, borderColor: svc.color }}
                  onClick={(e) => { e.stopPropagation(); openModal(svc); }}
                >
                  Request This Service →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{modal.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Request: {modal.name}</h3>
                {modal.price !== null && (
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                    ${modal.price.toLocaleString()} — our team will confirm payment details
                  </p>
                )}
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {listings.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Apply to Listing <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
                    <select
                      className="form-input"
                      value={selectedListing}
                      onChange={e => setSelectedListing(e.target.value)}
                    >
                      <option value="">No specific listing</option>
                      {listings.map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Additional Notes <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    className="form-textarea"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any specific details or requirements for this service request..."
                    style={{ minHeight: 100 }}
                  />
                </div>
                <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                    📞 After submitting, a Dealio advisor will contact you within <strong>1 business day</strong> to confirm details and arrange payment.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                    {submitting ? <span className="spinner" /> : '🚀 Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
