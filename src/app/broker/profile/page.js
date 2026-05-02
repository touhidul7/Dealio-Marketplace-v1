'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export default function BrokerProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState({ brokerage_name: '', website: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from('broker_profiles').select('*').eq('user_id', user.id).single();
      if (data) setProfile(data);
    };
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    const payload = {
      user_id: user.id,
      brokerage_name: profile.brokerage_name,
      website: profile.website,
      bio: profile.bio,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('broker_profiles').upsert(payload, { onConflict: 'user_id' });
    if (!error) setSuccess(true);
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Broker Profile</h1>
        <p className="page-subtitle">Manage your brokerage information</p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: 'var(--space-6)' }}>
        <div className="form-group">
          <label className="form-label">Brokerage Name</label>
          <input type="text" className="form-input" value={profile.brokerage_name || ''} onChange={e => setProfile({...profile, brokerage_name: e.target.value})} required />
        </div>
        
        <div className="form-group">
          <label className="form-label">Website</label>
          <input type="url" className="form-input" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} placeholder="https://" />
        </div>

        <div className="form-group">
          <label className="form-label">Professional Bio</label>
          <textarea className="form-textarea" rows="4" value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Describe your experience and focus areas..." />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {success && <span style={{ color: 'var(--success)', marginLeft: 16 }}>Profile updated successfully!</span>}
      </form>
    </div>
  );
}
