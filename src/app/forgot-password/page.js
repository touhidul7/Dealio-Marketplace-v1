'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Password reset link sent! Check your email.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link.</p>
        </div>

        {error && <div className={styles.authError}>{error}</div>}
        {message && (
          <div style={{ padding: '12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className={styles.authForm}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Send Reset Link'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>Remember your password? <Link href="/login" className={styles.authLink}>Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
