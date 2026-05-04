import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type SessionUpdateResult = {
  response: NextResponse
  userId: string | null
}

// This refreshes the user's session cookie on every request so they stay logged in while navigating
export async function updateSession(request: NextRequest): Promise<SessionUpdateResult> {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Avoid crashing middleware in local dev when Supabase env vars are not set yet.
  if (!supabaseUrl || !supabaseAnonKey) {
    return { response: supabaseResponse, userId: null }
  }

  // Creates the supabase server client w/ env variables for url & anon key
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // get all cookies from incoming request
        getAll() {
          return request.cookies.getAll()
        },
        // set cookies in request & response objects & update response obj w modified reqeust
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the session token to keep user authenticated.
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    return { response: supabaseResponse, userId: null }
  }

  return { response: supabaseResponse, userId: data.user?.id ?? null }
}
