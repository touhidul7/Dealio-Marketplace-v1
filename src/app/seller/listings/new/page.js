'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { INDUSTRIES, PROVINCES, COUNTRIES, PACKAGES } from '@/lib/constants';
import styles from './wizard.module.css';

const STEPS = [
  'Business Basics', 'Financial Info', 'Business Details',
  'Uploads', 'Lead Routing', 'Package', 'Review'
];

const EMPTY = {
  title: '', short_summary: '', full_description: '', industry: '', sub_industry: '',
  city: '', province_state: '', country: 'Canada', confidentiality_mode: 'public',
  asking_price: '', asking_price_min: '', asking_price_max: '', annual_revenue: '',
  ebitda: '', cash_flow: '', inventory_included: false, real_estate_included: false,
  reason_for_sale: '', highlights: '', ideal_buyer: '', growth_opportunities: '',
  owner_role: '', employees_count: '', year_established: '',
  inquiry_routing_type: 'direct_to_seller', package_type: 'basic',
};

export default function NewListingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const uploadImage = async (file, userId) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('listing-images').upload(path, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not authenticated'); return; }

      let imageUrl = null;
      if (featuredImage) { imageUrl = await uploadImage(featuredImage, user.id); }

      const payload = {
        ...form,
        owner_user_id: user.id,
        owner_type: 'seller',
        lead_owner_type: form.inquiry_routing_type === 'dealio_inbox' ? 'dealio' : 'seller',
        status: form.package_type === 'basic' ? 'pending_review' : 'pending_review',
        featured_image_url: imageUrl,
        asking_price: form.asking_price ? Number(form.asking_price) : null,
        asking_price_min: form.asking_price_min ? Number(form.asking_price_min) : null,
        asking_price_max: form.asking_price_max ? Number(form.asking_price_max) : null,
        annual_revenue: form.annual_revenue ? Number(form.annual_revenue) : null,
        ebitda: form.ebitda ? Number(form.ebitda) : null,
        cash_flow: form.cash_flow ? Number(form.cash_flow) : null,
        employees_count: form.employees_count ? Number(form.employees_count) : null,
        year_established: form.year_established ? Number(form.year_established) : null,
      };

      const { data, error: dbErr } = await supabase.from('listings').insert(payload).select().single();
      if (dbErr) { setError(dbErr.message); return; }
      
      setCreatedId(data.id);

      // Trigger matching engine in background
      fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate_listing', listingId: data.id })
      }).catch(console.error);

      // If a paid package is selected, go to Stripe Checkout
      if (form.package_type === 'pro' || form.package_type === 'premium') {
        try {
          const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              packageId: form.package_type,
              listingId: data.id,
              userId: user.id
            }),
          });
          
          const checkoutData = await res.json();
          
          if (!res.ok) {
            throw new Error(checkoutData.error || 'Failed to initialize checkout');
          }
          
          // Redirect to Stripe
          window.location.href = checkoutData.url;
          return; // Stop here, redirecting
        } catch (err) {
          setError('Listing created, but payment failed to start. You can upgrade later from your dashboard. ' + err.message);
        }
      }

      setDone(true);
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (done) return (
    <div className={styles.done}>
      <div className={styles.doneCard}>
        <div className={styles.doneIcon}>🎉</div>
        <h2 className={styles.doneTitle}>Listing Submitted!</h2>
        <p className={styles.doneSub}>Your listing is pending review. We'll notify you once it goes live (usually within 24 hours).</p>
        <div className={styles.doneActions}>
          <button className="btn btn-primary" onClick={() => router.push('/seller')}>Go to Dashboard</button>
          {createdId && <button className="btn btn-secondary" onClick={() => router.push(`/listings/${createdId}`)}>Preview Listing</button>}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="page-title">Create New Listing</h1>
        <p className="page-subtitle">Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong></p>
      </div>

      {/* Progress */}
      <div className={styles.progress}>
        {STEPS.map((s, i) => (
          <div key={i} className={`${styles.progressStep} ${i <= step ? styles.progressActive : ''} ${i < step ? styles.progressDone : ''}`}>
            <div className={styles.progressDot}>{i < step ? '✓' : i + 1}</div>
            <span className={styles.progressLabel}>{s}</span>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {error && <div style={{background:'#FEF2F2',border:'1px solid #FCA5A5',color:'var(--danger)',padding:'12px 16px',borderRadius:8,marginBottom:20,fontSize:13}}>{error}</div>}

        {/* Step 1: Business Basics */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <div className="form-group"><label className="form-label">Listing Title <span className="required">*</span></label><input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Profitable E-commerce Business – Toronto" /></div>
            <div className="form-group"><label className="form-label">Short Summary <span className="required">*</span></label><textarea className="form-textarea" value={form.short_summary} onChange={e => set('short_summary', e.target.value)} placeholder="2–3 sentence overview shown in search results" style={{minHeight:80}} /></div>
            <div className="form-group"><label className="form-label">Full Description</label><textarea className="form-textarea" value={form.full_description} onChange={e => set('full_description', e.target.value)} placeholder="Detailed description of the business, history, operations..." style={{minHeight:160}} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Industry</label><select className="form-select" value={form.industry} onChange={e => set('industry', e.target.value)}><option value="">Select Industry</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Sub-Industry</label><input className="form-input" value={form.sub_industry} onChange={e => set('sub_industry', e.target.value)} placeholder="e.g. SaaS, Fast Food, HVAC" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Toronto" /></div>
              <div className="form-group"><label className="form-label">Province / State</label><select className="form-select" value={form.province_state} onChange={e => set('province_state', e.target.value)}><option value="">Select Province</option>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Country</label><select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Confidentiality</label><select className="form-select" value={form.confidentiality_mode} onChange={e => set('confidentiality_mode', e.target.value)}><option value="public">Public – Show location & name</option><option value="city_only">City Only – Hide business name</option><option value="confidential">Confidential – Hide all details</option></select></div>
            </div>
          </div>
        )}

        {/* Step 2: Financial Info */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Asking Price (CAD)</label><input type="number" className="form-input" value={form.asking_price} onChange={e => set('asking_price', e.target.value)} placeholder="e.g. 1500000" /></div>
              <div className="form-group"><label className="form-label">Annual Revenue (CAD)</label><input type="number" className="form-input" value={form.annual_revenue} onChange={e => set('annual_revenue', e.target.value)} placeholder="e.g. 800000" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">EBITDA (CAD)</label><input type="number" className="form-input" value={form.ebitda} onChange={e => set('ebitda', e.target.value)} placeholder="e.g. 200000" /></div>
              <div className="form-group"><label className="form-label">Cash Flow (CAD)</label><input type="number" className="form-input" value={form.cash_flow} onChange={e => set('cash_flow', e.target.value)} placeholder="e.g. 180000" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Price Range Min</label><input type="number" className="form-input" value={form.asking_price_min} onChange={e => set('asking_price_min', e.target.value)} placeholder="Optional" /></div>
              <div className="form-group"><label className="form-label">Price Range Max</label><input type="number" className="form-input" value={form.asking_price_max} onChange={e => set('asking_price_max', e.target.value)} placeholder="Optional" /></div>
            </div>
            <div style={{display:'flex',gap:24,marginTop:8}}>
              <label className="form-checkbox"><input type="checkbox" checked={form.inventory_included} onChange={e => set('inventory_included', e.target.checked)} /><span>Inventory Included in Price</span></label>
              <label className="form-checkbox"><input type="checkbox" checked={form.real_estate_included} onChange={e => set('real_estate_included', e.target.checked)} /><span>Real Estate Included in Price</span></label>
            </div>
          </div>
        )}

        {/* Step 3: Business Details */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <div className="form-group"><label className="form-label">Reason for Sale</label><textarea className="form-textarea" value={form.reason_for_sale} onChange={e => set('reason_for_sale', e.target.value)} placeholder="Why are you selling this business?" /></div>
            <div className="form-group"><label className="form-label">Key Highlights</label><textarea className="form-textarea" value={form.highlights} onChange={e => set('highlights', e.target.value)} placeholder="Key selling points, competitive advantages, growth trajectory..." /></div>
            <div className="form-group"><label className="form-label">Ideal Buyer Profile</label><textarea className="form-textarea" value={form.ideal_buyer} onChange={e => set('ideal_buyer', e.target.value)} placeholder="Describe your ideal buyer – experience, capital, background..." /></div>
            <div className="form-group"><label className="form-label">Growth Opportunities</label><textarea className="form-textarea" value={form.growth_opportunities} onChange={e => set('growth_opportunities', e.target.value)} placeholder="Untapped markets, expansion potential, new revenue streams..." /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Owner's Role</label><input className="form-input" value={form.owner_role} onChange={e => set('owner_role', e.target.value)} placeholder="e.g. Part-time, Full-time, Absentee" /></div>
              <div className="form-group"><label className="form-label">Number of Employees</label><input type="number" className="form-input" value={form.employees_count} onChange={e => set('employees_count', e.target.value)} placeholder="e.g. 12" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Year Established</label><input type="number" className="form-input" value={form.year_established} onChange={e => set('year_established', e.target.value)} placeholder="e.g. 2010" /></div>
            </div>
          </div>
        )}

        {/* Step 4: Uploads */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <div className="form-group">
              <label className="form-label">Featured Image</label>
              <div className={styles.uploadZone} onClick={() => document.getElementById('featImg').click()}>
                {featuredImage ? (
                  <div style={{textAlign:'center'}}>
                    <img src={URL.createObjectURL(featuredImage)} alt="" style={{maxHeight:200,borderRadius:8,marginBottom:8}} />
                    <p style={{fontSize:13,color:'var(--text-secondary)'}}>{featuredImage.name} – Click to change</p>
                  </div>
                ) : (
                  <>
                    <div style={{fontSize:40,marginBottom:12}}>📸</div>
                    <p style={{fontWeight:600,marginBottom:4}}>Click to upload a featured image</p>
                    <p style={{fontSize:13,color:'var(--text-tertiary)'}}>PNG, JPG up to 10MB. This is the main image shown in search results.</p>
                  </>
                )}
              </div>
              <input id="featImg" type="file" accept="image/*" style={{display:'none'}} onChange={e => setFeaturedImage(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">Documents (NDA, Teaser, etc.)</label>
              <p className="form-hint">Document uploads available on Pro and Premium plans.</p>
              <div className={styles.uploadZone} style={{opacity:0.5,cursor:'not-allowed'}}>
                <div style={{fontSize:32,marginBottom:8}}>📎</div>
                <p style={{fontSize:14,color:'var(--text-secondary)'}}>Upgrade to Pro or Premium to attach documents</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Lead Routing */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <div className="form-group">
              <label className="form-label">How should inquiries be handled?</label>
              {[
                { value: 'direct_to_seller', label: 'Direct to Me', desc: 'Buyers can contact you directly. You receive all inquiries.' },
                { value: 'dealio_inbox', label: 'Dealio Inbox', desc: 'Dealio screens all inquiries before forwarding qualified leads to you.' },
                { value: 'shared', label: 'Shared', desc: 'Both you and a Dealio advisor see all inquiries.' },
              ].map(opt => (
                <label key={opt.value} className={styles.routeOption} style={{borderColor: form.inquiry_routing_type === opt.value ? 'var(--primary)' : 'var(--border)', background: form.inquiry_routing_type === opt.value ? 'var(--primary-50)' : '#fff'}}>
                  <input type="radio" name="routing" value={opt.value} checked={form.inquiry_routing_type === opt.value} onChange={e => set('inquiry_routing_type', e.target.value)} style={{marginTop:2}} />
                  <div><strong style={{fontSize:15}}>{opt.label}</strong><p style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>{opt.desc}</p></div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Package */}
        {step === 5 && (
          <div className={styles.stepContent}>
            <div className={styles.pkgGrid}>
              {PACKAGES.map(pkg => (
                <label key={pkg.id} className={`${styles.pkgOption} ${form.package_type === pkg.id ? styles.pkgSelected : ''}`} style={{ borderColor: form.package_type === pkg.id ? pkg.color : 'var(--border)' }}>
                  <input type="radio" name="package" value={pkg.id} checked={form.package_type === pkg.id} onChange={e => set('package_type', e.target.value)} style={{display:'none'}} />
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <h3 style={{fontSize:18,fontWeight:800,color: pkg.color}}>{pkg.name}</h3>
                    <span style={{fontSize:20,fontWeight:900,color:pkg.color}}>{pkg.price !== null ? `$${pkg.price}/mo` : 'Custom'}</span>
                  </div>
                  {pkg.popular && <span style={{background:pkg.color,color:'#fff',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:99,display:'inline-block',marginBottom:8}}>Most Popular</span>}
                  <ul style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:0}}>
                    {pkg.features.map((f,i) => <li key={i} style={{fontSize:13,color:'var(--text-secondary)',display:'flex',gap:6}}><span style={{color:pkg.color}}>✓</span>{f}</li>)}
                  </ul>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 6 && (
          <div className={styles.stepContent}>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewSection}><h3>Business Info</h3><dl>{[['Title', form.title],['Industry', form.industry],['Location', [form.city, form.province_state, form.country].filter(Boolean).join(', ')],['Confidentiality', form.confidentiality_mode]].map(([k,v])=>v&&<div key={k} className={styles.reviewRow}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
              <div className={styles.reviewSection}><h3>Financials</h3><dl>{[['Asking Price', form.asking_price ? `$${Number(form.asking_price).toLocaleString()}` : '—'],['Revenue', form.annual_revenue ? `$${Number(form.annual_revenue).toLocaleString()}` : '—'],['EBITDA', form.ebitda ? `$${Number(form.ebitda).toLocaleString()}` : '—']].map(([k,v])=><div key={k} className={styles.reviewRow}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
              <div className={styles.reviewSection}><h3>Settings</h3><dl>{[['Package', form.package_type],['Routing', form.inquiry_routing_type],['Featured Image', featuredImage ? featuredImage.name : 'None']].map(([k,v])=><div key={k} className={styles.reviewRow}><dt>{k}</dt><dd style={{textTransform:'capitalize'}}>{v}</dd></div>)}</dl></div>
            </div>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:16}}>Your listing will be submitted for review. It typically goes live within 24 hours.</p>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.stepNav}>
          <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => { if (!form.title && step === 0) { setError('Please enter a listing title'); return; } setError(''); setStep(s => s + 1); }} >Next →</button>
          ) : (
            <button className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={saving}>{saving ? <><span className="spinner"></span> Submitting...</> : '🚀 Submit Listing'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
