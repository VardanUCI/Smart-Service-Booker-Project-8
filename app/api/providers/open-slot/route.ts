import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
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

  const now = new Date().toISOString();

  const { data: waitlistEntry, error: waitlistError } = await supabase
    .from('waitlists')
    .select('id, user_id, category, service, urgency, contact_method, contact_value')
    .eq('provider_id', user.id)
    .eq('status', 'waiting')
    .gt('expires_at', now)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (waitlistError) {
    console.error('waitlists lookup error:', waitlistError);
    return NextResponse.json({ error: 'Failed to query waitlist' }, { status: 500 });
  }

  if (!waitlistEntry) {
    return NextResponse.json(
      { matched: false, message: 'No one is currently on your waitlist' },
      { status: 200 }
    );
  }

  const { data: booking, error: bookingInsertError } = await supabase
    .from('bookings')
    .insert({
      waitlist_id: waitlistEntry.id,
      provider_id: user.id,
      customer_id: waitlistEntry.user_id,
      slot_id: null,
      status: 'pending',
      notes: 'Provider opened a spot — confirm within 15 minutes',
    })
    .select()
    .single();

  if (bookingInsertError) {
    console.error('bookings insert error:', bookingInsertError);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  const { data: updatedWaitlist, error: waitlistUpdateError } = await supabase
    .from('waitlists')
    .update({ status: 'notified', notified_at: now })
    .eq('id', waitlistEntry.id)
    .select()
    .single();

  if (waitlistUpdateError) {
    console.error('waitlists update error:', waitlistUpdateError);
    return NextResponse.json({ error: 'Failed to update waitlist entry' }, { status: 500 });
  }

  return NextResponse.json({ matched: true, booking, waitlist_entry: updatedWaitlist }, { status: 200 });
}
