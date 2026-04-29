import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PACKAGES } from '@/lib/constants';
import styles from './select.module.css';

export default async function SelectListingPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const pkgId = searchParams.package || 'pro';
  const pkg = PACKAGES.find(p => p.id === pkgId);

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, package_type')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container" style={{ padding: '80px 20px', maxWidth: 800 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Pick Your Listing</h1>
        <p style={{ color: 'var(--text-secondary)' }}>You've selected the <strong>{pkg?.name}</strong> package. Where should we apply it?</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Option 1: New Listing */}
        <Link href={`/seller/listings/new?package=${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.optionCard}>
            <div style={{ fontSize: 40 }}>🆕</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 4 }}>Create a New Listing</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start fresh and apply the {pkg?.name} package to a new business listing.</p>
            </div>
            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Get Started →</div>
          </div>
        </Link>

        {/* Option 2: Existing Listings */}
        {listings?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upgrade Existing Listing</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {listings.map(l => (
                <Link key={l.id} href={`/seller/upgrade?package=${pkgId}&listingId=${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.listingRow}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{l.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Current Plan: <span style={{ textTransform: 'capitalize' }}>{l.package_type}</span></div>
                    </div>
                    <div style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 500 }}>Select →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <Link href="/pricing" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>← Go back to pricing</Link>
      </div>
    </div>
  );
}
