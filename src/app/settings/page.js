'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import DashLayout from '@/components/DashLayout/DashLayout';

// ─── 2FA Security Section ─────────────────────────────────────────
function TwoFactorSection() {
  const supabase = createClient();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factors, setFactors] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const loadFactors = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      const verifiedFactors = data.totp?.filter(f => f.status === 'verified') || [];
      setFactors(verifiedFactors);
      setMfaEnabled(verifiedFactors.length > 0);
    }
    setLoading(false);
  };

  useEffect(() => { loadFactors(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnroll = async () => {
    setEnrolling(true);
    setMessage({ type: '', text: '' });
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Dealio Authenticator',
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
        setEnrolling(false);
        return;
      }
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to start enrollment. Please try again.' });
      setEnrolling(false);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (verifyCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code.' });
      return;
    }
    setVerifying(true);
    setMessage({ type: '', text: '' });
    try {
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) {
        setMessage({ type: 'error', text: challengeErr.message });
        setVerifying(false);
        return;
      }
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyErr) {
        setMessage({ type: 'error', text: 'Invalid code. Please check and try again.' });
        setVerifying(false);
        return;
      }
      setMessage({ type: 'success', text: '2FA has been enabled successfully! Your account is now more secure.' });
      setEnrolling(false);
      setQrCode(null);
      setSecret('');
      setVerifyCode('');
      setFactorId(null);
      await loadFactors();
    } catch (err) {
      setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
    }
    setVerifying(false);
  };

  const handleCancelEnroll = async () => {
    if (factorId) {
      await supabase.auth.mfa.unenroll({ factorId });
    }
    setEnrolling(false);
    setQrCode(null);
    setSecret('');
    setVerifyCode('');
    setFactorId(null);
    setMessage({ type: '', text: '' });
  };

  const handleUnenroll = async (fId) => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return;
    setUnenrolling(true);
    setMessage({ type: '', text: '' });
    const { error } = await supabase.auth.mfa.unenroll({ factorId: fId });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: '2FA has been disabled.' });
      await loadFactors();
    }
    setUnenrolling(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Loading security settings...
      </div>
    );
  }

  return (
    <div>
      {/* Status Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: mfaEnabled ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {mfaEnabled ? '🛡️' : '⚠️'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Two-Factor Authentication
            </div>
            <div style={{ fontSize: 13, color: mfaEnabled ? '#059669' : '#dc2626', fontWeight: 600 }}>
              {mfaEnabled ? '✓ Enabled' : '✗ Not enabled'}
            </div>
          </div>
        </div>
        {mfaEnabled && factors.length > 0 && !enrolling && (
          <button
            onClick={() => handleUnenroll(factors[0].id)}
            className="btn btn-secondary btn-sm"
            disabled={unenrolling}
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            {unenrolling ? 'Disabling...' : 'Disable 2FA'}
          </button>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14,
          background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: message.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Not enrolled — show enable button */}
      {!mfaEnabled && !enrolling && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Add an extra layer of security to your account. When enabled, you&apos;ll need to enter a code
            from your authenticator app each time you sign in.
          </p>
          <button onClick={handleEnroll} className="btn btn-primary">
            Enable Two-Factor Authentication
          </button>
        </div>
      )}

      {/* Enrollment Flow — QR Code */}
      {enrolling && qrCode && (
        <div>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 12, padding: 24,
            border: '1px solid var(--border)', marginBottom: 20,
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Step 1: Scan QR Code</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator) and scan this QR code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{
                background: '#fff', padding: 16, borderRadius: 12,
                boxShadow: 'var(--shadow-md)',
              }}>
                <img src={qrCode} alt="2FA QR Code" width={200} height={200} />
              </div>
            </div>
            <div style={{
              background: 'var(--surface)', borderRadius: 8, padding: '10px 14px',
              border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                Can&apos;t scan? Enter this code manually:
              </p>
              <code style={{
                fontSize: 14, fontWeight: 700, letterSpacing: '2px',
                color: 'var(--text-primary)', wordBreak: 'break-all',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                {secret}
              </code>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 12, padding: 24,
            border: '1px solid var(--border)', marginBottom: 20,
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Step 2: Verify Code</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Enter the 6-digit code shown in your authenticator app to complete setup.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10,
                  border: '2px solid var(--border)', fontSize: 20,
                  fontWeight: 700, letterSpacing: '6px', textAlign: 'center',
                  background: 'var(--surface)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={handleCancelEnroll} className="btn btn-secondary">Cancel</button>
            <button
              onClick={handleVerifyEnrollment}
              className="btn btn-primary"
              disabled={verifying || verifyCode.length !== 6}
            >
              {verifying ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Already enrolled — show details */}
      {mfaEnabled && !enrolling && (
        <div style={{
          background: '#f0fdf4', borderRadius: 10, padding: 16,
          border: '1px solid #bbf7d0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#15803d' }}>
            <span>✓</span>
            <span style={{ fontWeight: 600 }}>Your account is protected with two-factor authentication.</span>
          </div>
          <p style={{ fontSize: 13, color: '#166534', marginTop: 6, marginLeft: 22 }}>
            You&apos;ll be asked for a verification code from your authenticator app each time you sign in.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────
function SettingsContent() {
  const { user, userRoles, userRole, loading: authLoading } = useAuth();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      const roles = userRoles?.length ? userRoles : [userRole];

      let companyName = '';
      // Fetch the most relevant profile based on roles (priority: seller > broker > buyer)
      if (roles.includes('seller') || roles.includes('business_owner')) {
        const { data } = await supabase.from('seller_profiles').select('business_name').eq('user_id', user.id).single();
        if (data) companyName = data.business_name;
      } else if (roles.includes('broker')) {
        const { data } = await supabase.from('broker_profiles').select('brokerage_name').eq('user_id', user.id).single();
        if (data) companyName = data.brokerage_name;
      } else if (roles.some(r => ['buyer', 'operator', 'strategic_partner'].includes(r))) {
        const { data } = await supabase.from('buyer_profiles').select('company_name').eq('user_id', user.id).single();
        if (data) companyName = data.company_name;
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
  }, [user, userRoles, userRole, supabase]);

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

    const roles = userRoles?.length ? userRoles : [userRole];
    let profileError = null;
    if (!userError) {
      // Update the most relevant profile based on roles (priority: seller > broker > buyer)
      if (roles.includes('seller') || roles.includes('business_owner')) {
        const { data, error } = await supabase.from('seller_profiles').update({ business_name: formData.company_name, updated_at: new Date().toISOString() }).eq('user_id', user.id).select();
        if (!error && (!data || data.length === 0)) {
          const { error: insertErr } = await supabase.from('seller_profiles').insert({ user_id: user.id, business_name: formData.company_name });
          profileError = insertErr;
        } else { profileError = error; }
      } else if (roles.includes('broker')) {
        const { data, error } = await supabase.from('broker_profiles').update({ brokerage_name: formData.company_name, updated_at: new Date().toISOString() }).eq('user_id', user.id).select();
        if (!error && (!data || data.length === 0)) {
          const { error: insertErr } = await supabase.from('broker_profiles').insert({ user_id: user.id, brokerage_name: formData.company_name });
          profileError = insertErr;
        } else { profileError = error; }
      } else if (roles.some(r => ['buyer', 'operator', 'strategic_partner'].includes(r))) {
        const { data, error } = await supabase.from('buyer_profiles').update({ company_name: formData.company_name, updated_at: new Date().toISOString() }).eq('user_id', user.id).select();
        if (!error && (!data || data.length === 0)) {
          const { error: insertErr } = await supabase.from('buyer_profiles').insert({ user_id: user.id, company_name: formData.company_name });
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

  // Determine portal for DashLayout: use primary role mapped to portal
  const roles = userRoles?.length ? userRoles : [userRole || 'buyer'];
  const portalRole = roles.includes('admin') ? 'admin'
    : roles.includes('advisor') ? 'advisor'
    : roles.includes('broker') ? 'broker'
    : (roles.includes('seller') || roles.includes('business_owner')) ? 'seller'
    : 'buyer';

  if (authLoading || loading) {
    return (
      <DashLayout role={portalRole}>
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔐' },
  ];

  return (
    <DashLayout role={portalRole}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your profile and security preferences</p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: 'var(--bg-secondary)', padding: 4, borderRadius: 12,
          border: '1px solid var(--border)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
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
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <TwoFactorSection />
          </div>
        )}
      </div>
    </DashLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>}>
      <SettingsContent />
    </Suspense>
  );
}
