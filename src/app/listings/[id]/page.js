'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency, formatDate, LISTING_STATUSES } from '@/lib/constants';
import styles from './detail.module.css';

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '', wants_support: false, needs_financing: false });
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        setInquiryForm(f => ({ ...f, name: profile?.full_name || '', email: user.email || '' }));
        const { data: sv } = await supabase.from('saved_listings').select('id').eq('user_id', user.id).eq('listing_id', id).single();
        if (sv) setSaved(true);
      }
      const { data } = await supabase.from('listings').select('*').eq('id', id).single();
      if (data) setListing(data);
      const { data: imgs } = await supabase.from('listing_images').select('*').eq('listing_id', id).order('sort_order');
      if (imgs) setImages(imgs);
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleSave = async () => {
    if (!user) { router.push('/login'); return; }
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', id);
      setSaved(false);
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id });
      setSaved(true);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    setInquiryLoading(true);
    const payload = {
      listing_id: id,
      buyer_user_id: user?.id || null,
      anonymous_name: user ? null : inquiryForm.name,
      anonymous_email: user ? null : inquiryForm.email,
      anonymous_phone: inquiryForm.phone || null,
      message: inquiryForm.message,
      source_type: 'listing_detail_page',
      lead_owner_type: listing?.lead_owner_type || 'seller',
      routed_to_user_id: listing?.lead_owner_type === 'dealio' ? null : listing?.owner_user_id,
      wants_acquisition_support: inquiryForm.wants_support,
      needs_financing: inquiryForm.needs_financing,
    };
    
    await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setInquirySubmitted(true);
    setInquiryLoading(false);
  };

  if (loading) return (
    <div className={styles.page}><div className="container" style={{paddingTop: 60}}>
      <div className="skeleton" style={{height: 400, borderRadius: 16, marginBottom: 32}}></div>
      <div className="skeleton" style={{height: 32, width: '60%', marginBottom: 16}}></div>
      <div className="skeleton" style={{height: 18, width: '40%', marginBottom: 32}}></div>
    </div></div>
  );

  if (!listing) return (
    <div className={styles.page}><div className="container" style={{paddingTop: 60}}>
      <div className="empty-state"><div className="empty-state-icon">🔍</div><h3 className="empty-state-title">Listing not found</h3><p className="empty-state-text">This listing may have been removed or is not yet active.</p><Link href="/listings" className="btn btn-primary">Browse Listings</Link></div>
    </div></div>
  );

  const isConfidential = listing.confidentiality_mode === 'confidential';

  return (
    <div className={styles.page}>
      {/* Hero Image */}
      <div className={styles.hero}>
        {listing.featured_image_url ? (
          <img src={listing.featured_image_url} alt={listing.title} className={styles.heroImg} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          </div>
        )}
        <div className={styles.heroOverlay}>
          <div className="container">
            <Link href="/listings" className={styles.backBtn}>← Back to Listings</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            <div className={styles.titleRow}>
              <div>
                <div className={styles.badges}>
                  <span className="badge badge-primary">{listing.industry || 'Business'}</span>
                  {listing.is_featured && <span className="badge badge-warning">⭐ Featured</span>}
                  {listing.is_verified && <span className="badge badge-accent">✓ Verified</span>}
                  {isConfidential && <span className="badge badge-gray">🔒 Confidential</span>}
                </div>
                <h1 className={styles.title}>{listing.title}</h1>
                {!isConfidential && listing.city && (
                  <p className={styles.location}>📍 {listing.city}{listing.province_state ? `, ${listing.province_state}` : ''}{listing.country ? `, ${listing.country}` : ''}</p>
                )}
                {isConfidential && <p className={styles.location}>📍 Location disclosed upon inquiry</p>}
              </div>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Asking Price</span>
                <span className={styles.priceValue}>{formatCurrency(listing.asking_price)}</span>
              </div>
            </div>

            {/* Financial Snapshot */}
            <div className={styles.financials}>
              <h2 className={styles.sectionTitle}>Financial Snapshot</h2>
              <div className={styles.finGrid}>
                {listing.annual_revenue && <div className={styles.finItem}><span>Annual Revenue</span><strong>{formatCurrency(listing.annual_revenue)}</strong></div>}
                {listing.ebitda && <div className={styles.finItem}><span>EBITDA</span><strong>{formatCurrency(listing.ebitda)}</strong></div>}
                {listing.cash_flow && <div className={styles.finItem}><span>Cash Flow</span><strong>{formatCurrency(listing.cash_flow)}</strong></div>}
                <div className={styles.finItem}><span>Inventory Included</span><strong>{listing.inventory_included ? 'Yes' : 'No'}</strong></div>
                <div className={styles.finItem}><span>Real Estate Included</span><strong>{listing.real_estate_included ? 'Yes' : 'No'}</strong></div>
                {listing.year_established && <div className={styles.finItem}><span>Year Established</span><strong>{listing.year_established}</strong></div>}
                {listing.employees_count && <div className={styles.finItem}><span>Employees</span><strong>{listing.employees_count}</strong></div>}
              </div>
            </div>

            {/* Description */}
            {listing.full_description && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Business Overview</h2>
                <div className={styles.prose}>{listing.full_description}</div>
              </div>
            )}
            {listing.highlights && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Key Highlights</h2>
                <div className={styles.prose}>{listing.highlights}</div>
              </div>
            )}
            {listing.growth_opportunities && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Growth Opportunities</h2>
                <div className={styles.prose}>{listing.growth_opportunities}</div>
              </div>
            )}
            {listing.reason_for_sale && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Reason for Sale</h2>
                <div className={styles.prose}>{listing.reason_for_sale}</div>
              </div>
            )}
            {listing.ideal_buyer && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Ideal Buyer</h2>
                <div className={styles.prose}>{listing.ideal_buyer}</div>
              </div>
            )}

            {/* Gallery */}
            {images.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Gallery</h2>
                <div className={styles.gallery}>
                  {images.map(img => <img key={img.id} src={img.image_url} alt="" className={styles.galleryImg} />)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <button onClick={handleSave} className={`btn ${saved ? 'btn-accent' : 'btn-secondary'}`} style={{ width: '100%' }}>
                {saved ? '♥ Saved' : '♡ Save Listing'}
              </button>
              <button 
                onClick={() => {
                  if (!user) {
                    router.push('/signup?role=buyer');
                  } else {
                    setInquiryOpen(true);
                  }
                }} 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', marginTop: 12 }}
              >
                Contact Seller / Inquire
              </button>
              <div className={styles.sideInfo}>
                <p>📅 Listed {formatDate(listing.created_at)}</p>
                <p>📦 Package: <strong style={{textTransform:'capitalize'}}>{listing.package_type}</strong></p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setInquiryOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{fontSize: 18, fontWeight: 700}}>{inquirySubmitted ? 'Inquiry Sent!' : 'Inquire About This Business'}</h3>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setInquiryOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {inquirySubmitted ? (
                <div style={{textAlign: 'center', padding: '20px 0'}}>
                  <div style={{fontSize: 48, marginBottom: 16}}>✅</div>
                  <p style={{color: 'var(--text-secondary)'}}>Your inquiry has been submitted. The seller will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry}>
                  <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={inquiryForm.name} onChange={e => setInquiryForm(f => ({...f, name: e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={inquiryForm.email} onChange={e => setInquiryForm(f => ({...f, email: e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={inquiryForm.phone} onChange={e => setInquiryForm(f => ({...f, phone: e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" value={inquiryForm.message} onChange={e => setInquiryForm(f => ({...f, message: e.target.value}))} placeholder="Tell the seller about your interest..." required /></div>
                  <label className="form-checkbox" style={{marginBottom: 8}}><input type="checkbox" checked={inquiryForm.wants_support} onChange={e => setInquiryForm(f => ({...f, wants_support: e.target.checked}))} /><span style={{fontSize: 13}}>I want acquisition support from Dealio</span></label>
                  <label className="form-checkbox" style={{marginBottom: 16}}><input type="checkbox" checked={inquiryForm.needs_financing} onChange={e => setInquiryForm(f => ({...f, needs_financing: e.target.checked}))} /><span style={{fontSize: 13}}>I may need financing</span></label>
                  <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={inquiryLoading}>
                    {inquiryLoading ? <span className="spinner"></span> : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
