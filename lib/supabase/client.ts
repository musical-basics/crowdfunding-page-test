import { createClient } from '@supabase/supabase-js'

// This client is safe for the browser. It uses the ANON key.
// It respects RLS (Row Level Security) policies.
export const createBrowserClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
