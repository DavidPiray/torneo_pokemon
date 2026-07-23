import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  // Fallbacks para evitar romper la compilación de build
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)