import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CONFIRMABLE_STATUSES = ['waiting', 'notified'] as const;

const postSchema = z.object({
  waitlist_id: z.string().uuid('waitlist_id must be a valid UUID'),
  slot_id: z.string().uuid('slot_id must be a valid UUID'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = postSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { waitlist_id, slot_id, notes } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: provider, error: providerLookupError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (providerLookupError) {
    console.error('providers lookup error:', providerLookupError);
    return NextResponse.json({ error: 'Failed to check provider profile' }, { status: 500 });
  }
  if (!provider) {
    return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
  }

  const { data: waitlist, error: waitlistLookupError } = await supabase
    .from('waitlists')
    .select('id, provider_id, user_id, status')
    .eq('id', waitlist_id)
    .maybeSingle();

  if (waitlistLookupError) {
    console.error('waitlists lookup error:', waitlistLookupError);
    return NextResponse.json({ error: 'Failed to fetch waitlist entry' }, { status: 500 });
  }
  if (!waitlist) {
    return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
  }

  if (waitlist.provider_id !== user.id) {
    return NextResponse.json({ error: 'You can only confirm bookings for your own provider profile' }, { status: 403 });
  }

  if (!CONFIRMABLE_STATUSES.includes(waitlist.status)) {
    return NextResponse.json(
      { error: `Cannot book — waitlist is in status ${waitlist.status}` },
      { status: 409 }
    );
  }

  const { data: slot, error: slotLookupError } = await supabase
    .from('availability_slots')
    .select('id, provider_id, capacity, booked_count')
    .eq('id', slot_id)
    .maybeSingle();

  if (slotLookupError) {
    console.error('availability_slots lookup error:', slotLookupError);
    return NextResponse.json({ error: 'Failed to fetch slot' }, { status: 500 });
  }
  if (!slot) {
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
  }

  if (slot.provider_id !== user.id) {
    return NextResponse.json({ error: 'You can only book into your own slots' }, { status: 403 });
  }

  if (slot.booked_count >= slot.capacity) {
    return NextResponse.json({ error: 'Slot is fully booked' }, { status: 409 });
  }

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      waitlist_id,
      provider_id: user.id,
      customer_id: waitlist.user_id,
      slot_id,
      status: 'confirmed',
      notes: notes ?? null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('bookings insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
