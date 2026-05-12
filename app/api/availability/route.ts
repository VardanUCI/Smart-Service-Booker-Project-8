import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const postSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  capacity: z.number({ invalid_type_error: 'capacity must be a number' }).int('capacity must be an integer').min(1, 'capacity must be at least 1').default(1),
});

async function getProviderOrError(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  return { provider: data, lookupError: error };
}

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

  const { date, capacity } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider, lookupError } = await getProviderOrError(supabase, user.id);
  if (lookupError) {
    console.error('providers lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to check provider profile' }, { status: 500 });
  }
  if (!provider) {
    return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return NextResponse.json({ error: 'Date must be today or in the future' }, { status: 400 });
  }

  const { data: existing, error: slotLookupError } = await supabase
    .from('availability_slots')
    .select('id')
    .eq('provider_id', user.id)
    .eq('date', date)
    .maybeSingle();

  if (slotLookupError) {
    console.error('availability_slots lookup error:', slotLookupError);
    return NextResponse.json({ error: 'Failed to check existing slot' }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: 'Slot already exists for this date' }, { status: 409 });
  }

  const { data: slot, error: insertError } = await supabase
    .from('availability_slots')
    .insert({
      provider_id: user.id,
      date,
      capacity,
      booked_count: 0,
    })
    .select()
    .single();

  if (insertError) {
    console.error('availability_slots insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create availability slot' }, { status: 500 });
  }

  return NextResponse.json({ slot }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from') ?? new Date().toISOString().slice(0, 10);
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider, lookupError } = await getProviderOrError(supabase, user.id);
  if (lookupError) {
    console.error('providers lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to check provider profile' }, { status: 500 });
  }
  if (!provider) {
    return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
  }

  const { data: slots, error: fetchError } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('provider_id', user.id)
    .gte('date', from)
    .order('date', { ascending: true });

  if (fetchError) {
    console.error('availability_slots fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch availability slots' }, { status: 500 });
  }

  return NextResponse.json({ slots }, { status: 200 });
}
