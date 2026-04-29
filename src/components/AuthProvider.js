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
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchingRole = useRef(false);

  const fetchRole = async (userId) => {
    // Prevent concurrent role fetches
    if (fetchingRole.current) return;
    fetchingRole.current = true;
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      if (profile) setUserRole(profile.role);
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
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) {
          setUser(u);
          await fetchRole(u.id);
        }
      } catch (err) {
        // Ignore lock errors on initial load — the onAuthStateChange will recover
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
    <AuthContext.Provider value={{ user, userRole, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}
