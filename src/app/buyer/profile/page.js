'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { INDUSTRIES, PROVINCES, BUYER_TYPES } from '@/lib/constants';
import styles from './profile.module.css';

export default function BuyerProfilePage() {
  const [form, setForm] = useState({ company_name: '', buyer_type: '', industry_focus: [], geographic_focus: [], deal_size_min: '', deal_size_max: '', revenue_min: '', revenue_max: '', ebitda_min: '', ebitda_max: '', acquisition_timeline: '', source_of_funds: '', financing_required: false, interested_in_jv: false, operator_needed: false, willing_to_relocate: false, acquisition_experience: '', additional_notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedFlag] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('buyer_profiles').select('*').eq('user_id', user.id).single();
      if (data) setForm(f => ({ ...f, ...data, industry_focus: data.industry_focus || [], geographic_focus: data.geographic_focus || [] }));
      setLoading(false);
    };
    load();
  }, []);

  const toggleArr = (field, val) => setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcCompletion = () => {
    const fields = ['buyer_type', 'industry_focus', 'geographic_focus', 'deal_size_min', 'deal_size_max', 'acquisition_timeline', 'source_of_funds'];
    const filled = fields.filter(k => { const v = form[k]; return Array.isArray(v) ? v.length > 0 : !!v; }).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const completion = calcCompletion();
    const payload = { ...form, user_id: user.id, profile_completion_percent: completion, deal_size_min: form.deal_size_min ? Number(form.deal_size_min) : null, deal_size_max: form.deal_size_max ? Number(form.deal_size_max) : null, revenue_min: form.revenue_min ? Number(form.revenue_min) : null, revenue_max: form.revenue_max ? Number(form.revenue_max) : null, ebitda_min: form.ebitda_min ? Number(form.ebitda_min) : null, ebitda_max: form.ebitda_max ? Number(form.ebitda_max) : null };
    const { data: upsertData, error } = await supabase.from('buyer_profiles').upsert(payload, { onConflict: 'user_id', returning: 'representation' }).select().single();
    
    // Trigger matching engine in background
    if (upsertData) {
      fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate_buyer', buyerProfileId: upsertData.id })
      }).catch(console.error);
    }

    setSavedFlag(true);
    setSaving(false);
    setTimeout(() => setSavedFlag(false), 3000);
  };

  if (loading) return <div className="skeleton" style={{ height: 500, borderRadius: 16 }}></div>;

  const completion = calcCompletion();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h1 className="page-title">Buyer Profile</h1><p className="page-subtitle">Define your acquisition criteria to get matched with relevant listings</p></div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner"></span> : saved ? '✓ Saved!' : 'Save Profile'}</button>
      </div>

      <div className={styles.completionBar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Profile Completion</span>
          <span style={{ fontWeight: 700, color: completion >= 80 ? 'var(--accent)' : 'var(--primary)' }}>{completion}%</span>
        </div>
        <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${completion}%` }}></div></div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Buyer Type</h2>
          <div className={styles.btnGroup}>
            {BUYER_TYPES.map(t => (
              <button key={t.value} type="button" className={`${styles.toggleBtn} ${form.buyer_type === t.value ? styles.toggleBtnActive : ''}`} onClick={() => set('buyer_type', t.value)}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Industry Focus</h2>
          <p className={styles.cardHint}>Select all industries you're interested in</p>
          <div className={styles.tagGroup}>
            {INDUSTRIES.map(ind => (
              <button key={ind} type="button" className={`${styles.tag} ${form.industry_focus.includes(ind) ? styles.tagActive : ''}`} onClick={() => toggleArr('industry_focus', ind)}>{ind}</button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Geographic Focus</h2>
          <div className={styles.tagGroup}>
            {PROVINCES.map(p => (
              <button key={p} type="button" className={`${styles.tag} ${form.geographic_focus.includes(p) ? styles.tagActive : ''}`} onClick={() => toggleArr('geographic_focus', p)}>{p}</button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Deal Size Criteria</h2>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Min Deal Size (CAD)</label><input type="number" className="form-input" value={form.deal_size_min} onChange={e => set('deal_size_min', e.target.value)} placeholder="e.g. 500000" /></div>
            <div className="form-group"><label className="form-label">Max Deal Size (CAD)</label><input type="number" className="form-input" value={form.deal_size_max} onChange={e => set('deal_size_max', e.target.value)} placeholder="e.g. 5000000" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Revenue Min</label><input type="number" className="form-input" value={form.revenue_min} onChange={e => set('revenue_min', e.target.value)} placeholder="e.g. 300000" /></div>
            <div className="form-group"><label className="form-label">Revenue Max</label><input type="number" className="form-input" value={form.revenue_max} onChange={e => set('revenue_max', e.target.value)} placeholder="e.g. 3000000" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">EBITDA Min</label><input type="number" className="form-input" value={form.ebitda_min} onChange={e => set('ebitda_min', e.target.value)} placeholder="e.g. 100000" /></div>
            <div className="form-group"><label className="form-label">EBITDA Max</label><input type="number" className="form-input" value={form.ebitda_max} onChange={e => set('ebitda_max', e.target.value)} placeholder="e.g. 1000000" /></div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Timeline & Background</h2>
          <div className="form-group">
            <label className="form-label">Acquisition Timeline</label>
            <select className="form-select" value={form.acquisition_timeline} onChange={e => set('acquisition_timeline', e.target.value)}>
              <option value="">Select timeline</option>
              <option value="0-3 months">0–3 months (actively looking)</option>
              <option value="3-6 months">3–6 months</option>
              <option value="6-12 months">6–12 months</option>
              <option value="1-2 years">1–2 years</option>
              <option value="2+ years">2+ years (exploring)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Source of Funds</label>
            <select className="form-select" value={form.source_of_funds} onChange={e => set('source_of_funds', e.target.value)}>
              <option value="">Select source</option>
              <option value="personal_savings">Personal Savings</option>
              <option value="sba_loan">SBA / BDC Loan</option>
              <option value="private_equity">Private Equity</option>
              <option value="seller_financing">Seller Financing</option>
              <option value="investors">Outside Investors</option>
              <option value="combination">Combination</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Acquisition Experience</label>
            <select className="form-select" value={form.acquisition_experience} onChange={e => set('acquisition_experience', e.target.value)}>
              <option value="">Select experience level</option>
              <option value="first_time">First-time buyer</option>
              <option value="1-2_previous">1–2 previous acquisitions</option>
              <option value="3+_previous">3+ previous acquisitions</option>
              <option value="serial_acquirer">Serial acquirer</option>
            </select>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Preferences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label className="form-checkbox"><input type="checkbox" checked={form.financing_required} onChange={e => set('financing_required', e.target.checked)} /><span>I require financing support</span></label>
            <label className="form-checkbox"><input type="checkbox" checked={form.interested_in_jv} onChange={e => set('interested_in_jv', e.target.checked)} /><span>Open to Joint Ventures</span></label>
            <label className="form-checkbox"><input type="checkbox" checked={form.operator_needed} onChange={e => set('operator_needed', e.target.checked)} /><span>I need an operator / management team</span></label>
            <label className="form-checkbox"><input type="checkbox" checked={form.willing_to_relocate} onChange={e => set('willing_to_relocate', e.target.checked)} /><span>Willing to relocate</span></label>
          </div>
          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">Additional Notes</label>
            <textarea className="form-textarea" value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} placeholder="Any other criteria, preferences, or information about yourself as a buyer..." />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner"></span> : saved ? '✓ Profile Saved!' : 'Save Profile'}</button>
      </div>
    </div>
  );
}
