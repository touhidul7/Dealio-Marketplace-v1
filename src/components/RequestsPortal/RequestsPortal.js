'use client';
import Link from 'next/link';
import { REQUEST_TYPES, REQUEST_STATUSES } from '@/lib/requestsConstants';
import { timeAgo } from '@/lib/constants';

export default function RequestsPortal({ myRequests = [], portalBase = '' }) {
  const newRequestHref = portalBase ? `${portalBase}/requests/new` : '/requests/new';
  const getTypeConfig = (typeId) => REQUEST_TYPES.find(t => t.id === typeId) || {};
  const approvedRequests = myRequests.filter(r => r.status === 'approved').length;
  const pendingRequests = myRequests.filter(r => r.status === 'pending_review').length;
  const totalResponses = myRequests.reduce((sum, r) => sum + (r.response_count || 0), 0);

  return (
    <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Portal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F52BA 0%, #1a6fef 50%, #6366f1 100%)',
          padding: 'var(--space-5) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              📢 Requests Portal
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
              Post acquisition requests, find operators, or seek strategic partners
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/requests" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
              Browse All →
            </Link>
            <Link href={newRequestHref} className="btn btn-sm" style={{ background: '#fff', color: '#0F52BA', fontWeight: 600 }}>
              + New Request
            </Link>
          </div>
        </div>

        {/* Portal Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 1,
          background: 'var(--border)',
        }}>
          {[
            { label: 'My Requests', value: myRequests.length, icon: '📋', color: '#0F52BA' },
            { label: 'Approved', value: approvedRequests, icon: '✅', color: '#16a34a' },
            { label: 'Pending', value: pendingRequests, icon: '⏳', color: '#d97706' },
            { label: 'Responses', value: totalResponses, icon: '💬', color: '#8B5CF6' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface)', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Portal Content */}
        <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
          {myRequests.length === 0 ? (
            <div style={{ padding: 'var(--space-6) 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.7 }}>📢</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>No requests yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>
                Post a request to connect with buyers, operators, or strategic partners in the Dealio network.
              </p>
              <Link href={newRequestHref} className="btn btn-primary btn-sm">Post Your First Request</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Your Recent Requests</span>
              </div>
              {myRequests.slice(0, 5).map(request => {
                const typeConfig = getTypeConfig(request.request_type);
                const statusConfig = REQUEST_STATUSES[request.status] || {};
                return (
                  <Link
                    href={`/requests/${request.id}`}
                    key={request.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 10,
                      backgroundColor: 'var(--gray-50)',
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,82,186,0.08)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: `${typeConfig.color || '#0F52BA'}14`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>
                        {typeConfig.icon || '📋'}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {request.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{typeConfig.label || request.request_type}</span>
                          <span>·</span>
                          <span>{timeAgo(request.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {(request.response_count || 0) > 0 && (
                        <span style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          💬 {request.response_count}
                        </span>
                      )}
                      <span className={`badge badge-${statusConfig.color || 'gray'}`} style={{ fontSize: 11 }}>
                        {statusConfig.icon} {statusConfig.label || request.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {myRequests.length > 5 && (
                <div style={{ textAlign: 'center', paddingTop: 8 }}>
                  <Link href={portalBase ? `${portalBase}/requests` : '/requests'} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>View all {myRequests.length} requests →</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
