import { createClient } from '@supabase/supabase-js';

const mySupaUrl = import.meta.env.VITE_SUPABASE_URL;
const mySupaKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(mySupaUrl, mySupaKey);