'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo, INQUIRY_STATUSES } from '@/lib/constants';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('inquiries').select('*, listings(title)').order('created_at', { ascending: false });
      setInquiries(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">All Inquiries</h1>
        <p className="page-subtitle">Monitor marketplace communication</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
        ) : inquiries.length === 0 ? (
          <div className="empty-state">No inquiries found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Buyer Info</th><th>Listing</th><th>Status</th><th>Flags</th><th>Time</th></tr></thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td><strong>{inq.anonymous_name || 'Registered Buyer'}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{inq.anonymous_email}</span></td>
                    <td style={{fontSize:13}}><Link href={`/listings/${inq.listing_id}`} target="_blank" style={{color:'var(--primary)',textDecoration:'underline'}}>{inq.listings?.title}</Link></td>
                    <td><span className={`badge badge-${INQUIRY_STATUSES[inq.inquiry_status]?.color || 'gray'}`}>{INQUIRY_STATUSES[inq.inquiry_status]?.label}</span></td>
                    <td>
                      <div style={{display:'flex',gap:4,flexDirection:'column'}}>
                        {inq.wants_acquisition_support && <span className="badge badge-primary" style={{fontSize:10}}>Advisory</span>}
                        {inq.needs_financing && <span className="badge badge-warning" style={{fontSize:10}}>Financing</span>}
                      </div>
                    </td>
                    <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(inq.created_at)}</td>
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
