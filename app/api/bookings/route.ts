// POST lets a provider accept a seeker's waitlist request, or a customer self-book directly into an open slot.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBusinessAccount } from '@/lib/auth/server';

const providerBookingSchema = z.object({
  waitlist_id: z.string().uuid('Invalid waitlist ID'),
  slot_id: z.string().uuid('Invalid slot ID').optional(),
  notes: z.string().optional(),
});

const customerBookingSchema = z.object({
  waitlist_id: z.undefined(),
  slot_id: z.string().uuid('Invalid slot ID'),
  notes: z.string().optional(),
});

const bookingSchema = z.union([providerBookingSchema, customerBookingSchema]);

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

  const { slot_id, notes } = result.data;
  const waitlist_id = 'waitlist_id' in result.data ? result.data.waitlist_id : undefined;

  // Provider confirms a waitlist request
  if (waitlist_id) {
    const { account, error: businessError, status: businessStatus } = await getBusinessAccount(supabase);
    if (!account || businessError) {
      return NextResponse.json({ error: businessError }, { status: businessStatus });
    }

    const { data: waitlist, error: waitlistError } = await supabase
      .from('waitlists')
      .select('user_id, provider_id, status')
      .eq('id', waitlist_id)
      .single();

    if (waitlistError || !waitlist) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
    }

    if (waitlist.provider_id !== account.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (waitlist.status === 'booked') {
      return NextResponse.json({ error: 'This request has already been booked' }, { status: 409 });
    }

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        waitlist_id,
        provider_id: account.user.id,
        customer_id: waitlist.user_id,
        slot_id: slot_id ?? null,
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

  // Customer self-books directly into an open slot
  if (!slot_id) {
    return NextResponse.json({ error: 'slot_id is required' }, { status: 400 });
  }

  const { data: slot, error: slotLookupError } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('id', slot_id)
    .maybeSingle();

  if (slotLookupError) {
    console.error('availability_slots lookup error:', slotLookupError);
    return NextResponse.json({ error: 'Failed to fetch slot' }, { status: 500 });
  }

  if (!slot) {
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
  }

  if (slot.booked_count >= slot.capacity) {
    return NextResponse.json({ error: 'Slot is fully booked' }, { status: 409 });
  }

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      provider_id: slot.provider_id,
      customer_id: user.id,
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

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings, error: fetchError } = await supabase
    .from('bookings')
    .select(`
      *,
      providers ( business_name, category ),
      availability_slots ( date, start_time, end_time )
    `)
    .eq('customer_id', user.id)
    .order('availability_slots(date)', { ascending: true })
    .order('availability_slots(start_time)', { ascending: true });

  if (fetchError) {
    console.error('bookings fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  return NextResponse.json({ bookings }, { status: 200 });
}
