import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const SUPABASE_URL = 'https://yoinjskykjuersbzewlx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaW5qc2t5a2p1ZXJzYnpld2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MDUzMjEsImV4cCI6MjA1MzA4MTMyMX0.Ni3uQh_sMaPiFmMBURJr_bIsR37HnCq-c6PfBD9CLaU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);