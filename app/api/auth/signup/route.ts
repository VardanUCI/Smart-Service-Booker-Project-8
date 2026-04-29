import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AuthError } from '@supabase/supabase-js';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
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

  const { email, password, name, phone } = result.data;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    const err = authError as AuthError;
    if (err.status === 422 || err.message.toLowerCase().includes('already registered')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    console.error('Supabase signUp error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const userId = authData.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Signup failed — no user returned' }, { status: 500 });
  }

  const { error: insertError } = await supabase.from('users').insert({
    id: userId,
    name,
    phone: phone ?? null,
    email,
  });

  if (insertError) {
    console.error('users insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }

  return NextResponse.json(
    { user: { id: userId, email, name, phone: phone ?? null } },
    { status: 201 }
  );
}
