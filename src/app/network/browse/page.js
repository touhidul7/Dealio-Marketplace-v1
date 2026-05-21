'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { REQUEST_TYPES } from '@/lib/requestsConstants';
import { INDUSTRIES, timeAgo } from '@/lib/constants';

export default function NetworkBrowsePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from('requests')
        .select('*, users!requests_user_id_fkey(full_name, email)')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedType) query = query.eq('request_type', selectedType);
      if (selectedIndustry) query = query.eq('industry', selectedIndustry);

      const { data, error } = await query;
      if (!error && data) setRequests(data);
      setLoading(false);
    };
    load();
  }, [selectedType, selectedIndustry]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.industry?.toLowerCase().includes(q) ||
        r.location_preference?.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  const getTypeConfig = (typeId) => REQUEST_TYPES.find(t => t.id === typeId) || {};

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Browse Network</h1>
          <p className="page-subtitle">Explore active requests from buyers, operators, and strategic partners</p>
        </div>
        <Link href="/network/requests/new" className="btn btn-primary">
          📢 Post a Request
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search active requests..."
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
          <select className="form-select" value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }}></div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>No requests found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
            Try adjusting your search query or filters to find other requests.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRequests.map(request => {
            const typeConfig = getTypeConfig(request.request_type);
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
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {request.title}
                      {request.is_featured && <span style={{ fontSize: 12 }}>⭐</span>}
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
                      <span>· By {request.users?.full_name || 'Anonymous'}</span>
                      <span>· {timeAgo(request.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View Request →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
