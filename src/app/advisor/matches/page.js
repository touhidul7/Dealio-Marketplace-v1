'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency } from '@/lib/constants';

function computeMatch(listing, profile) {
  let score = 0;
  let reasons = [];

  const industries = profile.industry_focus || [];
  const listingIndustry = listing.industry || '';
  if (industries.length === 0 || industries.some(ind => listingIndustry.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(listingIndustry.toLowerCase()))) {
    score += 40;
    if (industries.length > 0 && listingIndustry) reasons.push(`${listingIndustry} industry`);
  }

  const locations = profile.geographic_focus || [];
  const listingProvince = (listing.province_state || '').toLowerCase();
  const listingCity = (listing.city || '').toLowerCase();
  const locationMatches = locations.length === 0 || locations.some(loc => {
    const l = loc.toLowerCase();
    return listingProvince.includes(l) || l.includes(listingProvince) || listingCity.includes(l) || l.includes(listingCity);
  });
  if (locationMatches) {
    score += 30;
    if (locations.length > 0 && listingProvince) reasons.push(`${listing.province_state} location`);
  }

  const price = listing.asking_price || 0;
  const minDeal = Number(profile.deal_size_min) || 0;
  const maxDeal = Number(profile.deal_size_max) || 0;
  const withinSize = (minDeal === 0 || price >= minDeal) && (maxDeal === 0 || price <= maxDeal);
  if (withinSize) {
    score += 30;
    if (minDeal > 0 || maxDeal > 0) reasons.push('within deal size range');
  }

  return { score, reasons };
}

export default function AdvisorMatchesPage() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [assignedClients, setAssignedClients] = useState([]);
  
  // Selected client for match viewing
  const [selectedClient, setSelectedClient] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    const loadClients = async () => {
      // Get service requests assigned to this advisor to extract buyers and listings
      const { data: requests } = await supabase
        .from('service_requests')
        .select(`
          id,
          user_id,
          listing_id,
          client:users!service_requests_user_id_fkey(full_name, email),
          listings(id, title, industry, city, province_state, asking_price)
        `)
        .eq('assigned_to_user_id', user.id);

      if (requests) {
        // Group by user_id to find unique clients
        const clientsMap = {};
        
        // We need to fetch buyer_profiles for these users
        const userIds = [...new Set(requests.map(r => r.user_id))];
        const { data: buyerProfiles } = await supabase
          .from('buyer_profiles')
          .select('*')
          .in('user_id', userIds);

        const bpMap = {};
        if (buyerProfiles) {
          buyerProfiles.forEach(bp => { bpMap[bp.user_id] = bp; });
        }

        requests.forEach(req => {
          if (!clientsMap[req.user_id]) {
            clientsMap[req.user_id] = {
              user_id: req.user_id,
              client: req.client,
              listings: [],
              buyerProfile: bpMap[req.user_id] || null
            };
          }
          if (req.listings) {
            clientsMap[req.user_id].listings.push(req.listings);
          }
        });
        
        setAssignedClients(Object.values(clientsMap));
      }
      setLoading(false);
    };
    
    loadClients();
  }, [user]);

  const loadMatches = async (client) => {
    setSelectedClient(client);
    setMatches([]);
    
    // If the client has a buyer profile, match them against all active listings
    if (client.buyerProfile) {
      const { data: allListings } = await supabase
        .from('listings')
        .select('id, title, industry, city, province_state, asking_price, featured_image_url')
        .eq('status', 'active');
        
      if (allListings) {
        const scored = allListings
          .map(l => {
            const match = computeMatch(l, client.buyerProfile);
            return { type: 'listing', item: l, score: match.score, reasons: match.reasons };
          })
          .filter(m => m.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        setMatches(scored);
        return;
      }
    }
    
    // If the client has listings, match them against all buyer profiles
    if (client.listings.length > 0) {
      const { data: allBuyers } = await supabase
        .from('buyer_profiles')
        .select('*, users(full_name, email)');
        
      if (allBuyers) {
        let allScored = [];
        client.listings.forEach(listing => {
          allBuyers.forEach(bp => {
            const match = computeMatch(listing, bp);
            if (match.score > 0) {
              allScored.push({ type: 'buyer', listing: listing, item: bp, score: match.score, reasons: match.reasons });
            }
          });
        });
        
        allScored = allScored.sort((a, b) => b.score - a.score).slice(0, 10);
        setMatches(allScored);
      }
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading assigned clients...</div>;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Client Matches</h1>
        <p className="page-subtitle">View high-fit matches for your assigned clients</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Col: Client List */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Your Clients</h2>
          {assignedClients.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No clients assigned via service requests.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {assignedClients.map(c => (
                <button 
                  key={c.user_id} 
                  onClick={() => loadMatches(c)}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    background: selectedClient?.user_id === c.user_id ? 'var(--primary-50)' : 'var(--gray-50)',
                    border: `1px solid ${selectedClient?.user_id === c.user_id ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 600, color: selectedClient?.user_id === c.user_id ? 'var(--primary-700)' : 'inherit' }}>
                    {c.client?.full_name || c.client?.email}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {c.buyerProfile && <span style={{ marginRight: 8 }}>✓ Buyer Profile</span>}
                    {c.listings.length > 0 && <span>✓ {c.listings.length} Listings</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Matches */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          {!selectedClient ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
              <p>Select a client to view their high-fit matches</p>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>
                Matches for {selectedClient.client?.full_name || selectedClient.client?.email}
              </h2>
              
              {matches.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No strong matches found for this client.</p>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {matches.map((m, idx) => (
                    <div key={idx} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ 
                        width: 60, height: 60, borderRadius: 30, 
                        background: m.score >= 80 ? '#dcfce7' : '#fef3c7',
                        color: m.score >= 80 ? '#16a34a' : '#d97706',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800, flexShrink: 0
                      }}>
                        {m.score}%
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        {m.type === 'listing' ? (
                          <>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Listing Match</div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>
                              <Link href={`/listings/${m.item.id}`} target="_blank" style={{ color: 'var(--text-primary)' }}>{m.item.title}</Link>
                            </h3>
                            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
                              {formatCurrency(m.item.asking_price)} • {m.item.industry}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              Buyer Match for "{m.listing.title}"
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>
                              {m.item.users?.full_name || m.item.users?.email}
                            </h3>
                            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
                              {m.item.company_name && <span>{m.item.company_name} • </span>}
                              Seeking {formatCurrency(m.item.deal_size_min)} - {formatCurrency(m.item.deal_size_max)}
                            </div>
                          </>
                        )}
                        
                        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {m.reasons.map(r => (
                            <span key={r} style={{ fontSize: 11, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 12 }}>✓ {r}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
