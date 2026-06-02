import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDevAccountFromRequest } from '@/lib/auth/dev-auth';
import { createClient } from '@/utils/supabase/server';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function PATCH(request: NextRequest) {
  if (getDevAccountFromRequest(request)) {
    return NextResponse.json({ message: 'Demo account password changes are not persisted' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = passwordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = result.data;
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    console.error('password update error:', updateError);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Password updated' });
}
