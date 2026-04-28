import './globals.css';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Dealio Marketplace – Buy & Sell Businesses',
  description: 'The premium business-for-sale marketplace. List your business, find acquisition opportunities, and connect with advisors on Dealio.',
  keywords: 'business for sale, buy a business, sell a business, business marketplace, M&A, acquisitions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ minHeight: '100vh', paddingTop: '64px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
