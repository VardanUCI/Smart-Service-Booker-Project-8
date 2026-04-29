import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.status === 400) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.error('Supabase signIn error:', authError);
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, name, phone, email, created_at')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('users fetch error:', profileError);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }

  return NextResponse.json(
    { user: profile, session: authData.session },
    { status: 200 }
  );
}
