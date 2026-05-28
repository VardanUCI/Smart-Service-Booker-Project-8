import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// This middleware func runs on every request & makes sure the user's session cookie is refreshed to maintain auth
export async function middleware(request: NextRequest) {
  const { response, userId, role, emailVerified } = await updateSession(request)
  const { pathname, search } = request.nextUrl
  const protectedPrefixes = [
    '/seeker/results',
    '/seeker/waitlists',
    '/provider/onboarding',
    '/provider/dashboard',
    '/provider/requests',
    '/provider/availability',
    '/notifications',
    '/account',
  ]
  const providerOnlyPrefixes = [
    '/provider/onboarding',
    '/provider/dashboard',
    '/provider/requests',
    '/provider/availability',
  ]
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isProviderOnlyRoute = providerOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute && !userId) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  if (isProtectedRoute && userId && !emailVerified) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('verify', '1')
    signInUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  if (isProviderOnlyRoute && role !== 'business') {
    const deniedUrl = new URL('/provider/access-denied', request.url)
    deniedUrl.searchParams.set('from', `${pathname}${search}`)
    return NextResponse.redirect(deniedUrl)
  }

  return response
}


// matches all routes except static assets, favicon, and img files 
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
