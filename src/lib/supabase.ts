
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase URL or Service Role Key is missing. Check .env.local');
}

// Create a single supabase client for interacting with your database
// Note: We use the Service Role Key to bypass RLS for server-side operations (like Storage upload)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
