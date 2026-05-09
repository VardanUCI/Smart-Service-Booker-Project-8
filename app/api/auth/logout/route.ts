import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import {
  DEV_AUTH_COOKIE,
  DEV_EMAIL_COOKIE,
  DEV_ONBOARDING_COOKIE,
  DEV_ROLE_COOKIE,
} from '@/lib/auth/dev-auth';

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase signOut error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  [DEV_AUTH_COOKIE, DEV_EMAIL_COOKIE, DEV_ROLE_COOKIE, DEV_ONBOARDING_COOKIE].forEach((name) => {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  });

  return response;
}
