import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CANCELLABLE_STATUSES = ['waiting', 'notified'] as const;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idResult = z.string().uuid('Invalid waitlist entry ID').safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: idResult.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: entry, error: lookupError } = await supabase
    .from('waitlists')
    .select('id, user_id, status')
    .eq('id', id)
    .maybeSingle();

  if (lookupError) {
    console.error('waitlists lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to fetch waitlist entry' }, { status: 500 });
  }

  if (!entry) {
    return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
  }

  if (entry.user_id !== user.id) {
    return NextResponse.json({ error: 'You do not own this waitlist entry' }, { status: 403 });
  }

  if (!CANCELLABLE_STATUSES.includes(entry.status as typeof CANCELLABLE_STATUSES[number])) {
    return NextResponse.json(
      { error: `Cannot cancel — entry is already in status ${entry.status}` },
      { status: 409 }
    );
  }

  const { data: waitlist, error: updateError } = await supabase
    .from('waitlists')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('waitlists update error:', updateError);
    return NextResponse.json({ error: 'Failed to cancel waitlist entry' }, { status: 500 });
  }

  return NextResponse.json({ waitlist }, { status: 200 });
}
