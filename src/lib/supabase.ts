import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Check if we're using local development setup
const isLocalDevelopment = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');

// Check if we're using real Supabase credentials
const hasRealCredentials = import.meta.env.VITE_SUPABASE_URL && 
                          import.meta.env.VITE_SUPABASE_ANON_KEY &&
                          !isLocalDevelopment;

if (isLocalDevelopment) {
  console.log('🔧 Development Mode: Using local Supabase instance at', supabaseUrl);
} else if (!hasRealCredentials) {
  console.warn('🔧 Development Mode: Using mock authentication. For production, configure:\n' +
               '   - VITE_SUPABASE_URL=your_supabase_project_url\n' +
               '   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n' +
               '   Login with: demo@example.com / demo123');
} else {
  console.log('✅ Connected to Supabase:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { hasRealCredentials };