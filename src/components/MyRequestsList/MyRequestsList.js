'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { REQUEST_TYPES, REQUEST_STATUSES, RESPONSE_INTENTS } from '@/lib/requestsConstants';
import { INDUSTRIES, timeAgo } from '@/lib/constants';

/**
 * Dashboard "My Requests" page component.
 * Shows the current user's own requests with filtering, status, and response counts.
 * @param {{ portalBase: string }} props – e.g. "/seller", "/buyer", "/broker"
 */
export default function MyRequestsList({ portalBase = '' }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const supabase = createClient();

  const newRequestHref = portalBase ? `${portalBase}/requests/new` : '/requests/new';

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedType) query = query.eq('request_type', selectedType);
      if (selectedStatus) query = query.eq('status', selectedStatus);

      const { data, error } = await query;
      if (!error && data) setRequests(data);
      setLoading(false);
    };
    load();
  }, [user, selectedType, selectedStatus]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.industry?.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  const getTypeConfig = (typeId) => REQUEST_TYPES.find(t => t.id === typeId) || {};

  // Stats
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const pendingCount = requests.filter(r => r.status === 'pending_review').length;
  const totalResponses = requests.reduce((sum, r) => sum + (r.response_count || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Manage your acquisition, operator, and partner requests</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/requests" className="btn btn-secondary btn-sm">Browse Public Requests</Link>
          <Link href={newRequestHref} className="btn btn-primary">📢 Post New Request</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Requests', value: requests.length, icon: '📋', color: '#0F52BA' },
          { label: 'Approved', value: approvedCount, icon: '✅', color: '#16a34a' },
          { label: 'Pending Review', value: pendingCount, icon: '⏳', color: '#d97706' },
          { label: 'Total Responses', value: totalResponses, icon: '💬', color: '#8B5CF6' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${stat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search your requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
            <option value="">All Types</option>
            {REQUEST_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </select>
          <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="">All Statuses</option>
            {Object.entries(REQUEST_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>📢</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            {searchQuery || selectedType || selectedStatus ? 'No matching requests' : 'No requests yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            {searchQuery || selectedType || selectedStatus
              ? 'Try adjusting your filters or search query.'
              : 'Post your first request to connect with buyers, operators, or strategic partners.'}
          </p>
          {!searchQuery && !selectedType && !selectedStatus && (
            <Link href={newRequestHref} className="btn btn-primary">Post Your First Request</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRequests.map(request => {
            const typeConfig = getTypeConfig(request.request_type);
            const statusConfig = REQUEST_STATUSES[request.status] || {};
            return (
              <Link
                href={`/requests/${request.id}`}
                key={request.id}
                className="card"
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.15s ease',
                  gap: 16,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,82,186,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `${typeConfig.color || '#0F52BA'}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {typeConfig.icon || '📋'}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                      {request.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: `${typeConfig.color || '#0F52BA'}14`,
                        color: typeConfig.color || '#0F52BA',
                      }}>
                        {typeConfig.label || request.request_type}
                      </span>
                      {request.industry && <span>· {request.industry}</span>}
                      {request.location_preference && <span>· 📍 {request.location_preference}</span>}
                      <span>· {timeAgo(request.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {(request.response_count || 0) > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#8B5CF6', lineHeight: 1 }}>{request.response_count}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Responses</div>
                    </div>
                  )}
                  {(request.view_count || 0) > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-secondary)', lineHeight: 1 }}>{request.view_count}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Views</div>
                    </div>
                  )}
                  <span className={`badge badge-${statusConfig.color || 'gray'}`} style={{ fontSize: 11, padding: '4px 10px' }}>
                    {statusConfig.icon} {statusConfig.label || request.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
