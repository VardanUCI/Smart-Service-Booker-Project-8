import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureUserProfile } from '@/lib/auth/server';
import { getRoleFromUserMetadata, isEmailVerified } from '@/lib/auth/roles';
import {
  DEV_AUTH_COOKIE,
  DEV_EMAIL_COOKIE,
  DEV_ONBOARDING_COOKIE,
  DEV_ROLE_COOKIE,
  getDemoAccount,
} from '@/lib/auth/dev-auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, password } = result.data;
  const demoAccount = getDemoAccount(email, password);

  if (demoAccount) {
    const response = NextResponse.json(
      {
        user: {
          id: `dev-${demoAccount.role}`,
          email: demoAccount.email,
          name: demoAccount.role === 'business' ? 'Demo Business' : 'Demo User',
          phone: null,
          role: demoAccount.role,
          onboarding_completed: demoAccount.onboardingCompleted,
        },
        session: null,
        demo: true,
      },
      { status: 200 }
    );

    response.cookies.set(DEV_AUTH_COOKIE, '1', { path: '/', sameSite: 'lax' });
    response.cookies.set(DEV_EMAIL_COOKIE, demoAccount.email, { path: '/', sameSite: 'lax' });
    response.cookies.set(DEV_ROLE_COOKIE, demoAccount.role, { path: '/', sameSite: 'lax' });
    response.cookies.set(DEV_ONBOARDING_COOKIE, demoAccount.onboardingCompleted ? '1' : '0', {
      path: '/',
      sameSite: 'lax',
    });

    return response;
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('email not confirmed')) {
      return NextResponse.json(
        { error: 'Check your email to verify your account before signing in.' },
        { status: 403 }
      );
    }

    if (authError.status === 400) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.error('Supabase signIn error:', authError);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!isEmailVerified(authData.user)) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: 'Check your email to verify your account before signing in.' },
      { status: 403 }
    );
  }

  const { data: profile, error: profileError } = await ensureUserProfile(
    supabase,
    authData.user,
    getRoleFromUserMetadata(authData.user)
  );

  if (profileError) {
    console.error('users upsert/fetch error:', profileError);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }

  return NextResponse.json(
    { user: profile, session: authData.session },
    { status: 200 }
  );
}
