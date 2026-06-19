import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wotrgirjfbahtrimdeyw.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdHJnaXJqZmJhaHRyaW1kZXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzMyMjMsImV4cCI6MjA5MTQwOTIyM30.tINaw6_yXA9mnX2p5MI7ObGmQTet6NRpwQ-LIRWo1e0';

export const supabase = createClient(supabaseUrl, supabaseKey);