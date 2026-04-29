'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, userRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 2000))
      ]);
    } catch (err) {
      console.warn('Signout issue:', err.message);
    } finally {
      setDropdownOpen(false);
      window.location.href = '/';
    }
  };

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'advisor') return '/advisor';
    if (userRole === 'seller') return '/seller';
    if (userRole === 'broker') return '/seller';
    return '/buyer';
  };

  const isHome = pathname === '/';

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${isHome && !scrolled ? styles.transparent : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--primary)"/>
            <path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.logoText}>Dealio</span>
          <span className={styles.logoBadge}>Marketplace</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="/listings" className={`${styles.navLink} ${pathname === '/listings' ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>Browse Listings</Link>
          <Link href="/pricing" className={`${styles.navLink} ${pathname === '/pricing' ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>Pricing</Link>
          {!user ? (
            <>
              <Link href="/login" className={`${styles.navLink} ${styles.hideDesktop}`} onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/signup" className={`btn btn-primary ${styles.hideDesktop}`} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : null}
        </nav>

        <div className={styles.actions}>
          {!user ? (
            <>
              <Link href="/login" className={styles.signIn}>Sign In</Link>
              <Link href="/signup" className="btn btn-primary">Get Started</Link>
            </>
          ) : (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button className={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className={styles.avatar}>{user.email?.[0]?.toUpperCase() || 'U'}</div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4"/></svg>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user.user_metadata?.full_name || user.email}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                    {userRole && <span className={`badge badge-primary ${styles.dropdownBadge}`}>{userRole}</span>}
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <Link href={getDashboardLink()} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                  {userRole === 'seller' && <Link href="/seller/listings/new" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Create Listing</Link>}
                  {userRole === 'buyer' && <Link href="/buyer/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Buyer Profile</Link>}
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.dropdownItem} onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          )}
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
