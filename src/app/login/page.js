'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    // Use the user from the sign-in response directly — do NOT call getUser() again
    const user = data?.user;
    if (user) {
      // Check if user has MFA (TOTP) factors enrolled
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const hasMFA = factorsData?.totp?.length > 0;

      if (hasMFA) {
        // User has 2FA enabled — redirect to MFA verify page
        const mfaUrl = new URL('/auth/mfa-verify', window.location.origin);
        if (redirect) mfaUrl.searchParams.set('redirect', redirect);
        router.push(mfaUrl.pathname + mfaUrl.search);
        return;
      }

      // No MFA — proceed with normal role-based redirect
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (redirect) { router.push(redirect); }
      else if (profile?.role === 'admin') { router.push('/admin'); }
      else if (profile?.role === 'advisor') { router.push('/advisor'); }
      else if (profile?.role === 'seller') { router.push('/seller'); }
      else { router.push('/buyer'); }
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--primary)"/><path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </Link>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSub}>Sign in to your Dealio account</p>
        </div>
        {error && <div className={styles.authError}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Password</label>
              <Link href="/forgot-password" className={styles.authLink} style={{ fontSize: '13px' }}>Forgot password?</Link>
            </div>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: 12 }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Sign In'}
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
            if (redirect) redirectUrl.searchParams.set('next', redirect);
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
          <p>Don't have an account? <Link href="/signup" className={styles.authLink}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.authPage}><div className="spinner"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
