'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import DashLayout from '@/components/DashLayout/DashLayout';

export default function SettingsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      
      let companyName = '';
      if (userRole === 'buyer') {
        const { data } = await supabase.from('buyer_profiles').select('company_name').eq('user_id', user.id).single();
        if (data) companyName = data.company_name;
      } else if (userRole === 'seller') {
        const { data } = await supabase.from('seller_profiles').select('business_name').eq('user_id', user.id).single();
        if (data) companyName = data.business_name;
      } else if (userRole === 'broker') {
        const { data } = await supabase.from('broker_profiles').select('brokerage_name').eq('user_id', user.id).single();
        if (data) companyName = data.brokerage_name;
      }

      if (userData) {
        setFormData({
          full_name: userData.full_name || '',
          company_name: companyName || '',
          phone: userData.phone || '',
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, userRole, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    let profileError = null;
    if (!userError) {
      if (userRole === 'buyer') {
        const { data, error } = await supabase.from('buyer_profiles').update({ company_name: formData.company_name, updated_at: new Date().toISOString() }).eq('user_id', user.id).select();
        if (!error && (!data || data.length === 0)) {
          const { error: insertErr } = await supabase.from('buyer_profiles').insert({ user_id: user.id, company_name: formData.company_name });
          profileError = insertErr;
        } else { profileError = error; }
      } else if (userRole === 'seller') {
        const { data, error } = await supabase.from('seller_profiles').update({ business_name: formData.company_name, updated_at: new Date().toISOString() }).eq('user_id', user.id).select();
        if (!error && (!data || data.length === 0)) {
          const { error: insertErr } = await supabase.from('seller_profiles').insert({ user_id: user.id, business_name: formData.company_name });
          profileError = insertErr;
        } else { profileError = error; }
      } else if (userRole === 'broker') {
        const { data, error } = await supabase.from('broker_profiles').update({ brokerage_name: formData.company_name, updated_at: new Date().toISOString() }).eq('user_id', user.id).select();
        if (!error && (!data || data.length === 0)) {
          const { error: insertErr } = await supabase.from('broker_profiles').insert({ user_id: user.id, brokerage_name: formData.company_name });
          profileError = insertErr;
        } else { profileError = error; }
      }
    }

    if (!userError && !profileError) {
      await supabase.auth.updateUser({ data: { full_name: formData.full_name } });
      setMessage('Profile updated successfully!');
    } else {
      const err = userError || profileError;
      console.error("Profile update error:", err);
      setMessage(`Failed to update profile: ${err?.message || 'Please try again.'}`);
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <DashLayout role={userRole || 'buyer'}>
        <div style={{ padding: 80, textAlign: 'center' }}>Loading settings...</div>
      </DashLayout>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid var(--border)',
    fontSize: 15,
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const groupStyle = { marginBottom: 20 };
  const labelStyle = { display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' };

  return (
    <DashLayout role={userRole}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Update your personal and business details</p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <form onSubmit={handleSubmit}>
            <div style={groupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input type="text" style={{ ...inputStyle, backgroundColor: 'var(--gray-50)', color: 'var(--text-tertiary)' }} value={user?.email || ''} disabled />
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Email cannot be changed.</p>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" style={inputStyle} value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Company / Brokerage</label>
              <input type="text" style={inputStyle} value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="Your Company Name" />
            </div>

            {message && (
              <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 14, backgroundColor: message.includes('success') ? '#f0fdf4' : '#fef2f2', color: message.includes('success') ? '#15803d' : '#b91c1c', border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}` }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
              <button type="button" onClick={() => window.history.back()} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashLayout>
  );
}
