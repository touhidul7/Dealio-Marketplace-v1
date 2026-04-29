'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PACKAGES } from '@/lib/constants';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const supabase = createClient();

  const pkgId = searchParams.get('package');
  const pkg = PACKAGES.find(p => p.id === pkgId);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          console.log('No user found, redirecting to signup...');
          router.push(`/signup?role=seller&package=${pkgId || 'pro'}`);
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setCheckingAuth(false);
        setLoading(false);
      }
    };
    checkUser();
  }, [supabase, router, pkgId]);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      // Final sanity check for user session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Your session has expired. Please log in again.');
      if (!pkg || pkg.price === 0) throw new Error('Invalid package');

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId, userId: user.id }),
      });

      const { url, error: stripeError } = await res.json();
      if (stripeError) throw new Error(stripeError);
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Could not create checkout session');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (!pkg || pkg.price === 0) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Invalid Package</h2>
        <p>Please go back to the pricing page and select a valid plan.</p>
        <button className="btn btn-primary" onClick={() => router.push('/pricing')}>Back to Pricing</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '80px 20px', maxWidth: 600 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-xl)' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Checkout</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Review your plan and proceed to payment.</p>

        <div style={{ background: 'var(--gray-50)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>{pkg.name} Plan</span>
            <span style={{ fontWeight: 800, fontSize: 20 }}>${pkg.price}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)' }}>{pkg.period}</span></span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {pkg.features.map((f, i) => (
              <li key={i} style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {error && <div style={{ color: '#B91C1C', background: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 14 }}>{error}</div>}

        <button 
          className="btn btn-primary btn-lg" 
          style={{ width: '100%' }} 
          onClick={handleCheckout}
          disabled={loading || checkingAuth}
        >
          {loading ? (checkingAuth ? 'Checking Auth...' : 'Processing...') : `Pay $${pkg.price} with Stripe`}
        </button>

        {/* Dev Mode Simulation Button */}
        <button 
          className="btn btn-secondary btn-sm" 
          style={{ width: '100%', marginTop: 12, borderStyle: 'dashed' }} 
          onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch('/api/dev/simulate-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: pkgId, userId: user.id }),
              });
              const data = await res.json();
              if (data.success) {
                router.push('/seller/services?success=true');
              } else {
                throw new Error(data.error);
              }
            } catch (err) {
              setError('Simulation failed: ' + err.message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          🛠️ Simulate Success (Dev Mode)
        </button>
        
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16 }}>
          By clicking pay, you agree to our terms and conditions. Your subscription will start immediately.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
