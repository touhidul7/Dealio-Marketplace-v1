'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function UpgradeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const packageId = searchParams.get('package');
        const listingId = searchParams.get('listingId');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        if (!packageId || !listingId) throw new Error('Missing parameters');

        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId, listingId, userId: user.id }),
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
      }
    };

    startCheckout();
  }, [searchParams, supabase]);

  if (error) {
    return (
      <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
        <div style={{fontSize: 48, marginBottom: 16}}>❌</div>
        <h2>Upgrade Error</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: 24}}>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/seller')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
      <div className="spinner" style={{margin: '0 auto 24px'}}></div>
      <h2>Preparing Checkout...</h2>
      <p style={{color: 'var(--text-secondary)'}}>Redirecting you to our secure payment processor.</p>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpgradeHandler />
    </Suspense>
  );
}
