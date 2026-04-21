import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// This middleware func runs on every request & makes sure the user's session cookie is refreshed to maintain auth
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}


// matches all routes except static assets, favicon, and img files 
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
