'use client';
import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { INDUSTRIES, PROVINCES, COUNTRIES, PACKAGES } from '@/lib/constants';
import styles from '../../new/wizard.module.css';

const STEPS = [
  'Business Basics', 'Financial Info', 'Business Details',
  'Uploads', 'Lead Routing', 'Review'
];

function EditListingWizard({ params }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;
  
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadListing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('owner_user_id', user.id)
        .single();

      if (error || !data) {
        setError('Listing not found or you do not have permission to edit it.');
        return;
      }

      setForm({
        ...data,
        asking_price: data.asking_price || '',
        annual_revenue: data.annual_revenue || '',
        ebitda: data.ebitda || '',
        cash_flow: data.cash_flow || '',
        year_established: data.year_established || '',
        employees_count: data.employees_count || '',
        inquiry_routing_type: data.lead_owner_type === 'dealio' ? 'dealio_inbox' : 'direct_to_seller'
      });
    };
    loadListing();
  }, [listingId]);

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

      let imageUrl = form.featured_image_url;
      if (featuredImage) { imageUrl = await uploadImage(featuredImage, user.id); }

      const sanitizedForm = { ...form };
      ['asking_price', 'asking_price_min', 'asking_price_max', 'annual_revenue', 'ebitda', 'cash_flow', 'year_established', 'employees_count'].forEach(field => {
        if (sanitizedForm[field] === '') {
          sanitizedForm[field] = null;
        } else if (typeof sanitizedForm[field] === 'string') {
          const val = parseFloat(sanitizedForm[field]);
          if (!isNaN(val)) sanitizedForm[field] = val;
        }
      });

      const payload = {
        title: sanitizedForm.title,
        short_summary: sanitizedForm.short_summary,
        full_description: sanitizedForm.full_description,
        industry: sanitizedForm.industry,
        city: sanitizedForm.city,
        province_state: sanitizedForm.province_state,
        asking_price: sanitizedForm.asking_price,
        annual_revenue: sanitizedForm.annual_revenue,
        ebitda: sanitizedForm.ebitda,
        cash_flow: sanitizedForm.cash_flow,
        year_established: sanitizedForm.year_established,
        lead_owner_type: form.inquiry_routing_type === 'dealio_inbox' ? 'dealio' : 'seller',
        featured_image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase.from('listings').update(payload).eq('id', listingId);
      if (updateError) throw updateError;

      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!form && !error) return <div className="container" style={{padding: 100, textAlign: 'center'}}><div className="spinner"></div><p>Loading listing details...</p></div>;

  if (done) {
    return (
      <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
        <div style={{fontSize: 64, marginBottom: 24}}>✅</div>
        <h1 style={{fontSize: 32, marginBottom: 16}}>Listing Updated!</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: 32}}>Your changes have been saved successfully.</p>
        <button className="btn btn-primary btn-lg" onClick={() => router.push('/seller/listings')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wizard}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Edit Listing</h1>
            <span className={styles.stepBadge}>Step {step + 1} of {STEPS.length}</span>
          </div>
          <p className={styles.subtitle}>{STEPS[step]}</p>
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {step === 0 && (
          <div className={styles.stepContent}>
            <div className={styles.field}>
              <label>Business Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Short Summary</label>
              <textarea value={form.short_summary} onChange={e => set('short_summary', e.target.value)} />
            </div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Industry</label>
                <select value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Year Established</label>
                <input type="number" value={form.year_established} onChange={e => set('year_established', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.grid}>
              <div className={styles.field}><label>Asking Price ($)</label><input type="number" value={form.asking_price} onChange={e => set('asking_price', e.target.value)} /></div>
              <div className={styles.field}><label>Annual Revenue ($)</label><input type="number" value={form.annual_revenue} onChange={e => set('annual_revenue', e.target.value)} /></div>
              <div className={styles.field}><label>Cash Flow ($)</label><input type="number" value={form.cash_flow} onChange={e => set('cash_flow', e.target.value)} /></div>
              <div className={styles.field}><label>EBITDA ($)</label><input type="number" value={form.ebitda} onChange={e => set('ebitda', e.target.value)} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.field}><label>Full Description</label><textarea style={{height:150}} value={form.full_description} onChange={e => set('full_description', e.target.value)} /></div>
            <div className={styles.grid}>
              <div className={styles.field}><label>Location (City)</label><input type="text" value={form.city} onChange={e => set('city', e.target.value)} /></div>
              <div className={styles.field}>
                <label>Province/State</label>
                <select value={form.province_state} onChange={e => set('province_state', e.target.value)}>
                  <option value="">Select</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.field}>
              <label>Update Featured Image</label>
              {form.featured_image_url && (
                <div style={{marginBottom: 16}}>
                  <p style={{fontSize: 12, color: 'var(--text-tertiary)'}}>Current image:</p>
                  <img src={form.featured_image_url} alt="Current" style={{width: 100, height: 60, objectFit: 'cover', borderRadius: 8}} />
                </div>
              )}
              <label className={styles.fileUpload}>
                <input type="file" accept="image/*" onChange={e => setFeaturedImage(e.target.files[0])} />
                <p>{featuredImage ? featuredImage.name : 'Choose a new photo to replace current one'}</p>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepContent}>
            <label>Lead Handling</label>
            <div className={styles.radioGrid}>
              <div className={`${styles.radioCard} ${form.inquiry_routing_type === 'direct_to_seller' ? styles.radioActive : ''}`} onClick={() => set('inquiry_routing_type', 'direct_to_seller')}>
                <div className={styles.radioIcon}>✉️</div>
                <div className={styles.radioTitle}>Direct to Me</div>
              </div>
              <div className={`${styles.radioCard} ${form.inquiry_routing_type === 'dealio_inbox' ? styles.radioActive : ''}`} onClick={() => set('inquiry_routing_type', 'dealio_inbox')}>
                <div className={styles.radioIcon}>🛡️</div>
                <div className={styles.radioTitle}>Dealio Managed</div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepContent}>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewSection}><h3>Business</h3><p>{form.title} ({form.industry})</p></div>
              <div className={styles.reviewSection}><h3>Financials</h3><p>Price: ${form.asking_price} | Revenue: ${form.annual_revenue}</p></div>
            </div>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:16}}>Review your changes before saving. The listing status will remain unchanged.</p>
          </div>
        )}

        <div className={styles.stepNav}>
          <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} >Next →</button>
          ) : (
            <button className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditListingPage(props) {
  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center'}}><div className="spinner"></div><p>Loading...</p></div>}>
      <EditListingWizard {...props} />
    </Suspense>
  );
}
