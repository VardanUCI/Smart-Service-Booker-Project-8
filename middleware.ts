import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// This middleware func runs on every request & makes sure the user's session cookie is refreshed to maintain auth
export async function middleware(request: NextRequest) {
  const { response, userId } = await updateSession(request)
  const { pathname, search } = request.nextUrl
  const protectedPrefixes = [
    '/seeker/results',
    '/provider/onboarding',
    '/provider/dashboard',
    '/provider/requests',
    '/provider/availability',
    '/notifications',
  ]
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute && !userId) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  return response
}


// matches all routes except static assets, favicon, and img files 
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
