import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AuthError } from '@supabase/supabase-js';
import { ensureUserProfile } from '@/lib/auth/server';
import { isEmailVerified, normalizeAccountRole } from '@/lib/auth/roles';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    businessLocation: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['user', 'business']).optional(),
    accountType: z.enum(['user', 'business']).optional(),
  })
  .transform((value) => ({
    ...value,
    role: normalizeAccountRole(value.role ?? value.accountType),
  }))
  .refine((value) => value.role !== 'business' || Boolean(value.businessLocation?.trim()), {
    message: 'Business location is required',
    path: ['businessLocation'],
  });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = signupSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, password, name, phone, businessLocation, role } = result.data;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/signin?verified=1`,
      data: {
        name,
        business_location: businessLocation ?? null,
        phone: phone ?? null,
        role,
        account_type: role,
      },
    },
  });

  if (authError) {
    const err = authError as AuthError;
    if (err.status === 422 || err.message.toLowerCase().includes('already registered')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    console.error('Supabase signUp error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const user = authData.user;
  if (!user) {
    return NextResponse.json({ error: 'Signup failed - no user returned' }, { status: 500 });
  }

  const requiresEmailVerification = !authData.session || !isEmailVerified(user);

  if (requiresEmailVerification) {
    return NextResponse.json(
      {
        requiresEmailVerification: true,
        message: 'Check your email to verify your account before signing in.',
      },
      { status: 201 }
    );
  }

  const { data: profile, error: insertError } = await ensureUserProfile(supabase, user, role);

  if (insertError) {
    console.error('users upsert error:', insertError);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }

  return NextResponse.json(
    { user: profile },
    { status: 201 }
  );
}
