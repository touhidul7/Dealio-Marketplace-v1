'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { INDUSTRIES, PROVINCES, COUNTRIES, PACKAGES } from '@/lib/constants';
import styles from './wizard.module.css';

const STEPS = [
  'Business Basics', 'Financial Info', 'Business Details',
  'Uploads', 'Lead Routing', 'Review'
];

const EMPTY = {
  title: '', short_summary: '', full_description: '', industry: '', sub_industry: '',
  city: '', province_state: '', country: 'Canada', confidentiality_mode: 'public',
  asking_price: '', asking_price_min: '', asking_price_max: '', annual_revenue: '',
  ebitda: '', cash_flow: '', inventory_included: false, real_estate_included: false,
  reason_for_sale: '', highlights: '', ideal_buyer: '', growth_opportunities: '',
  owner_role: '', employees_count: '', year_established: '',
  inquiry_routing_type: 'direct_to_seller',
};

function NewListingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [userPlan, setUserPlan] = useState('basic');
  const [listingCount, setListingCount] = useState(0);
  const [planLoading, setPlanLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user } = useAuth();

  // Fetch user plan and current listing count
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: profile }, { data: listings }] = await Promise.all([
        supabase.from('users').select('package_type, package_expiry').eq('id', user.id).single(),
        supabase.from('listings').select('id').eq('owner_user_id', user.id),
      ]);
      
      // Check if plan is expired
      const isExpired = profile?.package_expiry && new Date(profile.package_expiry) < new Date();
      setUserPlan(isExpired ? 'basic' : (profile?.package_type || 'basic'));
      setListingCount(listings?.length || 0);
      setPlanLoading(false);
    };
    load();
  }, [user]);

  const currentPkg = PACKAGES.find(p => p.id === userPlan) || PACKAGES[0];
  const canCreateListing = listingCount < currentPkg.listingLimit;

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
      if (!user) { setError('Not authenticated. Please log in.'); setSaving(false); return; }
      if (!canCreateListing) {
        setError(`Your ${currentPkg.name} plan allows ${currentPkg.listingLimit} listing(s). Please upgrade to create more.`);
        setSaving(false);
        return;
      }

      let imageUrl = null;
      if (featuredImage) { imageUrl = await uploadImage(featuredImage, user.id); }

      // Sanitize numeric fields: convert empty strings to null
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
        ...sanitizedForm,
        owner_user_id: user.id,
        owner_type: 'seller',
        lead_owner_type: form.inquiry_routing_type === 'dealio_inbox' ? 'dealio' : 'seller',
        status: 'pending_review',
        featured_image_url: imageUrl,
        package_type: userPlan,
        is_featured: currentPkg.isFeatured,
        is_verified: currentPkg.isVerified,
      };

      const { data, error: submitError } = await supabase.from('listings').insert(payload).select().single();
      if (submitError) throw submitError;

      setCreatedId(data.id);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (planLoading) {
    return (
      <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
        <div className="spinner"></div>
        <p>Loading your plan details...</p>
      </div>
    );
  }

  // Show upgrade wall if listing limit reached
  if (!canCreateListing) {
    return (
      <div className="container" style={{padding: '80px 0', textAlign: 'center', maxWidth: 600, margin: '0 auto'}}>
        <div style={{fontSize: 64, marginBottom: 24}}>🔒</div>
        <h1 style={{fontSize: 28, marginBottom: 12}}>Listing Limit Reached</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: 8, fontSize: 16}}>
          Your <strong style={{textTransform: 'capitalize'}}>{currentPkg.name}</strong> plan allows up to <strong>{currentPkg.listingLimit}</strong> listing{currentPkg.listingLimit > 1 ? 's' : ''}.
        </p>
        <p style={{color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16}}>
          You currently have <strong>{listingCount}</strong> listing{listingCount > 1 ? 's' : ''}. Upgrade your plan to create more.
        </p>
        <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
          <Link href="/pricing" className="btn btn-primary btn-lg">Upgrade Plan</Link>
          <Link href="/seller/listings" className="btn btn-secondary btn-lg">My Listings</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
        <div style={{fontSize: 64, marginBottom: 24}}>🎉</div>
        <h1 style={{fontSize: 32, marginBottom: 16}}>Listing Submitted!</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px'}}>Your listing has been sent to our team for review. It typically goes live within 24 hours.</p>
        <button className="btn btn-primary btn-lg" onClick={() => router.push('/seller/listings')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wizard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>List Your Business</h1>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <span className="badge badge-primary" style={{textTransform: 'capitalize'}}>{userPlan} Plan</span>
              <span className={styles.stepBadge}>Step {step + 1} of {STEPS.length}</span>
            </div>
          </div>
          <p className={styles.subtitle}>{STEPS[step]}</p>
          
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Content */}
        {error && <div className={styles.error}>{error}</div>}

        {step === 0 && (
          <div className={styles.stepContent}>
            <div className={styles.field}>
              <label>Business Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Profitable Downtown Coffee Shop" />
            </div>
            <div className={styles.field}>
              <label>Short Summary</label>
              <textarea value={form.short_summary} onChange={e => set('short_summary', e.target.value)} placeholder="A one-sentence hook for buyers" />
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
                <input type="number" value={form.year_established} onChange={e => set('year_established', e.target.value)} placeholder="YYYY" />
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
              <label>Featured Image</label>
              <label className={styles.fileUpload}>
                <input type="file" accept="image/*" onChange={e => setFeaturedImage(e.target.files[0])} />
                <p>{featuredImage ? featuredImage.name : 'Choose a photo to represent your business'}</p>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepContent}>
            <label>How do you want to handle inquiries?</label>
            <div className={styles.radioGrid}>
              <div className={`${styles.radioCard} ${form.inquiry_routing_type === 'direct_to_seller' ? styles.radioActive : ''}`} onClick={() => set('inquiry_routing_type', 'direct_to_seller')}>
                <div className={styles.radioIcon}>✉️</div>
                <div className={styles.radioTitle}>Direct to Me</div>
                <div className={styles.radioDesc}>I will handle all buyer communications personally.</div>
              </div>
              <div className={`${styles.radioCard} ${form.inquiry_routing_type === 'dealio_inbox' ? styles.radioActive : ''}`} onClick={() => set('inquiry_routing_type', 'dealio_inbox')}>
                <div className={styles.radioIcon}>🛡️</div>
                <div className={styles.radioTitle}>Dealio Managed</div>
                <div className={styles.radioDesc}>Dealio screens buyers first to ensure they are qualified.</div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepContent}>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewSection}><h3>Business</h3><dl>{[['Title', form.title],['Industry', form.industry],['Location', `${form.city}, ${form.province_state}`]].map(([k,v])=><div key={k} className={styles.reviewRow}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
              <div className={styles.reviewSection}><h3>Financials</h3><dl>{[['Asking Price', form.asking_price],['Revenue', form.annual_revenue],['EBIDTA', form.ebitda]].map(([k,v])=><div key={k} className={styles.reviewRow}><dt>{k}</dt><dd>${v}</dd></div>)}</dl></div>
              <div className={styles.reviewSection}><h3>Settings</h3><dl>{[['Plan', userPlan],['Routing', form.inquiry_routing_type],['Featured Image', featuredImage ? featuredImage.name : 'None'],['Featured Badge', currentPkg.isFeatured ? '✅ Yes' : '❌ No'],['Verified Badge', currentPkg.isVerified ? '✅ Yes' : '❌ No']].map(([k,v])=><div key={k} className={styles.reviewRow}><dt>{k}</dt><dd style={{textTransform:'capitalize'}}>{v}</dd></div>)}</dl></div>
            </div>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:16}}>Your listing will be submitted for review. It typically goes live within 24 hours.</p>
            {userPlan === 'basic' && (
              <div style={{marginTop: 16, padding: 16, background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 12, border: '1px solid rgba(var(--primary-rgb), 0.15)'}}>
                <p style={{fontSize: 14, color: 'var(--text-secondary)', margin: 0}}>
                  💡 <strong>Want more visibility?</strong> <Link href="/pricing" style={{color: 'var(--primary)', textDecoration: 'underline'}}>Upgrade to Pro or Premium</Link> for priority placement, featured badges, and more listings.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className={styles.stepNav}>
          <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => { if (!form.title && step === 0) { setError('Please enter a listing title'); return; } setError(''); setStep(s => s + 1); }} >Next →</button>
          ) : (
            <button className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <><span className="spinner"></span> Processing...</>
              ) : (
                '🚀 Submit Listing'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center'}}><div className="spinner"></div><p>Loading wizard...</p></div>}>
      <NewListingWizard />
    </Suspense>
  );
}
