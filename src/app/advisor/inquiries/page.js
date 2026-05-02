'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { timeAgo, INQUIRY_STATUSES } from '@/lib/constants';
import styles from '@/app/seller/inquiries/inquiries.module.css';

export default function AdvisorInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('inquiries')
        .select('*, listings(title, asking_price)')
        .eq('assigned_advisor_id', user.id)
        .order('created_at', { ascending: false });
        
      setInquiries(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const updateStatus = async (id, status) => {
    await supabase.from('inquiries').update({ inquiry_status: status }).eq('id', id);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, inquiry_status: status } : i));
    if (selected?.id === id) setSelected(prev => ({ ...prev, inquiry_status: status }));
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Assigned Leads</h1>
        <p className="page-subtitle">Manage inquiries assigned to you by an admin</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 300, borderRadius: 12 }}></div>
      ) : inquiries.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📬</div><h3 className="empty-state-title">No leads assigned</h3><p className="empty-state-text">When an admin assigns a lead to you, it will appear here.</p></div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.list}>
            {inquiries.map(inq => (
              <div key={inq.id} className={`${styles.item} ${selected?.id === inq.id ? styles.itemActive : ''} ${inq.inquiry_status === 'new' ? styles.itemNew : ''}`} onClick={() => setSelected(inq)}>
                <div className={styles.itemTop}>
                  <strong className={styles.itemName}>{inq.anonymous_name || 'Registered Buyer'}</strong>
                  <span className={styles.itemTime}>{timeAgo(inq.created_at)}</span>
                </div>
                <div className={styles.itemListing}>{inq.listings?.title}</div>
                <div className={styles.itemBottom}>
                  <span className={`badge badge-${INQUIRY_STATUSES[inq.inquiry_status]?.color || 'gray'}`}>{INQUIRY_STATUSES[inq.inquiry_status]?.label}</span>
                  {inq.inquiry_status === 'new' && <span className={styles.newDot}></span>}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.detail}>
            {!selected ? (
              <div className={styles.noSelect}><p>Select an inquiry to view details</p></div>
            ) : (
              <div>
                <div className={styles.detailHeader}>
                  <div>
                    <h2 className={styles.detailName}>{selected.anonymous_name || 'Registered Buyer'}</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>{timeAgo(selected.created_at)}</p>
                  </div>
                  <span className={`badge badge-${INQUIRY_STATUSES[selected.inquiry_status]?.color}`}>{INQUIRY_STATUSES[selected.inquiry_status]?.label}</span>
                </div>
                <div className={styles.detailBody}>
                  <div className={styles.detailSection}>
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> {selected.anonymous_email || '—'}</p>
                    <p><strong>Phone:</strong> {selected.anonymous_phone || '—'}</p>
                    <p><strong>Listing:</strong> {selected.listings?.title}</p>
                  </div>
                  {(selected.wants_acquisition_support || selected.needs_financing) && (
                    <div className={styles.detailFlags}>
                      {selected.wants_acquisition_support && <span className="badge badge-primary">🤝 Wants Advisory Support</span>}
                      {selected.needs_financing && <span className="badge badge-warning">💰 Needs Financing</span>}
                    </div>
                  )}
                  <div className={styles.detailSection}>
                    <h4>Message</h4>
                    <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{selected.message || 'No message provided.'}</p>
                  </div>
                  <div className={styles.detailActions}>
                    <h4>Update Status</h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['opened', 'contacted', 'qualified', 'unqualified', 'archived'].map(s => (
                        <button key={s} className={`btn btn-sm ${selected.inquiry_status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateStatus(selected.id, s)} style={{ textTransform: 'capitalize' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
