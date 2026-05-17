'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { REQUEST_TYPES, REQUEST_STATUSES, RESPONSE_INTENTS } from '@/lib/requestsConstants';
import { INDUSTRIES, timeAgo } from '@/lib/constants';
import styles from './requests.module.css';

export default function RequestsPage() {
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
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Dealio Marketplace</div>
          <h1 className={styles.heroTitle}>Acquisition & Partner Requests</h1>
          <p className={styles.heroSubtitle}>
            Discover businesses seeking buyers, operators looking for opportunities, and strategic partnership openings.
          </p>
          {user ? (
            <Link href="/requests/new" className={styles.heroCta}>
              Post a Request
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </Link>
          ) : (
            <Link href="/signup" className={styles.heroCta}>
              Join to Post Requests
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </Link>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className={styles.filtersSection}>
        <div className="container">
          <div className={styles.filtersRow}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Request Types</option>
              {REQUEST_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Type Pills */}
          <div className={styles.typePills}>
            <button
              className={`${styles.pill} ${!selectedType ? styles.pillActive : ''}`}
              onClick={() => setSelectedType('')}
            >
              All
            </button>
            {REQUEST_TYPES.map(t => (
              <button
                key={t.id}
                className={`${styles.pill} ${selectedType === t.id ? styles.pillActive : ''}`}
                onClick={() => setSelectedType(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className={styles.resultsSection}>
        <div className="container">
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {loading ? 'Loading...' : `${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={styles.cardSkeleton}>
                  <div className={`skeleton ${styles.skLine1}`}></div>
                  <div className={`skeleton ${styles.skLine2}`}></div>
                  <div className={`skeleton ${styles.skLine3}`}></div>
                  <div className={`skeleton ${styles.skLine4}`}></div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3 className={styles.emptyTitle}>No requests found</h3>
              <p className={styles.emptyText}>
                {searchQuery || selectedType || selectedIndustry
                  ? 'Try adjusting your filters or search query.'
                  : 'Be the first to post a request!'}
              </p>
              {user && (
                <Link href="/requests/new" className="btn btn-primary">
                  Post a Request
                </Link>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredRequests.map(request => {
                const typeConfig = getTypeConfig(request.request_type);
                return (
                  <Link href={`/requests/${request.id}`} key={request.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardBadges}>
                        <span className={styles.typeBadge} style={{ '--badge-color': typeConfig.color || '#0F52BA' }}>
                          <span>{typeConfig.icon}</span> {typeConfig.label}
                        </span>
                        {request.is_featured && <span className={styles.featuredBadge}>⭐ Featured</span>}
                        {request.verification_level && request.verification_level !== 'unverified' && (
                          <span className={styles.verifiedBadge}>✓ {request.verification_level}</span>
                        )}
                      </div>
                    </div>
                    <h3 className={styles.cardTitle}>{request.title}</h3>
                    <p className={styles.cardDesc}>
                      {request.description?.length > 160
                        ? request.description.substring(0, 160) + '...'
                        : request.description}
                    </p>
                    <div className={styles.cardMeta}>
                      {request.industry && (
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                          {request.industry}
                        </span>
                      )}
                      {request.location_preference && (
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {request.location_preference}
                        </span>
                      )}
                      {request.timeline && (
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {request.timeline}
                        </span>
                      )}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardAuthor}>
                        {request.users?.full_name || 'Anonymous'}
                      </span>
                      <span className={styles.cardTime}>{timeAgo(request.created_at)}</span>
                    </div>
                    <div className={styles.cardCta}>
                      View Request →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
