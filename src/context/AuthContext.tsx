/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log("Calling supabase.auth.getSession()...");
      const { data, error } = await supabase.auth.getSession();
      console.log("getSession() complete. Data:", data, "Error:", error);
      
      // Set the user from the session, if available
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };
    loadUser();

    // Listen to auth state changes and add a log there as well.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed. Event:", event, "Session:", session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
