// DELETE removes a provider's availability slot; PATCH updates its date, time, or capacity.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const patchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
});

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('id', id)
    .eq('provider_id', user.id);

  if (error) {
    console.error('availability_slots delete error:', error);
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const { data: slot, error: updateError } = await supabase
    .from('availability_slots')
    .update(result.data)
    .eq('id', id)
    .eq('provider_id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('availability_slots update error:', updateError);
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 });
  }

  return NextResponse.json({ slot });
}
