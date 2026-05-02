'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatDate } from '@/lib/constants';

const STATUS_OPTIONS = ['new', 'assigned', 'in_progress', 'complete', 'canceled'];

const STATUS_STYLES = {
  new:         { bg: '#EFF6FF', color: '#1D4ED8' },
  assigned:    { bg: '#F0FDF4', color: '#15803D' },
  in_progress: { bg: '#FFFBEB', color: '#B45309' },
  complete:    { bg: '#F0FDF4', color: '#15803D' },
  canceled:    { bg: '#FEF2F2', color: '#B91C1C' },
};

export default function AdvisorServicesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        client:users!service_requests_user_id_fkey ( full_name, email, phone ),
        listings ( title )
      `)
      .eq('assigned_to_user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) console.error(error);
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('service_requests').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  const updateNotes = async (id, notes) => {
    const { error } = await supabase.from('service_requests').update({ notes }).eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, notes } : r));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Assigned Service Requests</h1>
        <p className="page-subtitle">Manage and update progress for seller service requests</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No service requests assigned to you.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>CLIENT</th>
                  <th>SERVICE TYPE</th>
                  <th>LISTING</th>
                  <th>STATUS</th>
                  <th>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const st = STATUS_STYLES[req.status] || STATUS_STYLES.new;
                  return (
                    <tr key={req.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: 13 }}>
                        {formatDate(req.created_at)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{req.client?.full_name || 'Unknown User'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.client?.email}</div>
                        {req.client?.phone && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.client.phone}</div>}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                        {req.request_type.replace(/_/g, ' ')}
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                        {req.listings?.title || '-'}
                      </td>
                      <td>
                        <select 
                          value={req.status}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          style={{ 
                            padding: '4px 8px', 
                            borderRadius: 6, 
                            border: '1px solid var(--border)',
                            backgroundColor: st.bg,
                            color: st.color,
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} style={{ background: '#fff', color: '#000' }}>
                              {opt.replace(/_/g, ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ maxWidth: 250 }}>
                        <textarea 
                          defaultValue={req.notes || ''}
                          onBlur={(e) => updateNotes(req.id, e.target.value)}
                          placeholder="Add internal notes..."
                          style={{ width: '100%', minHeight: '60px', padding: '8px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
