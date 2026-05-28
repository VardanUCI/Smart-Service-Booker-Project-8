// POST lets a customer create a dispatch request (Model C home services); GET returns the customer's own requests.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const dispatchSchema = z.object({
  category: z.string({ required_error: 'category is required' }).min(1, 'category is required'),
  description: z.string().optional(),
  address: z.string({ required_error: 'address is required' }).min(1, 'address is required'),
  latitude: z.number({ required_error: 'latitude is required', invalid_type_error: 'latitude must be a number' }),
  longitude: z.number({ required_error: 'longitude is required', invalid_type_error: 'longitude must be a number' }),
  radius_meters: z.number().int().min(500).max(50000).default(10000),
  expires_in_minutes: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(120),
    z.literal(240),
  ], { invalid_type_error: 'expires_in_minutes must be 30, 60, 120, or 240' }),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = dispatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { category, description, address, latitude, longitude, radius_meters, expires_in_minutes } = result.data;

  const expires_at = new Date(Date.now() + expires_in_minutes * 60 * 1000).toISOString();
  const location = `SRID=4326;POINT(${longitude} ${latitude})`;

  const { data: dispatch, error: insertError } = await supabase
    .from('dispatch_requests')
    .insert({
      customer_id: user.id,
      category,
      description: description ?? null,
      address,
      location,
      radius_meters,
      expires_at,
      status: 'open',
    })
    .select()
    .single();

  if (insertError) {
    console.error('dispatch_requests insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create dispatch request' }, { status: 500 });
  }

  const { data: nearbyProviders, error: rpcError } = await supabase.rpc('get_available_providers_nearby', {
    user_lat: latitude,
    user_lon: longitude,
    search_radius_meters: radius_meters,
    search_category: category,
  });

  if (rpcError) {
    console.error('get_available_providers_nearby error:', rpcError);
    return NextResponse.json({ dispatch, notified_count: 0 }, { status: 201 });
  }

  let notified_count = 0;

  if (nearbyProviders && nearbyProviders.length > 0) {
    const notifications = nearbyProviders.map((p) => ({
      user_id: p.id,
      type: 'request' as const,
      title: 'New dispatch request nearby',
      message: `A customer needs a ${category} in your area: ${address}`,
      action_url: `/dispatch/${dispatch.id}`,
    }));

    const { error: notifError } = await supabase.from('notifications').insert(notifications);
    if (notifError) {
      console.error('notifications insert error:', notifError);
    } else {
      notified_count = notifications.length;
    }
  }

  return NextResponse.json({ dispatch, notified_count }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: dispatch_requests, error: fetchError } = await supabase
    .from('dispatch_requests')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('dispatch_requests fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch dispatch requests' }, { status: 500 });
  }

  return NextResponse.json({ dispatch_requests: dispatch_requests ?? [] });
}
