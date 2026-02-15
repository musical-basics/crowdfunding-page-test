import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
    // Only run on the root path
    if (request.nextUrl.pathname === '/') {
        // middleware disabled
        return NextResponse.next()

        /*
        // Check for existing cookie
        const variantCookie = request.cookies.get('landing_page_variant')
        let variant = variantCookie?.value

        // If no cookie, get next variant from database (round-robin)
        if (!variant) {
            try {
                const supabase = createClient(supabaseUrl, supabaseAnonKey)
                const { data, error } = await supabase.rpc('get_next_traffic_variant', {
                    campaign_id_input: 'dreamplay-one'
                })

                if (error) {
                    console.error('Traffic toggle RPC error:', error)
                    variant = 'a' // Default to 'a' on error
                } else {
                    variant = data as string
                }
            } catch (e) {
                console.error('Middleware error:', e)
                variant = 'a' // Default to 'a' on error
            }
        }

        // Determine destination based on variant
        // Variant A: Internal Campaign Page (/dreamplay-one)
        // Variant B: External Checkout Page
        let destination = '/dreamplay-one'

        if (variant === 'b') {
            destination = 'https://www.dreamplaypianos.com/checkout-pages/customize'
        }

        // Create response with redirect
        const response = NextResponse.redirect(new URL(destination, request.url))

        // Set cookie if it didn't exist
        if (!variantCookie) {
            response.cookies.set('landing_page_variant', variant, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                sameSite: 'lax',
            })
        }

        return response
        */
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
