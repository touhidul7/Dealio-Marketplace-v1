'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SIGNUP_INTENTS, intentsToRoles, getDashboardPath, ROLE_LABELS } from '@/lib/roles';
import styles from '../auth.module.css';

function SignupForm() {
  const [selectedIntents, setSelectedIntents] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Pre-select based on query param (e.g. ?intent=sell_business)
  useEffect(() => {
    const intent = searchParams.get('intent');
    if (intent && SIGNUP_INTENTS.some(i => i.id === intent) && !selectedIntents.includes(intent)) {
      setSelectedIntents([intent]);
    }
    // Legacy support: ?role=seller → pre-select sell intent
    const legacyRole = searchParams.get('role');
    if (legacyRole === 'seller' && selectedIntents.length === 0) {
      setSelectedIntents(['sell_business']);
    } else if (legacyRole === 'buyer' && selectedIntents.length === 0) {
      setSelectedIntents(['buy_business']);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleIntent = (id) => {
    setSelectedIntents(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const derivedRoles = intentsToRoles(selectedIntents);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedIntents.length === 0) {
      setError('Please select at least one option below.');
      return;
    }

    setLoading(true);
    const roles = derivedRoles;
    const primaryRole = roles[0]; // first role for backward compat

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
          role: primaryRole,   // backward compat for trigger
          roles: roles,        // new: full roles array
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data?.user) {
      if (data.session) {
        // Email confirmation is OFF, user is already logged in
        router.push(getDashboardPath(roles));
      } else {
        setSuccess(true);
      }
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.successIcon}>✉️</div>
            <h1 className={styles.authTitle}>Check your email</h1>
            <p className={styles.authSub}>We sent a verification link to <strong>{form.email}</strong>. Click the link to activate your account.</p>
          </div>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard} style={{ maxWidth: 520 }}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--primary)"/><path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </Link>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSub}>Join Dealio Marketplace today</p>
        </div>
        {error && <div className={styles.authError}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          {/* Intent Selection */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: 700,
              marginBottom: 'var(--space-3)',
              color: 'var(--text-primary)',
            }}>
              What are you here to do?
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '13px', marginLeft: 6 }}>
                Select all that apply
              </span>
            </label>
            <div className={styles.intentGrid}>
              {SIGNUP_INTENTS.map(intent => {
                const isSelected = selectedIntents.includes(intent.id);
                return (
                  <button
                    key={intent.id}
                    type="button"
                    className={`${styles.intentCard} ${isSelected ? styles.intentCardActive : ''}`}
                    onClick={() => toggleIntent(intent.id)}
                  >
                    <span className={styles.intentIcon}>{intent.icon}</span>
                    <span className={styles.intentLabel}>{intent.label}</span>
                    {isSelected && (
                      <span className={styles.intentCheck}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            {derivedRoles.length > 0 && (
              <div style={{
                marginTop: 'var(--space-3)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Capabilities:</span>
                {derivedRoles.map(r => (
                  <span
                    key={r}
                    className="badge badge-primary"
                    style={{ fontSize: '10px', padding: '2px 8px', textTransform: 'capitalize' }}
                  >
                    {ROLE_LABELS[r]}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input type="text" className="form-input" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Smith" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span className="required">*</span></label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <input type="password" className="form-input" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: 12 }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <button 
          onClick={async () => {
            const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
            // Pass roles as comma-separated for OAuth redirect
            if (derivedRoles.length > 0) {
              redirectUrl.searchParams.set('roles', derivedRoles.join(','));
            }
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: redirectUrl.toString() }
            });
          }}
          className="btn btn-secondary btn-lg" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div className={styles.authFooter}>
          <p>Already have an account? <Link href="/login" className={styles.authLink}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className={styles.authPage}><div className="spinner"></div></div>}>
      <SignupForm />
    </Suspense>
  );
}
