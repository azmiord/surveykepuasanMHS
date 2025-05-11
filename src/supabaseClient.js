import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hogxyjhgngotccaldjbm.supabase.co'; // replace this
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZ3h5amhnbmdvdGNjYWxkamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzOTI3MzgsImV4cCI6MjA2MTk2ODczOH0.Hlt2e_Q8j2xW_ox43U7kMVlOiKWdufwDCTVJ4tE-pIk'; // replace this

export const supabase = createClient(supabaseUrl, supabaseKey);
