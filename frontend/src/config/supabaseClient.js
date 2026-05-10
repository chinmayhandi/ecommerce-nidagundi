import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// In a real app we'd want to use full URLs. But based on user inputs, it looks like only the project ref is given for URL sometimes.
// If it's a ref, we construct the URL.
const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}.supabase.co`

export const supabase = createClient(formattedUrl, supabaseAnonKey)
