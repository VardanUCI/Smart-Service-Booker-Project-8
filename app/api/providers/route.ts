import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const providerSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  latitude: z.number({ required_error: 'Latitude is required', invalid_type_error: 'Latitude must be a number' }),
  longitude: z.number({ required_error: 'Longitude is required', invalid_type_error: 'Longitude must be a number' }),
  google_place_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = providerSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { business_name, category, address, phone, latitude, longitude, google_place_id } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing, error: lookupError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (lookupError) {
    console.error('providers lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to check existing provider' }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: 'Provider profile already exists for this user' }, { status: 409 });
  }

  const { data: provider, error: insertError } = await supabase
    .from('providers')
    .insert({
      id: user.id,
      business_name,
      category,
      address,
      phone,
      location: `SRID=4326;POINT(${longitude} ${latitude})`,
      is_available: false,
      available_until: null,
      google_place_id: google_place_id ?? null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('providers insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create provider profile' }, { status: 500 });
  }

  return NextResponse.json({ provider }, { status: 201 });
}
