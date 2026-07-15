import { createClient, type Provider } from '@supabase/supabase-js'
const supabase = createClient('process.env.NEXT_PUBLIC_SUPABASE_URL!', 'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!')
const provider = 'provider' as Provider
const redirect = (url: string) => {}

// ---cut---
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: 'process.env.CALLBACK_URL!',
  },
})

if (data.url) {
  redirect(data.url)
}