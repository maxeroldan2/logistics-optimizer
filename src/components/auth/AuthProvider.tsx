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
  
  // Check if we're using placeholder credentials
  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                       import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  const signIn = async (email: string, password: string) => {
    if (isPlaceholder) {
      // Development mode: require specific email/password for testing
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // User will be set via the auth state change listener
  };

  const signUp = async (email: string, password: string) => {
    if (isPlaceholder) {
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
    if (isPlaceholder) {
      setUser(null);
      localStorage.removeItem('mockAuth');
      return;
    }

    await supabase.auth.signOut();
  };

  const createMockUser = (email: string): User => {
    // Create consistent ID based on email to ensure same user gets same ID
    const consistentId = 'mock-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    
    return {
      id: consistentId,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
    aud: 'authenticated',
    confirmation_sent_at: null,
    confirmed_at: new Date().toISOString(),
    email_change_sent_at: null,
    email_confirmed_at: new Date().toISOString(),
    invited_at: null,
    last_sign_in_at: new Date().toISOString(),
    phone: null,
    phone_change_sent_at: null,
    phone_confirmed_at: null,
    recovery_sent_at: null,
      role: 'authenticated'
    } as User;
  };

  useEffect(() => {
    if (isPlaceholder) {
      // Check for existing mock auth in localStorage
      const mockAuth = localStorage.getItem('mockAuth');
      if (mockAuth) {
        try {
          const user = JSON.parse(mockAuth);
          setUser(user);
        } catch (error) {
          localStorage.removeItem('mockAuth');
        }
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Auth error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};