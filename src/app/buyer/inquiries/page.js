'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo, INQUIRY_STATUSES } from '@/lib/constants';

export default function BuyerInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('inquiries').select('*, listings(title)').eq('buyer_user_id', user.id).order('created_at', { ascending: false });
      setInquiries(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">My Inquiries</h1>
        <p className="page-subtitle">Track the status of businesses you've contacted</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
        ) : inquiries.length === 0 ? (
          <div className="empty-state">You haven't made any inquiries yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Listing</th><th>Message Sent</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td style={{fontSize:14}}><Link href={`/listings/${inq.listing_id}`} style={{color:'var(--primary)',fontWeight:600,textDecoration:'none'}}>{inq.listings?.title}</Link></td>
                    <td style={{fontSize:13,color:'var(--text-secondary)',maxWidth:300,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{inq.message}</td>
                    <td><span className={`badge badge-${INQUIRY_STATUSES[inq.inquiry_status]?.color || 'gray'}`}>{INQUIRY_STATUSES[inq.inquiry_status]?.label}</span></td>
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
