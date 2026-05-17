'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/constants';
import { ALL_ROLES, ROLE_LABELS, getDashboardPath } from '@/lib/roles';

const PORTAL_ROLE_COLOR = {
  admin: 'badge-warning',
  advisor: 'badge-accent',
  broker: 'badge-accent',
  seller: 'badge-primary',
  business_owner: 'badge-primary',
  buyer: 'badge-secondary',
  operator: 'badge-secondary',
  strategic_partner: 'badge-secondary',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // user id being edited
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateRoles = async (userId, newRoles) => {
    if (!newRoles.length) return; // must have at least one role
    setSaving(true);
    const primaryRole = newRoles[0];
    const { error } = await supabase
      .from('users')
      .update({ roles: newRoles, role: primaryRole })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, roles: newRoles, role: primaryRole } : u
      ));
    }
    setSaving(false);
    setEditingUser(null);
  };

  const UserRolesEditor = ({ user }) => {
    // Normalise: if roles array is empty/null fall back to [role]
    const currentRoles = (user.roles?.length) ? user.roles : [user.role];
    const [selected, setSelected] = useState(currentRoles);

    const toggle = (role) => {
      setSelected(prev =>
        prev.includes(role)
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    };

    // Drag-to-reorder primary role: just put admin/advisor/broker first
    const isChanged = JSON.stringify(selected.slice().sort()) !== JSON.stringify(currentRoles.slice().sort());

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)', maxWidth: 480, width: '100%',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Edit Roles</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            <strong>{user.full_name || user.email}</strong> — select all capabilities that apply.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 20 }}>
            {ALL_ROLES.map(role => {
              const isChecked = selected.includes(role);
              const isPrimary = selected[0] === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    if (selected.length === 1 && isChecked) return; // must keep at least one
                    toggle(role);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                    background: isChecked ? 'var(--primary-50)' : 'var(--bg)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                    background: isChecked ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff', fontWeight: 800,
                  }}>
                    {isChecked ? '✓' : ''}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isChecked ? 'var(--primary)' : 'var(--text-secondary)', textAlign: 'left' }}>
                    {ROLE_LABELS[role]}
                  </span>
                  {isPrimary && isChecked && (
                    <span style={{
                      position: 'absolute', top: 4, right: 6,
                      fontSize: 9, fontWeight: 700, color: 'var(--primary)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>Primary</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Primary role ordering hint */}
          {selected.length > 1 && (
            <div style={{
              fontSize: 12, color: 'var(--text-tertiary)',
              background: 'var(--bg-secondary)', borderRadius: 8,
              padding: '8px 12px', marginBottom: 16,
            }}>
              💡 Primary role (first checked) determines default dashboard: <strong>{ROLE_LABELS[selected[0]]}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditingUser(null)}
            >Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              disabled={saving || selected.length === 0}
              onClick={() => updateRoles(user.id, selected)}
            >
              {saving ? 'Saving...' : 'Save Roles'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">All Users</h1>
        <p className="page-subtitle">Manage user accounts and capabilities</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Roles</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const roles = (u.roles?.length) ? u.roles : [u.role];
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.full_name || 'No Name'}</strong>
                        <br/>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{u.email}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {roles.map((r, i) => (
                            <span
                              key={r}
                              className={`badge ${PORTAL_ROLE_COLOR[r] || 'badge-secondary'}`}
                              style={{ textTransform: 'capitalize', fontSize: 11 }}
                            >
                              {i === 0 && roles.length > 1 && <span style={{ opacity: 0.6, marginRight: 2 }}>★</span>}
                              {ROLE_LABELS[r] || r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{timeAgo(u.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12 }}
                          onClick={() => setEditingUser(u.id)}
                        >
                          Edit Roles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Editor Modal */}
      {editingUser && (
        <UserRolesEditor user={users.find(u => u.id === editingUser)} />
      )}
    </div>
  );
}
