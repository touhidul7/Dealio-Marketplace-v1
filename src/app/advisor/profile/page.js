'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export default function AdvisorProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [profile, setProfile] = useState({ focus_industries: [], focus_geographies: [] });
  const [industriesInput, setIndustriesInput] = useState('');
  const [geographiesInput, setGeographiesInput] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from('advisor_profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setProfile(data);
        setIndustriesInput((data.focus_industries || []).join(', '));
        setGeographiesInput((data.focus_geographies || []).join(', '));
      }
    };
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    const payload = {
      user_id: user.id,
      focus_industries: industriesInput.split(',').map(s => s.trim()).filter(Boolean),
      focus_geographies: geographiesInput.split(',').map(s => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('advisor_profiles').upsert(payload, { onConflict: 'user_id' });
    if (!error) setSuccess(true);
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Advisor Profile</h1>
        <p className="page-subtitle">Manage your expertise and focus areas</p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: 'var(--space-6)' }}>
        <div className="form-group">
          <label className="form-label">Focus Industries</label>
          <input 
            type="text" 
            className="form-input" 
            value={industriesInput} 
            onChange={e => setIndustriesInput(e.target.value)} 
            placeholder="e.g. Technology, Healthcare, Manufacturing (comma separated)" 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Geographic Focus</label>
          <input 
            type="text" 
            className="form-input" 
            value={geographiesInput} 
            onChange={e => setGeographiesInput(e.target.value)} 
            placeholder="e.g. California, Ontario, Northeast US (comma separated)" 
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {success && <span style={{ color: 'var(--success)', marginLeft: 16 }}>Profile updated successfully!</span>}
      </form>
    </div>
  );
}
