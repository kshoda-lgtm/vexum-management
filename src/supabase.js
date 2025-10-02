import { createClient } from '@supabase/supabase-js';

// Supabase設定（後で実際の値に置き換えてください）
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
