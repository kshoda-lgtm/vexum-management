import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzmndwlqsrsghvwzgkqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bW5kd2xxc3JzZ2h2d3pna3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDY0MTcsImV4cCI6MjA3NDk4MjQxN30.JnOQMHXQdfOFrH5xwPArATmKgGOHfNq1opXFFfGm9Xw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
