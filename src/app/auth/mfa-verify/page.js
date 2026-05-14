'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../../auth.module.css';

function MFAVerifyForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState(null);
  const inputRefs = useRef([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const supabase = createClient();

  useEffect(() => {
    // Get the user's TOTP factor
    const getFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setError('Failed to load MFA factors. Please try logging in again.');
        return;
      }
      const totpFactor = data?.totp?.[0];
      if (!totpFactor) {
        // No MFA factor found — user shouldn't be here
        router.push(redirect || '/');
        return;
      }
      setFactorId(totpFactor.id);
    };
    getFactors();
    // Auto-focus first input
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newCode = [...code];
    newCode[index] = value.slice(-1); // single digit
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    if (!factorId) {
      setError('MFA factor not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) {
        setError(challengeError.message);
        setLoading(false);
        return;
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: codeStr,
      });

      if (verifyError) {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // MFA verified — redirect to appropriate dashboard
      if (redirect) {
        router.push(redirect);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
          if (profile?.role === 'admin') router.push('/admin');
          else if (profile?.role === 'advisor') router.push('/advisor');
          else if (profile?.role === 'seller') router.push('/seller');
          else router.push('/buyer');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.every(d => d !== '') && factorId && !loading) {
      handleVerify();
    }
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--primary)"/><path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </Link>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>
          <h1 className={styles.authTitle}>Two-Factor Authentication</h1>
          <p className={styles.authSub}>Enter the 6-digit code from your authenticator app</p>
        </div>

        {error && <div className={styles.authError}>{error}</div>}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: '48px',
                height: '56px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: '700',
                borderRadius: '12px',
                border: '2px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                fontFamily: 'var(--font-mono, monospace)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginBottom: '12px' }}
          disabled={loading || code.some(d => d === '')}
        >
          {loading ? <span className="spinner"></span> : 'Verify Code'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Open your authenticator app (Google Authenticator, Authy, etc.) to get your verification code.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MFAVerifyPage() {
  return (
    <Suspense fallback={<div className={styles.authPage}><div className="spinner"></div></div>}>
      <MFAVerifyForm />
    </Suspense>
  );
}
