import { createClient } from '@supabase/supabase-js'
import 'server-only' // ⚠️ Prevents this file from being bundled to the client

// This client is for Server Actions and API Routes ONLY.
// It bypasses RLS policies (Admin access).
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
