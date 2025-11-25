import { createClient } from '@supabase/supabase-js';

// Extract credentials from connection string
// postgresql://postgres:[PASSWORD]@db.cbjdasfnwzizfphnwxfd.supabase.co:5432/postgres
const SUPABASE_URL = 'https://cbjdasfnwzizfphnwxfd.supabase.co';
// @ts-ignore - Vite env
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Warn if no anon key is set
if (!SUPABASE_ANON_KEY) {
    console.warn('⚠️  VITE_SUPABASE_ANON_KEY not set. Database features will not work. Add your Supabase anon key to .env.local');
}

// For development, we'll use the service role key if available
// In production, you should use the anon key and implement Row Level Security (RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'dummy-key-for-development');

// Helper to check connection
export const testConnection = async () => {
    if (!SUPABASE_ANON_KEY) {
        console.warn('⚠️  Skipping Supabase connection test - no anon key configured');
        return false;
    }

    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
    }
};
