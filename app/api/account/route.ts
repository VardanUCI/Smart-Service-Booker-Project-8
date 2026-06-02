import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const patchSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    phone: z.string().nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.phone !== undefined, {
    message: 'At least one field (name or phone) must be provided',
  });

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: fetchError } = await supabase
    .from('users')
    .select('id, email, name, phone, role, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    console.error('users fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }

  return NextResponse.json({ user: profile });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: updateError } = await supabase
    .from('users')
    .update(result.data)
    .eq('id', user.id)
    .select('id, email, name, phone, role, onboarding_completed')
    .single();

  if (updateError) {
    console.error('users update error:', updateError);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ user: profile });
}
