import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdvarqqaqdzzuffjbedw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdmFycXFhcWR6enVmZmpiZWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTk2ODYsImV4cCI6MjA2MDQ3NTY4Nn0.oSPzblcYZzaVrLqvH4welextMm2G__lq-k-3hCNSI4g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);