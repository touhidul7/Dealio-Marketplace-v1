'use client';
import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  const isDashboardRoute = pathname?.startsWith('/seller') || 
                           pathname?.startsWith('/buyer') || 
                           pathname?.startsWith('/admin') || 
                           pathname?.startsWith('/advisor') || 
                           pathname?.startsWith('/broker') ||
                           pathname?.startsWith('/settings');

  return (
    <main style={{ 
      minHeight: '100vh', 
      paddingTop: isDashboardRoute ? '0px' : '64px' 
    }}>
      {children}
    </main>
  );
}
