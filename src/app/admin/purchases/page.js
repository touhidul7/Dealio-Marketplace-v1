'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/constants';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data } = await supabase
        .from('package_purchases')
        .select(`
          *,
          users ( email, full_name ),
          listings ( title )
        `)
        .order('created_at', { ascending: false });
        
      if (data) setPurchases(data);
      setLoading(false);
    };
    fetchPurchases();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Purchases & Revenue</h1>
          <p className="page-subtitle">Track listing upgrades and service payments</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        ) : purchases.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No purchases found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>USER</th>
                  <th>PRODUCT</th>
                  <th>LISTING</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.users?.full_name || 'User'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{p.users?.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span className="badge badge-primary">{p.product_name || p.product_type}</span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.listings?.title || '-'}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td>
                      <span className={`badge ${p.payment_status === 'completed' ? 'badge-success' : 'badge-secondary'}`}>
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
