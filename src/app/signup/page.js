'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

function SignupForm() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get('role');
  const supabase = createClient();

  useEffect(() => {
    if (preselectedRole && form.role !== preselectedRole && ['buyer', 'seller'].includes(preselectedRole)) {
      setForm(f => ({ ...f, role: preselectedRole }));
    }
  }, [preselectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: form.role, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data?.user) {
      if (data.session) {
        // Email confirmation is OFF, user is already logged in
        const role = form.role;
        if (role === 'admin') router.push('/admin');
        else if (role === 'advisor') router.push('/advisor');
        else if (role === 'seller') router.push('/seller');
        else router.push('/buyer');
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
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--primary)"/><path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </Link>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSub}>Join Dealio Marketplace today</p>
        </div>
        {error && <div className={styles.authError}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.roleToggle}>
            <button type="button" className={`${styles.roleBtn} ${form.role === 'buyer' ? styles.roleBtnActive : ''}`} onClick={() => setForm(f => ({ ...f, role: 'buyer' }))}>
              🔍 I'm a Buyer
            </button>
            <button type="button" className={`${styles.roleBtn} ${form.role === 'seller' ? styles.roleBtnActive : ''}`} onClick={() => setForm(f => ({ ...f, role: 'seller' }))}>
              🏢 I'm a Seller
            </button>
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
            if (form.role) redirectUrl.searchParams.set('role', form.role);
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

      {/* Buyer Section */}
      <div className={styles.buyerSection}>
        <div className={styles.buyerCard}>
          <div>
            <span className={styles.buyerLabel}>For Buyers</span>
            <h2 className={styles.buyerTitle}>Browse and Inquire for Free</h2>
            <p className={styles.buyerDesc}>Creating a buyer profile and browsing listings is completely free. Get matched with businesses that fit your criteria automatically.</p>
            <ul className={styles.buyerList}>
              <li>✅ Free buyer profile</li>
              <li>✅ Unlimited listing browsing</li>
              <li>✅ Automatic match notifications</li>
              <li>✅ Save up to 50 listings</li>
              <li>✅ Direct seller inquiries</li>
            </ul>
          </div>
          <div className={styles.buyerCtas}>
            <button className="btn btn-primary btn-lg" onClick={() => setForm(f => ({ ...f, role: 'buyer' }))}>Create Buyer Profile</button>
            <Link href="/listings" className="btn btn-secondary btn-lg">Browse Listings</Link>
          </div>
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
