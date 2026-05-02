'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { formatDate } from '@/lib/constants';

export default function AdvisorDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [requests, setRequests] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAdvisorData = async () => {
      const [requestsRes, inquiriesRes] = await Promise.all([
        supabase
          .from('service_requests')
          .select('*, users(full_name, email), listings(title)')
          .eq('assigned_to_user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('inquiries')
          .select('*, listings(title)')
          .eq('assigned_advisor_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (requestsRes.data) setRequests(requestsRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
      setLoading(false);
    };

    fetchAdvisorData();
  }, [user, supabase]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Advisor Dashboard</h1>
        <p className="page-subtitle">Welcome back. Here are your assigned tasks and leads.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Service Requests Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Assigned Service Requests</h2>
            <span className="badge badge-primary">{requests.length}</span>
          </div>
          {requests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No service requests assigned to you.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 5).map(req => (
                    <tr key={req.id}>
                      <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{req.request_type.replace(/_/g, ' ')}</td>
                      <td style={{ fontSize: 13 }}>{req.users?.full_name || req.users?.email}</td>
                      <td><span className="badge badge-secondary">{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length > 5 && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer' }}>View all requests</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inquiries / Leads Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Assigned Leads</h2>
            <span className="badge badge-accent">{inquiries.length}</span>
          </div>
          {inquiries.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No leads assigned to you.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.slice(0, 5).map(inq => (
                    <tr key={inq.id}>
                      <td style={{ fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inq.listings?.title || 'Unknown'}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(inq.created_at)}</td>
                      <td><span className="badge badge-secondary">{inq.inquiry_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
