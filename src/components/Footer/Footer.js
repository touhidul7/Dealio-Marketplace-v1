import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--primary)"/><path d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 24C16 21.791 14.209 20 12 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              <span>Dealio Marketplace</span>
            </Link>
            <p className={styles.desc}>The premium business-for-sale platform. Connect buyers, sellers, and advisors in one trusted marketplace.</p>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Marketplace</h4>
            <Link href="/listings" className={styles.link}>Browse Listings</Link>
            <Link href="/pricing" className={styles.link}>Pricing</Link>
            <Link href="/signup?role=seller" className={styles.link}>List Your Business</Link>
            <Link href="/signup?role=buyer" className={styles.link}>Create Buyer Profile</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Services</h4>
            <Link href="/services#advisory" className={styles.link}>Advisory Services</Link>
            <Link href="/services#valuations" className={styles.link}>Business Valuations</Link>
            <Link href="/services#outreach" className={styles.link}>Buyer Outreach</Link>
            <Link href="/services#support" className={styles.link}>Deal Support</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Company</h4>
            <Link href="/about" className={styles.link}>About Dealio</Link>
            <Link href="/contact" className={styles.link}>Contact Us</Link>
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Dealio Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
