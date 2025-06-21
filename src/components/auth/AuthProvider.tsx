import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if we're using placeholder credentials (excluding local Supabase development)
  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                       import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
  const forceRealAuth = import.meta.env.VITE_FORCE_REAL_AUTH === 'true';
  const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
  const useRealAuth = (!isPlaceholder || forceRealAuth) && !forceLocalStorage;

  const signIn = async (email: string, password: string) => {
    if (!useRealAuth) {
      // Mock authentication mode (placeholder credentials only)
      if (email === 'demo@example.com' && password === 'demo123') {
        const mockUser = createMockUser(email);
        setUser(mockUser);
        localStorage.setItem('mockAuth', JSON.stringify(mockUser));
        return;
      } else {
        throw new Error('Invalid credentials. In development mode, use: demo@example.com / demo123');
      }
    }

    // Real Supabase authentication
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // User will be set via the auth state change listener
  };

  const signUp = async (email: string, password: string) => {
    if (!useRealAuth) {
      // Development mode: simulate registration with validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      const mockUser = createMockUser(email);
      setUser(mockUser);
      localStorage.setItem('mockAuth', JSON.stringify(mockUser));
      return;
    }

    // Real Supabase authentication
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });
    if (error) throw error;
    
    // In real Supabase, user might need email confirmation
    if (data.user && !data.session) {
      throw new Error('Please check your email and click the confirmation link to complete registration.');
    }
  };

  const signOut = async () => {
    if (!useRealAuth) {
      setUser(null);
      localStorage.removeItem('mockAuth');
      return;
    }

    await supabase.auth.signOut();
  };

  const createMockUser = (email: string): User => {
    // Create consistent UUID-like ID based on email for PostgreSQL compatibility
    // Generate a deterministic hex string from email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash + email.charCodeAt(i)) & 0xffffffff;
    }
    // Convert to positive hex and pad to 32 characters
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
    const consistentId = [
      hexHash.substring(0, 8),
      hexHash.substring(8, 12),
      hexHash.substring(12, 16),
      hexHash.substring(16, 20),
      hexHash.substring(20, 32)
    ].join('-');
    
    // Create a mock user object that matches the User type from Supabase
    const mockUser = {
      id: consistentId,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: undefined,
      confirmed_at: new Date().toISOString(),
      email_change_sent_at: undefined,
      email_confirmed_at: new Date().toISOString(),
      invited_at: undefined,
      last_sign_in_at: new Date().toISOString(),
      phone: undefined,
      phone_change_sent_at: undefined,
      phone_confirmed_at: undefined,
      recovery_sent_at: undefined,
      role: 'authenticated'
    };
    
    return mockUser as User;
  };

  useEffect(() => {
    if (!useRealAuth) {
      // Check for existing mock auth in localStorage
      const mockAuth = localStorage.getItem('mockAuth');
      if (mockAuth) {
        try {
          const user = JSON.parse(mockAuth);
          setUser(user);
        } catch {
          localStorage.removeItem('mockAuth');
        }
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Validate that the user actually exists in the auth system
        try {
          const { data: { user: authUser }, error } = await supabase.auth.getUser();
          if (error || !authUser) {
            console.warn('⚠️  Invalid session detected, signing out...');
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(authUser);
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          console.warn('⚠️  Session validation failed, signing out...');
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Auth error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Validate new sign-ins
        try {
          const { data: { user: authUser }, error } = await supabase.auth.getUser();
          if (error || !authUser) {
            console.warn('⚠️  Invalid session after sign-in, signing out...');
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(authUser);
          }
        } catch (error) {
          console.error('Auth validation error on sign-in:', error);
          setUser(null);
        }
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [useRealAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
