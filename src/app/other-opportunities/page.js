'use client';
import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useAuth } from '@/components/AuthProvider';
import styles from './page.module.css';

const OpportunityCard = ({ item, handleInquiryOpen }) => {
  const summary = item.deal_summary || 'No summary available.';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {item.dealio_id && <span className={styles.badge}>{item.dealio_id}</span>}
        {item.asset_class && <span className={styles.badgePrimary}>{item.asset_class}</span>}
      </div>
      
      <div className={styles.dealSummary}>
        {summary}
      </div>
      
      <div className={styles.cardDetails}>
        <p><strong>Municipality:</strong> {item.municipality || 'N/A'}</p>
        <p><strong>Asking Price:</strong> {item.asking_price || 'N/A'}</p>
      </div>

      <button className={`btn btn-primary ${styles.requestBtn}`} onClick={() => handleInquiryOpen(item)}>
        Request Info
      </button>
    </div>
  );
};

export default function OtherOpportunities() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('real-estate');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedAskingPrice, setSelectedAskingPrice] = useState('');
  const [selectedAssetClass, setSelectedAssetClass] = useState('');

  // Modal
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const REAL_ESTATE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKnhb3DvY1DOHQGc7iQVm8lqbuS11jJDiZ2ZhXPbIwzXtzw8R3zY2sU63dnMvOWwbVBSiPrkpLVcav/pub?gid=1728545467&single=true&output=csv';
  const BUSINESS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiBBaak04cEalhmSEE8BVCuwDwf-pw8uOL-FQLKJn_Q2a3-YsAk_sfEpWhoI1TDTKQitErX2srQnaK/pub?gid=862653228&single=true&output=csv';

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        setInquiryForm(f => ({ ...f, name: profile?.full_name || '', email: user.email || '' }));
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const baseUrl = activeTab === 'real-estate' ? REAL_ESTATE_CSV_URL : BUSINESS_CSV_URL;
        const url = `${baseUrl}&t=${new Date().getTime()}`;
        const res = await fetch(url, { cache: 'no-store' });
        const csvText = await res.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Filter where Publish is TRUE
            let published = results.data.filter(row => row.Publish?.toUpperCase() === 'TRUE');
            
            if (activeTab === 'businesses') {
              published = published.map(row => ({
                ...row,
                municipality: row.city || row.municipality,
                asset_class: row.industry || row.asset_class,
                deal_summary: row.deal_summary || row.summary,
              }));
            }
            
            setData(published);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Failed to load CSV', err);
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  // Derived filter options
  const municipalities = useMemo(() => [...new Set(data.map(d => d.municipality).filter(Boolean))], [data]);
  const askingPrices = useMemo(() => [...new Set(data.map(d => d.asking_price).filter(Boolean))], [data]);
  const assetClasses = useMemo(() => [...new Set(data.map(d => d.asset_class).filter(Boolean))], [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedMunicipality && item.municipality !== selectedMunicipality) return false;
      if (selectedAskingPrice && item.asking_price !== selectedAskingPrice) return false;
      if (selectedAssetClass && item.asset_class !== selectedAssetClass) return false;
      return true;
    });
  }, [data, selectedMunicipality, selectedAskingPrice, selectedAssetClass]);

  const handleInquiryOpen = (listing) => {
    setSelectedListing(listing);
    setInquirySubmitted(false);
    setInquiryOpen(true);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryLoading(true);
    
    // listing_id is a UUID FK in DB — must be null for external opportunities
    const dealioRef = selectedListing.dealio_id || selectedListing.listing_id || 'Unknown';
    const payload = {
      listing_id: null,
      buyer_user_id: user?.id || null,
      anonymous_name: inquiryForm.name,
      anonymous_email: inquiryForm.email,
      anonymous_phone: inquiryForm.phone || null,
      message: inquiryForm.message
        ? `[${dealioRef}] ${inquiryForm.message}`
        : `Interested in other opportunity: ${dealioRef}`,
      source_type: 'direct_link', // DB CHECK constraint only allows specific values
      dealio_id: dealioRef, // Passed to GHL as a tag, stripped before DB insert
      ghl_source: 'other_opportunities' // Used by API for GHL source label only
    };
    
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error('Failed to submit inquiry');
      }
      
      setInquirySubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Other Opportunities</h1>
          <p className={styles.subtitle}>Explore off-market real estate and business opportunities.</p>
        </div>
      </header>

      <section className={styles.main}>
        <div className="container">
          {/* Tabs */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'real-estate' ? styles.active : ''}`}
              onClick={() => { setActiveTab('real-estate'); setSelectedMunicipality(''); setSelectedAskingPrice(''); setSelectedAssetClass(''); }}
            >
              Real Estate
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'businesses' ? styles.active : ''}`}
              onClick={() => { setActiveTab('businesses'); setSelectedMunicipality(''); setSelectedAskingPrice(''); setSelectedAssetClass(''); }}
            >
              Businesses
            </button>
          </div>

          {filteredData.length === 0 && !loading && activeTab === 'businesses' && data.length === 0 && (
            <div className={styles.emptyState}>No opportunities found.</div>
          )}

          {/* Filters */}
          <div className={styles.filters}>
            <select className={styles.filterSelect} value={selectedMunicipality} onChange={(e) => setSelectedMunicipality(e.target.value)}>
              <option value="">All Municipalities</option>
              {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select className={styles.filterSelect} value={selectedAssetClass} onChange={(e) => setSelectedAssetClass(e.target.value)}>
              <option value="">All Asset Classes</option>
              {assetClasses.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select className={styles.filterSelect} value={selectedAskingPrice} onChange={(e) => setSelectedAskingPrice(e.target.value)}>
              <option value="">All Prices</option>
              {askingPrices.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.skeleton} ${styles.skeletonBadge}`}></div>
                    <div className={`${styles.skeleton} ${styles.skeletonBadge}`}></div>
                  </div>
                  <div className={`${styles.skeleton} ${styles.skeletonSummary}`}></div>
                  <div className={styles.cardDetails}>
                    <div className={`${styles.skeleton} ${styles.skeletonDetail}`}></div>
                    <div className={`${styles.skeleton} ${styles.skeletonDetail}`}></div>
                  </div>
                  <div className={`${styles.skeleton} ${styles.skeletonBtn}`}></div>
                </div>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className={styles.emptyState}>No opportunities found matching your filters.</div>
          ) : (
            <div className={styles.grid}>
              {filteredData.map((item, idx) => (
                <OpportunityCard key={idx} item={item} handleInquiryOpen={handleInquiryOpen} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Inquiry Modal */}
      {inquiryOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setInquiryOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{fontSize: 18, fontWeight: 700}}>{inquirySubmitted ? 'Inquiry Sent!' : 'Request Information'}</h3>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setInquiryOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {inquirySubmitted ? (
                <div style={{textAlign: 'center', padding: '20px 0'}}>
                  <div style={{fontSize: 48, marginBottom: 16}}>✅</div>
                  <p style={{color: 'var(--text-secondary)'}}>Your inquiry has been sent to our Dealio Advisors. We will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={inquiryForm.name} onChange={e => setInquiryForm(f => ({...f, name: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={inquiryForm.email} onChange={e => setInquiryForm(f => ({...f, email: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone (Optional)</label>
                    <input type="tel" className="form-input" value={inquiryForm.phone} onChange={e => setInquiryForm(f => ({...f, phone: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message (Optional)</label>
                    <textarea className="form-textarea" value={inquiryForm.message} onChange={e => setInquiryForm(f => ({...f, message: e.target.value}))} placeholder="I would like more information about this opportunity..." />
                  </div>
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
