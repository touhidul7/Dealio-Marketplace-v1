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
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Create Account'}
          </button>
        </form>
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
