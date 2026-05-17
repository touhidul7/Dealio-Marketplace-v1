'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { REQUEST_TYPES, REQUEST_STATUSES, VERIFICATION_LEVELS, scanRequestForKeywords } from '@/lib/requestsConstants';
import { timeAgo } from '@/lib/constants';
import styles from './admin-requests.module.css';

export default function AdminRequestsPage() {
  return <AdminRequestsContent />;
}

function AdminRequestsContent() {
  const { user } = useAuth();
  const supabase = createClient();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending_review');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [verificationLevel, setVerificationLevel] = useState('unverified');
  const [actionLoading, setActionLoading] = useState('');

  const tabs = [
    { id: 'pending_review', label: 'Pending Review', icon: '⏳' },
    { id: 'flagged', label: 'Flagged', icon: '🚩' },
    { id: 'approved', label: 'Approved', icon: '✅' },
    { id: 'rejected', label: 'Rejected', icon: '❌' },
    { id: 'archived', label: 'Archived', icon: '📦' },
  ];

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select('*, users!requests_user_id_fkey(full_name, email)')
      .eq('status', activeTab)
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  };

  const handleAction = async (requestId, newStatus) => {
    setActionLoading(requestId + newStatus);
    try {
      const updatePayload = {
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      };

      if (adminNotes && selectedRequest?.id === requestId) {
        updatePayload.admin_notes = adminNotes;
      }
      if (selectedRequest?.id === requestId) {
        updatePayload.verification_level = verificationLevel;
      }

      await supabase.from('requests').update(updatePayload).eq('id', requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setSelectedRequest(null);
      setAdminNotes('');
    } finally {
      setActionLoading('');
    }
  };

  const handleSaveNotes = async (requestId) => {
    setActionLoading(requestId + 'notes');
    try {
      await supabase.from('requests').update({
        admin_notes: adminNotes,
        verification_level: verificationLevel,
      }).eq('id', requestId);
      // Update local state
      setRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, admin_notes: adminNotes, verification_level: verificationLevel } : r
      ));
    } finally {
      setActionLoading('');
    }
  };

  const openReview = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setVerificationLevel(request.verification_level || 'unverified');
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Requests Management</h1>
          <p className="page-subtitle">Review, approve, and manage acquisition & partner requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSelectedRequest(null); }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{tabs.find(t => t.id === activeTab)?.icon || '📋'}</div>
          <h3 className={styles.emptyTitle}>No {activeTab.replace('_', ' ')} requests</h3>
          <p className={styles.emptyText}>There are no requests in this category right now.</p>
        </div>
      ) : (
        <div className={styles.requestsList}>
          {requests.map(request => {
            const typeConfig = REQUEST_TYPES.find(t => t.id === request.request_type) || {};
            const keywords = request.flagged_keywords?.length > 0 ? request.flagged_keywords : [];
            const isSelected = selectedRequest?.id === request.id;

            return (
              <div key={request.id} className={`${styles.requestItem} ${isSelected ? styles.requestItemActive : ''}`}>
                <div className={styles.requestHeader} onClick={() => openReview(request)}>
                  <div className={styles.requestInfo}>
                    <div className={styles.requestBadges}>
                      <span className={styles.typeBadge} style={{ '--type-color': typeConfig.color || '#0F52BA' }}>
                        {typeConfig.icon} {typeConfig.label}
                      </span>
                      {keywords.length > 0 && (
                        <span className={styles.flagBadge}>🚩 {keywords.length} flagged</span>
                      )}
                    </div>
                    <h3 className={styles.requestTitle}>{request.title}</h3>
                    <div className={styles.requestMeta}>
                      <span>By: <strong>{request.users?.full_name || 'Unknown'}</strong> ({request.users?.email})</span>
                      <span>· {timeAgo(request.created_at)}</span>
                      {request.industry && <span>· {request.industry}</span>}
                      {request.response_count > 0 && <span>· 💬 {request.response_count} responses</span>}
                    </div>
                  </div>
                  <div className={styles.requestActions}>
                    <Link href={`/requests/${request.id}`} target="_blank" className="btn btn-sm btn-ghost">
                      Preview ↗
                    </Link>
                    <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); openReview(request); }}>
                      Review
                    </button>
                  </div>
                </div>

                {/* Expanded Review Panel */}
                {isSelected && (
                  <div className={styles.reviewPanel}>
                    {/* Description Preview */}
                    <div className={styles.reviewSection}>
                      <h4>Description</h4>
                      <p className={styles.reviewDesc}>{request.description}</p>
                    </div>

                    {/* Flagged Keywords */}
                    {keywords.length > 0 && (
                      <div className={styles.flaggedSection}>
                        <h4>🚩 Flagged Keywords</h4>
                        <div className={styles.flaggedList}>
                          {keywords.map((kw, i) => (
                            <span key={i} className={styles.flaggedWord}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    <div className={styles.reviewSection}>
                      <h4>Admin Notes</h4>
                      <textarea
                        className="form-textarea"
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Add internal notes about this request..."
                        rows={3}
                      />
                    </div>

                    {/* Verification Level */}
                    <div className={styles.reviewSection}>
                      <h4>Verification Level</h4>
                      <select
                        className="form-select"
                        value={verificationLevel}
                        onChange={e => setVerificationLevel(e.target.value)}
                      >
                        {VERIFICATION_LEVELS.map(v => (
                          <option key={v.value} value={v.value}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.reviewActions}>
                      {activeTab !== 'approved' && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!!actionLoading}
                          onClick={() => handleAction(request.id, 'approved')}
                        >
                          {actionLoading === request.id + 'approved' ? <span className="spinner"></span> : '✅ Approve'}
                        </button>
                      )}
                      {activeTab !== 'rejected' && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={!!actionLoading}
                          onClick={() => handleAction(request.id, 'rejected')}
                        >
                          {actionLoading === request.id + 'rejected' ? <span className="spinner"></span> : '❌ Reject'}
                        </button>
                      )}
                      {activeTab !== 'flagged' && (
                        <button
                          className="btn btn-sm"
                          style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}
                          disabled={!!actionLoading}
                          onClick={() => handleAction(request.id, 'flagged')}
                        >
                          🚩 Flag
                        </button>
                      )}
                      {activeTab !== 'archived' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={!!actionLoading}
                          onClick={() => handleAction(request.id, 'archived')}
                        >
                          📦 Archive
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={!!actionLoading}
                        onClick={() => handleSaveNotes(request.id)}
                      >
                        {actionLoading === request.id + 'notes' ? <span className="spinner"></span> : '💾 Save Notes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
