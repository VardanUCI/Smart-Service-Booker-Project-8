// POST lets a provider accept a seeker's waitlist request, creating a confirmed booking and triggering an automatic customer notification.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bookingSchema = z.object({
  waitlist_id: z.string().uuid('Invalid waitlist ID'),
  slot_id: z.string().uuid('Invalid slot ID').optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = bookingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { waitlist_id, slot_id } = result.data;

  // Fetch the waitlist entry to get the customer_id and validate this provider owns it
  const { data: waitlist, error: waitlistError } = await supabase
    .from('waitlists')
    .select('user_id, provider_id, status')
    .eq('id', waitlist_id)
    .single();

  if (waitlistError || !waitlist) {
    return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
  }

  if (waitlist.provider_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (waitlist.status === 'booked') {
    return NextResponse.json({ error: 'This request has already been booked' }, { status: 409 });
  }

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      waitlist_id,
      provider_id: user.id,
      customer_id: waitlist.user_id,
      slot_id: slot_id ?? null,
      status: 'confirmed',
    })
    .select()
    .single();

  if (insertError) {
    console.error('bookings insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
