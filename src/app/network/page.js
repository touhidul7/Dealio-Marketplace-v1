'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import RequestsPortal from '@/components/RequestsPortal/RequestsPortal';

export default function NetworkDashboard() {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: userRequests } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMyRequests(userRequests || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Network Portal</h1>
        <p className="page-subtitle">Connect with buyers, sellers, operators, and strategic partners</p>
      </div>

      <RequestsPortal myRequests={myRequests} portalBase="/network" />
    </div>
  );
}
