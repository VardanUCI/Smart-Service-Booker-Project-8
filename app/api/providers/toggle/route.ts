import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const toggleSchema = z
  .object({
    is_available: z.boolean({ required_error: 'is_available is required', invalid_type_error: 'is_available must be a boolean' }),
    duration_hours: z
      .number({ invalid_type_error: 'duration_hours must be a number' })
      .min(1, 'duration_hours must be between 1 and 4')
      .max(4, 'duration_hours must be between 1 and 4')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_available && data.duration_hours === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'duration_hours is required when is_available is true',
        path: ['duration_hours'],
      });
    }
  });

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = toggleSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { is_available, duration_hours } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing, error: lookupError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (lookupError) {
    console.error('providers lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to check provider profile' }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
  }

  const updates = is_available
    ? {
        is_available: true,
        available_until: new Date(Date.now() + duration_hours! * 60 * 60 * 1000).toISOString(),
      }
    : {
        is_available: false,
        available_until: null,
      };

  const { data: provider, error: updateError } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('providers update error:', updateError);
    return NextResponse.json({ error: 'Failed to update provider availability' }, { status: 500 });
  }

  return NextResponse.json({ provider }, { status: 200 });
}
