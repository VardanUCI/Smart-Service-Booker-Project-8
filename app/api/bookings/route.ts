// POST lets a provider accept a seeker's waitlist request, or a customer self-book directly into an open slot.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBusinessAccount } from '@/lib/auth/server';
import { sendSpotAvailableEmail } from '@/lib/email';

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
      .select('user_id, provider_id, status, contact_method, contact_value, category, service')
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

    // Mark waitlist as booked
    const { error: wlUpdateError } = await supabase
      .from('waitlists')
      .update({ status: 'booked' })
      .eq('id', waitlist_id);
    if (wlUpdateError) console.error('waitlist status update error:', wlUpdateError);

    // Send confirmation email to the customer if they chose email contact
    if (waitlist.contact_method === 'email' && waitlist.contact_value) {
      const { data: provider } = await supabase
        .from('providers')
        .select('business_name')
        .eq('id', account.user.id)
        .maybeSingle();
      const businessName = provider?.business_name ?? 'Your service provider';
      sendSpotAvailableEmail(
        waitlist.contact_value,
        businessName,
        waitlist.service ?? waitlist.category,
      ).catch((err) => console.error('booking confirmation email error:', err));
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

  const { data: rawBookings, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', user.id);

  if (fetchError) {
    console.error('bookings fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  if (!rawBookings || rawBookings.length === 0) {
    return NextResponse.json({ bookings: [] }, { status: 200 });
  }

  const providerIds = [...new Set(rawBookings.map((b) => b.provider_id))];
  const slotIds = [...new Set(rawBookings.map((b) => b.slot_id).filter((id): id is string => id !== null))];

  const [providersResult, slotsResult] = await Promise.all([
    supabase
      .from('providers')
      .select('id, business_name, category')
      .in('id', providerIds),
    slotIds.length > 0
      ? supabase
          .from('availability_slots')
          .select('id, date, start_time, end_time')
          .in('id', slotIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (providersResult.error) {
    console.error('providers fetch error:', providersResult.error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }

  if (slotsResult.error) {
    console.error('availability_slots fetch error:', slotsResult.error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }

  const providerMap = new Map((providersResult.data ?? []).map((p) => [p.id, p]));
  const slotMap = new Map((slotsResult.data ?? []).map((s) => [s.id, s]));

  const bookings = rawBookings
    .map((booking) => ({
      ...booking,
      provider: providerMap.get(booking.provider_id) ?? null,
      slot: booking.slot_id ? (slotMap.get(booking.slot_id) ?? null) : null,
    }))
    .sort((a, b) => {
      const dateA = a.slot?.date ?? '';
      const dateB = b.slot?.date ?? '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.slot?.start_time ?? '';
      const timeB = b.slot?.start_time ?? '';
      return timeA.localeCompare(timeB);
    });

  return NextResponse.json({ bookings }, { status: 200 });
}
