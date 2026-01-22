import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// For local development, if you use process.env, ensure it's configured correctly.
// For browser-side code, direct import from constants is often simpler.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Define table names for consistency
export const SUPABASE_TABLES = {
  MEMBERS: 'members',
};
