'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { REQUEST_TYPES, REQUEST_STATUSES, RESPONSE_INTENTS, VERIFICATION_LEVELS } from '@/lib/requestsConstants';
import { INDUSTRIES, timeAgo, formatDate } from '@/lib/constants';
import styles from './detail.module.css';

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userRole } = useAuth();
  const supabase = createClient();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseOpen, setResponseOpen] = useState(false);
  const [responseForm, setResponseForm] = useState({ message: '', intent: '', contact_name: '', contact_email: '', contact_phone: '' });
  const [responseSubmitting, setResponseSubmitting] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const load = async () => {
      // Fetch request with owner info
      const { data, error } = await supabase
        .from('requests')
        .select('*, users!requests_user_id_fkey(full_name, email)')
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }
      setRequest(data);

      // Pre-fill response form if user is logged in
      if (user) {
        const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        setResponseForm(f => ({
          ...f,
          contact_name: profile?.full_name || '',
          contact_email: user.email || '',
        }));
      }

      // Fetch responses if owner or admin
      if (user && (data.user_id === user.id || userRole === 'admin')) {
        const { data: resps } = await supabase
          .from('responses')
          .select('*, users!responses_user_id_fkey(full_name, email)')
          .eq('target_type', 'request')
          .eq('target_id', id)
          .order('created_at', { ascending: false });
        if (resps) setResponses(resps);
      }

      setLoading(false);
    };
    load();
  }, [id, user, userRole]);

  const typeConfig = REQUEST_TYPES.find(t => t.id === request?.request_type) || {};
  const statusConfig = REQUEST_STATUSES[request?.status] || {};
  const verificationConfig = VERIFICATION_LEVELS.find(v => v.value === request?.verification_level);

  const isOwner = user && request?.user_id === user.id;
  const isAdmin = userRole === 'admin';
  const canView = request?.status === 'approved' || isOwner || isAdmin;

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/signup');
      return;
    }
    setResponseSubmitting(true);
    try {
      const { error: respError } = await supabase.from('responses').insert({
        user_id: user.id,
        target_type: 'request',
        target_id: id,
        message: responseForm.message,
        intent: responseForm.intent || null,
        contact_name: responseForm.contact_name || null,
        contact_email: responseForm.contact_email || null,
        contact_phone: responseForm.contact_phone || null,
      });
      if (respError) throw respError;

      // Update response count
      await supabase.from('requests').update({
        response_count: (request.response_count || 0) + 1,
      }).eq('id', id);

      setResponseSubmitted(true);
    } catch (err) {
      console.error('Response error:', err);
    } finally {
      setResponseSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ paddingTop: 100 }}>
          <div className="skeleton" style={{ height: 32, width: '50%', marginBottom: 16, borderRadius: 8 }}></div>
          <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 32, borderRadius: 8 }}></div>
          <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 20 }}></div>
          <div className="skeleton" style={{ height: 120, borderRadius: 16 }}></div>
        </div>
      </div>
    );
  }

  if (!request || !canView) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ paddingTop: 100 }}>
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">Request not found</h3>
            <p className="empty-state-text">This request may have been removed or is not yet approved.</p>
            <Link href="/requests" className="btn btn-primary">Browse Requests</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <div className="container">
          <Link href="/requests" className={styles.backBtn}>← Back to Requests</Link>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            {/* Badges */}
            <div className={styles.badges}>
              <span className={styles.typeBadge} style={{ '--type-color': typeConfig.color || '#0F52BA' }}>
                {typeConfig.icon} {typeConfig.label}
              </span>
              {request.is_featured && <span className="badge badge-warning">⭐ Featured</span>}
              {verificationConfig && request.verification_level !== 'unverified' && (
                <span className="badge badge-accent">{verificationConfig.icon} {verificationConfig.label}</span>
              )}
              {(isOwner || isAdmin) && (
                <span className={`badge badge-${statusConfig.color}`}>
                  {statusConfig.icon} {statusConfig.label}
                </span>
              )}
            </div>

            <h1 className={styles.title}>{request.title}</h1>

            {/* Meta */}
            <div className={styles.metaRow}>
              {request.industry && (
                <span className={styles.metaItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  {request.industry}
                </span>
              )}
              {request.location_preference && (
                <span className={styles.metaItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {request.location_preference}
                </span>
              )}
              {request.timeline && (
                <span className={styles.metaItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {request.timeline}
                </span>
              )}
              <span className={styles.metaItem}>
                📅 Posted {formatDate(request.created_at)}
              </span>
            </div>

            {/* Description */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <div className={styles.prose}>{request.description}</div>
            </div>

            {/* Dynamic Fields */}
            {request.dynamic_fields && Object.keys(request.dynamic_fields).length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{typeConfig.label} Details</h2>
                <div className={styles.detailGrid}>
                  {Object.entries(request.dynamic_fields).filter(([, v]) => v).map(([key, val]) => {
                    const fieldConfig = typeConfig.fields?.find(f => f.name === key);
                    return (
                      <div key={key} className={styles.detailItem}>
                        <span className={styles.detailLabel}>{fieldConfig?.label || key}</span>
                        <span className={styles.detailValue}>
                          {fieldConfig?.type === 'number' ? `$${Number(val).toLocaleString()}` : val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Responses (visible to owner & admin) */}
            {(isOwner || isAdmin) && responses.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Responses ({responses.length})</h2>
                <div className={styles.responsesList}>
                  {responses.map(resp => (
                    <div key={resp.id} className={styles.responseCard}>
                      <div className={styles.responseHeader}>
                        <div>
                          <strong>{resp.users?.full_name || resp.contact_name || 'Anonymous'}</strong>
                          {resp.intent && (
                            <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                              {RESPONSE_INTENTS.find(i => i.value === resp.intent)?.label || resp.intent}
                            </span>
                          )}
                        </div>
                        <span className={styles.responseTime}>{timeAgo(resp.created_at)}</span>
                      </div>
                      <p className={styles.responseMsg}>{resp.message}</p>
                      {resp.contact_email && (
                        <div className={styles.responseContact}>
                          📧 {resp.contact_email}
                          {resp.contact_phone && <> · 📱 {resp.contact_phone}</>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              {/* Request Owner */}
              <div className={styles.ownerInfo}>
                <div className={styles.ownerAvatar}>
                  {request.users?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className={styles.ownerName}>{request.users?.full_name || 'Anonymous'}</div>
                  <div className={styles.ownerLabel}>Request Owner</div>
                </div>
              </div>

              {/* CTAs */}
              {!isOwner && (
                <button
                  className={`btn btn-primary btn-lg ${styles.ctaBtn}`}
                  onClick={() => {
                    if (!user) { router.push('/signup'); return; }
                    setResponseOpen(true);
                  }}
                >
                  Respond to Request
                </button>
              )}

              <div className={styles.sideStats}>
                <div className={styles.sideStat}>
                  <span>👁️ Views</span>
                  <strong>{request.view_count || 0}</strong>
                </div>
                <div className={styles.sideStat}>
                  <span>💬 Responses</span>
                  <strong>{request.response_count || 0}</strong>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className={styles.trustCard}>
              <h4 className={styles.trustTitle}>🛡️ Trust & Safety</h4>
              <ul className={styles.trustList}>
                <li>All requests are reviewed by Dealio staff</li>
                <li>No investment solicitations allowed</li>
                <li>Your contact info is protected</li>
                <li>Report suspicious requests anytime</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Response Modal */}
      {responseOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setResponseOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{responseSubmitted ? 'Response Sent!' : 'Respond to Request'}</h3>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setResponseOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {responseSubmitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <p style={{ color: 'var(--text-secondary)' }}>Your response has been sent to the request owner. They will review it and reach out if interested.</p>
                </div>
              ) : (
                <form onSubmit={handleResponseSubmit}>
                  <div className="form-group">
                    <label className="form-label">Your Intent</label>
                    <select
                      className="form-select"
                      value={responseForm.intent}
                      onChange={e => setResponseForm(f => ({ ...f, intent: e.target.value }))}
                    >
                      <option value="">Select your intent...</option>
                      {RESPONSE_INTENTS.map(i => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      className="form-input"
                      value={responseForm.contact_name}
                      onChange={e => setResponseForm(f => ({ ...f, contact_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={responseForm.contact_email}
                      onChange={e => setResponseForm(f => ({ ...f, contact_email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={responseForm.contact_phone}
                      onChange={e => setResponseForm(f => ({ ...f, contact_phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      value={responseForm.message}
                      onChange={e => setResponseForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Introduce yourself and explain your interest..."
                      required
                      rows={4}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={responseSubmitting}>
                    {responseSubmitting ? <span className="spinner"></span> : 'Send Response'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
