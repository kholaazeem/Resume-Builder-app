import { createClient } from '@supabase/supabase-js'

// Apni asli URL aur Key yahan string ke andar paste karein
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

export const supabase = createClient(supabaseUrl, supabaseKey)