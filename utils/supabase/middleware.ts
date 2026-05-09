import { createServerClient } from '@supabase/ssr'
import { getRoleFromUserMetadata, isEmailVerified, normalizeAccountRole } from '@/lib/auth/roles'
import { getDevAccountFromRequest } from '@/lib/auth/dev-auth'
import { NextResponse, type NextRequest } from 'next/server'

type SessionUpdateResult = {
  response: NextResponse
  userId: string | null
  role: 'user' | 'business' | null
  emailVerified: boolean
  onboardingCompleted: boolean
}

// This refreshes the user's session cookie on every request so they stay logged in while navigating
export async function updateSession(request: NextRequest): Promise<SessionUpdateResult> {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const devAccount = getDevAccountFromRequest(request)

  if (devAccount) {
    return {
      response: supabaseResponse,
      userId: devAccount.id,
      role: devAccount.role,
      emailVerified: devAccount.emailVerified,
      onboardingCompleted: devAccount.onboardingCompleted,
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Avoid crashing middleware in local dev when Supabase env vars are not set yet.
  if (!supabaseUrl || !supabaseAnonKey) {
    return { response: supabaseResponse, userId: null, role: null, emailVerified: false, onboardingCompleted: false }
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
    return { response: supabaseResponse, userId: null, role: null, emailVerified: false, onboardingCompleted: false }
  }

  if (!data.user) {
    return { response: supabaseResponse, userId: null, role: null, emailVerified: false, onboardingCompleted: false }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, onboarding_completed')
    .eq('id', data.user.id)
    .maybeSingle()

  let role = normalizeAccountRole(profile?.role ?? getRoleFromUserMetadata(data.user))
  let onboardingCompleted = Boolean(profile?.onboarding_completed)

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (provider) {
    role = 'business'
    onboardingCompleted = Boolean(provider)
  }

  return {
    response: supabaseResponse,
    userId: data.user.id,
    role,
    emailVerified: isEmailVerified(data.user),
    onboardingCompleted,
  }
}
