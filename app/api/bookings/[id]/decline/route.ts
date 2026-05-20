import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idResult = z.string().uuid('Invalid booking ID').safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: idResult.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: booking, error: lookupError } = await supabase
    .from('bookings')
    .select('id, customer_id, status')
    .eq('id', id)
    .maybeSingle();

  if (lookupError) {
    console.error('bookings lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.customer_id !== user.id) {
    return NextResponse.json({ error: 'You do not own this booking' }, { status: 403 });
  }

  if (booking.status !== 'pending') {
    return NextResponse.json(
      { error: `Cannot decline — booking is in status ${booking.status}` },
      { status: 409 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('bookings update error:', updateError);
    return NextResponse.json({ error: 'Failed to decline booking' }, { status: 500 });
  }

  return NextResponse.json({ booking: updated }, { status: 200 });
}
