import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idResult = z.string().uuid('Invalid provider ID').safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: idResult.error.errors[0].message }, { status: 400 });
  }

  const from = request.nextUrl.searchParams.get('from') ?? new Date().toISOString().split('T')[0];

  const supabase = await createClient();

  const { data: provider, error: providerLookupError } = await supabase
    .from('providers')
    .select('id, business_name, category')
    .eq('id', id)
    .maybeSingle();

  if (providerLookupError) {
    console.error('providers lookup error:', providerLookupError);
    return NextResponse.json({ error: 'Failed to verify provider' }, { status: 500 });
  }

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { data: rows, error: slotsError } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('provider_id', id)
    .gte('date', from)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (slotsError) {
    console.error('availability_slots fetch error:', slotsError);
    return NextResponse.json({ error: 'Failed to fetch availability slots' }, { status: 500 });
  }

  const slots = (rows ?? []).map((slot) => ({
    ...slot,
    is_available: slot.booked_count < slot.capacity,
  }));

  return NextResponse.json(
    { provider: { id: provider.id, business_name: provider.business_name, category: provider.category }, slots },
    { status: 200 }
  );
}
