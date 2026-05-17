'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { canAccessPortal, getFirstAvailablePortal, PORTAL_LABELS, PORTAL_ROLES, getAccessiblePortals, ROLE_LABELS } from '@/lib/roles';
import styles from './DashLayout.module.css';

export default function DashLayout({ children, role }) {
  const { user, userRoles, userRole, userPlan, loading, supabase } = useAuth();
  const [sideOpen, setSideOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const portalDropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const [mfaChecking, setMfaChecking] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (portalDropdownRef.current && !portalDropdownRef.current.contains(event.target)) {
        setPortalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      // Check MFA status
      const checkMfa = async () => {
        try {
          const { data: { currentLevel, nextLevel } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (currentLevel === 'aal1' && nextLevel === 'aal2') {
            const mfaUrl = new URL('/auth/mfa-verify', window.location.origin);
            mfaUrl.searchParams.set('redirect', pathname);
            router.push(mfaUrl.pathname + mfaUrl.search);
            return;
          }
        } catch (e) {
          console.warn('MFA check failed:', e);
        }
        
        setMfaChecking(false);

        // Multi-role authorization: check if user has ANY role that grants portal access
        if (userRoles?.length && !canAccessPortal(userRoles, role)) {
          router.push(getFirstAvailablePortal(userRoles));
        }
      };

      checkMfa();
    }
  }, [user, userRoles, loading, role, router, pathname, supabase]);

  if (loading || !user || mfaChecking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;
  }

  const isAuthorized = !userRoles?.length || canAccessPortal(userRoles, role);

  if (!isAuthorized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;
  }


  const navItems = {
    seller: [
      { href: '/seller', label: 'Dashboard', icon: '📊' },
      { href: '/seller/listings', label: 'My Listings', icon: '📋' },
      { href: '/seller/listings/new', label: 'New Listing', icon: '➕' },
      { href: '/seller/inquiries', label: 'Inquiries', icon: '📬' },
      { href: '/seller/services', label: 'Services', icon: '⭐' },
      { href: '/seller/saved', label: 'Saved Listings', icon: '♥' },
      { href: '/requests', label: 'Requests', icon: '📢' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
    buyer: [
      { href: '/buyer', label: 'Dashboard', icon: '📊' },
      { href: '/buyer/profile', label: 'My Profile', icon: '👤' },
      { href: '/buyer/matches', label: 'Matches', icon: '🎯' },
      { href: '/buyer/saved', label: 'Saved Listings', icon: '♥' },
      { href: '/buyer/inquiries', label: 'My Inquiries', icon: '📬' },
      { href: '/buyer/services', label: 'Advisory Services', icon: '⭐' },
      { href: '/requests', label: 'Requests', icon: '📢' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
    broker: [
      { href: '/broker', label: 'Dashboard', icon: '📊' },
      { href: '/broker/profile', label: 'My Profile', icon: '👤' },
      { href: '/broker/listings', label: 'Client Listings', icon: '📋' },
      { href: '/broker/listings/new', label: 'New Listing', icon: '➕' },
      { href: '/broker/inquiries', label: 'Inquiries', icon: '📬' },
      { href: '/broker/services', label: 'Services', icon: '⭐' },
      { href: '/broker/saved', label: 'Saved Listings', icon: '♥' },
      { href: '/requests', label: 'Requests', icon: '📢' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
    admin: [
      { href: '/admin', label: 'Overview', icon: '📊' },
      { href: '/admin/listings', label: 'All Listings', icon: '📋' },
      { href: '/admin/users', label: 'All Users', icon: '👥' },
      { href: '/admin/inquiries', label: 'Inquiries', icon: '📬' },
      { href: '/admin/purchases', label: 'Purchases', icon: '💳' },
      { href: '/admin/services', label: 'Service Requests', icon: '⭐' },
      { href: '/admin/saved', label: 'Saved Listings', icon: '♥' },
      { href: '/admin/requests', label: 'Requests', icon: '📢' },
      { href: '/admin/blog', label: 'Blog Posts', icon: '📝' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
    advisor: [
      { href: '/advisor', label: 'Dashboard', icon: '📊' },
      { href: '/advisor/profile', label: 'My Profile', icon: '👤' },
      { href: '/advisor/inquiries', label: 'Assigned Leads', icon: '📬' },
      { href: '/advisor/matches', label: 'Client Matches', icon: '🎯' },
      { href: '/advisor/services', label: 'Service Requests', icon: '⭐' },
      { href: '/advisor/saved', label: 'Saved Listings', icon: '♥' },
      { href: '/requests', label: 'Requests', icon: '📢' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
  };

  const items = navItems[role] || [];
  const roleLabels = PORTAL_LABELS;

  // Get all portals this user can access (for the portal switcher)
  const accessiblePortals = getAccessiblePortals(userRoles);
  const showPortalSwitcher = accessiblePortals.length > 1;

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Don't wait forever for signout if network is hung
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 2000))
      ]);
    } catch (err) {
      console.warn('Signout issue:', err.message);
    } finally {
      // Always redirect, which forces a full page reload and clears in-memory state
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sideOpen ? styles.sideOpen : ''}`}>
        <div className={styles.sideHeader}>
          <Link href="/" className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--primary)"/><path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            <span>Dealio</span>
          </Link>
          
          {/* Portal Switcher Dropdown */}
          {showPortalSwitcher ? (
            <div style={{ marginTop: '12px', position: 'relative' }} ref={portalDropdownRef}>
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <span>{PORTAL_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1)}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: portalDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {portalDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--gray-800)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  zIndex: 50,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {accessiblePortals.filter(p => p !== 'admin' || userRoles.includes('admin')).map(portal => (
                    <button
                      key={portal}
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        setSideOpen(false);
                        router.push(`/${portal}`);
                      }}
                      style={{
                        padding: '10px 12px',
                        background: portal === role ? 'var(--primary)' : 'transparent',
                        color: portal === role ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseOver={e => { if (portal !== role) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={e => { if (portal !== role) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; } }}
                    >
                      {PORTAL_LABELS[portal] || portal.charAt(0).toUpperCase() + portal.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className={styles.portalLabel}>{roleLabels[role]}</span>
          )}
        </div>

        {/* Portal Switcher was moved to sideHeader */}

        <nav className={styles.nav}>
          {items.map(item => (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${pathname === item.href ? styles.navActive : ''}`} onClick={() => setSideOpen(false)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sideFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.email?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className={styles.userName}>{user?.user_metadata?.full_name || 'User'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
              {/* Show condensed role badges */}
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <span className="badge badge-primary" style={{ fontSize: '10px', padding: '3px 8px', textTransform: 'capitalize' }}>
                  {ROLE_LABELS[userRoles[0]] || userRoles[0]}
                </span>
                {userRoles.length > 1 && (
                  <span 
                    className="badge" 
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '10px', padding: '3px 8px' }} 
                    title={userRoles.slice(1).map(r => ROLE_LABELS[r]).join(', ')}
                  >
                    +{userRoles.length - 1} more
                  </span>
                )}
              </div>
              {role === 'seller' && userPlan && (
                <div style={{ marginTop: '4px' }}>
                  <Link href="/pricing" style={{ textDecoration: 'none' }}>
                    <span className="badge badge-primary" style={{ fontSize: '11px', padding: '3px 8px', textTransform: 'capitalize', cursor: 'pointer' }}>
                      {userPlan} Plan
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Overlay */}
      {sideOpen && <div className={styles.overlay} onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSideOpen(!sideOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div className={styles.topbarRight}>
            <Link href="/listings" className="btn btn-secondary btn-sm">View Marketplace</Link>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
