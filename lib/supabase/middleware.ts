import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware function for handling Supabase authentication and session management.
 * 
 * This middleware runs on every request and performs the following functions:
 * 1. Creates a Supabase client with proper cookie handling
 * 2. Validates the user's authentication session
 * 3. Redirects unauthenticated users to login (except for auth pages)
 * 4. Maintains session cookies across requests
 * 
 * The middleware is critical for protecting routes and ensuring proper
 * authentication state management throughout the application. It handles
 * cookie synchronization between client and server for seamless auth.
 * 
 * @param request - The incoming Next.js request object
 * @returns NextResponse with proper authentication handling
 * 
 * @example
 * ```ts
 * // Used in middleware.ts
 * export { updateSession as middleware } from '@/lib/supabase/middleware'
 * ```
 */
export async function updateSession(request: NextRequest) {
  // Create the base response that will be modified with auth cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create Supabase client with cookie handling for server-side auth
  // This client can read and write cookies to maintain session state
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies for current request
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          // Create new response with updated cookies
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Set cookies on the response for client-side
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Get the current user from the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is authenticated and not on auth pages
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register')
  ) {
    // Redirect unauthenticated users to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
