import Link from 'next/link';
import { formatListingPrice } from '@/lib/constants';

export default function SEOListingGrid({ listings }) {
  if (!listings || listings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 30px', background: 'var(--gray-50)', borderRadius: '16px', marginTop: '30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>No public listings match this criteria right now.</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          New businesses are added daily. Sign up for buyer alerts to be the first to know.
        </p>
        <Link href="/signup?role=buyer" className="btn btn-primary">Sign Up for Alerts</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '30px' }}>
      {listings.map(listing => (
        <div key={listing.id} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s',
        }}>
          <div style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-primary">{listing.industry || 'Business'}</span>
              {listing.confidentiality_mode !== 'confidential' && listing.city && (
                <span className="badge badge-gray">📍 {listing.city}{listing.province_state ? `, ${listing.province_state}` : ''}</span>
              )}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
              {listing.confidentiality_mode === 'confidential' ? 'Confidential Listing' : listing.title || 'Business for Sale'}
            </h3>
            {listing.short_summary && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                {listing.short_summary.substring(0, 100)}{listing.short_summary.length > 100 ? '...' : ''}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Asking Price:</strong>
                <span>{formatListingPrice(listing)}</span>
              </div>
              {listing.revenue > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Revenue:</strong>
                  <span>${Number(listing.revenue).toLocaleString()}</span>
                </div>
              )}
              {listing.cash_flow > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Cash Flow:</strong>
                  <span>${Number(listing.cash_flow).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <Link href={`/listings/${listing.id}`} className="btn btn-outline" style={{ width: '100%' }}>View Details →</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
