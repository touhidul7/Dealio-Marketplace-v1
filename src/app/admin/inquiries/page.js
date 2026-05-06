'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo, INQUIRY_STATUSES } from '@/lib/constants';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const [{ data }, { data: advData }] = await Promise.all([
        supabase.from('inquiries').select('*, listings(title), assigned_advisor:users!assigned_advisor_id(email)').order('created_at', { ascending: false }),
        supabase.from('users').select('id, full_name, email').eq('role', 'advisor')
      ]);
      setInquiries(data || []);
      setAdvisors(advData || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateAdvisor = async (id, advisorId) => {
    const assigned_advisor_id = advisorId || null;
    await supabase.from('inquiries').update({ assigned_advisor_id }).eq('id', id);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, assigned_advisor_id } : i));
  };

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
              <thead><tr><th>Buyer Info</th><th>Listing</th><th>Status</th><th>Flags</th><th>Time</th><th>Advisor</th></tr></thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td><strong>{inq.anonymous_name || 'Registered Buyer'}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{inq.anonymous_email}</span></td>
                    <td style={{fontSize:13}}>
                      {inq.listings?.title ? (
                        <Link href={`/listings/${inq.listing_id}`} target="_blank" style={{color:'var(--primary)',textDecoration:'underline'}}>{inq.listings.title}</Link>
                      ) : (
                        <span className="badge badge-gray">{inq.message?.match(/^\[(.+?)\]/)?.[1] || 'Other Opportunity'}</span>
                      )}
                    </td>
                    <td><span className={`badge badge-${INQUIRY_STATUSES[inq.inquiry_status]?.color || 'gray'}`}>{INQUIRY_STATUSES[inq.inquiry_status]?.label}</span></td>
                    <td>
                      <div style={{display:'flex',gap:4,flexDirection:'column'}}>
                        {inq.wants_acquisition_support && <span className="badge badge-primary" style={{fontSize:10}}>Advisory</span>}
                        {inq.needs_financing && <span className="badge badge-warning" style={{fontSize:10}}>Financing</span>}
                      </div>
                    </td>
                    <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(inq.created_at)}</td>
                    <td>
                      <select className="form-select" style={{padding:'4px 8px',fontSize:12,height:'auto'}} value={inq.assigned_advisor_id || ''} onChange={(e) => updateAdvisor(inq.id, e.target.value)}>
                        <option value="">Unassigned</option>
                        {advisors.map(a => (
                          <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                        ))}
                      </select>
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
