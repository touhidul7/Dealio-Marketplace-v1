'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext({ user: null, userRole: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchingRole = useRef(false);

  const fetchRole = async (userId) => {
    // Prevent concurrent role fetches
    if (fetchingRole.current) return;
    fetchingRole.current = true;
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
      );
      
      const rolePromise = supabase.from('users').select('role, package_type, package_expiry').eq('id', userId).single();
      const { data: profile } = await Promise.race([rolePromise, timeoutPromise]);
      
      if (profile) {
        setUserRole(profile.role);
        const isExpired = profile.package_expiry && new Date(profile.package_expiry) < new Date();
        setUserPlan(isExpired ? 'basic' : (profile.package_type || 'basic'));
      }
    } catch (err) {
      console.error('Failed to fetch user role:', err);
    } finally {
      fetchingRole.current = false;
    }
  };

  useEffect(() => {
    // Single initial auth check for the entire app
    const initAuth = async () => {
      try {
        // Use a timeout to prevent the app from hanging if Supabase auth lock is stuck
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 3000)
        );
        
        const authPromise = supabase.auth.getUser();
        const { data: { user: u } } = await Promise.race([authPromise, timeoutPromise]);
        
        if (u) {
          setUser(u);
          await fetchRole(u.id);
        }
      } catch (err) {
        // Ignore lock errors or timeouts on initial load — the onAuthStateChange will recover
        console.warn('Initial auth check:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Only fetch role if it's a new sign-in or we don't have a role yet
          if (event === 'SIGNED_IN' || !userRole) {
            await fetchRole(session.user.id);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, userRole, userPlan, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}
