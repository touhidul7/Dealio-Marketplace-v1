'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateRole = async (id, role) => {
    await supabase.from('users').update({ role }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">All Users</h1>
        <p className="page-subtitle">Manage user accounts and roles</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name || 'No Name'}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{u.email}</span></td>
                    <td style={{textTransform:'capitalize'}}><span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'seller' ? 'badge-primary' : 'badge-accent'}`}>{u.role}</span></td>
                    <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(u.created_at)}</td>
                    <td>
                      <select className="form-select" style={{padding:'4px 8px',fontSize:12,height:'auto'}} value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="advisor">Advisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
