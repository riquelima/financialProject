
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwvqumyzkezzatuhqoda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3dnF1bXl6a2V6emF0dWhxb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzYxMDQsImV4cCI6MjA2NTM1MjEwNH0.wGSc9wjK1CjwWRg2O8JnYOygkFjESryvQzV90YTRXPY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
