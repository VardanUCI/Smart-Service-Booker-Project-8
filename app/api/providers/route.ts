import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBusinessAccount } from '@/lib/auth/server';
import { DEV_ONBOARDING_COOKIE, getDevAccountFromRequest } from '@/lib/auth/dev-auth';
import type { TablesUpdate } from '@/types/database.types';

export async function GET() {
  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { data: provider, error: fetchError } = await supabase
    .from('providers')
    .select('id, business_name, category, address, phone, is_available, available_until')
    .eq('id', account.user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('providers fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch provider profile' }, { status: 500 });
  }

  if (!provider) {
    return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
  }

  return NextResponse.json({ provider });
}

const patchSchema = z
  .object({
    is_available: z.boolean().optional(),
    available_until: z.string().datetime().nullable().optional(),
    business_name: z.string().min(1).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    latitude: z.number({ invalid_type_error: 'latitude must be a number' }).optional(),
    longitude: z.number({ invalid_type_error: 'longitude must be a number' }).optional(),
  })
  .refine(
    (data) => (data.latitude === undefined) === (data.longitude === undefined),
    { message: 'latitude and longitude must both be provided together' },
  );

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { latitude, longitude, ...fields } = result.data;
  const updatePayload: TablesUpdate<'providers'> = { ...fields };
  if (latitude !== undefined && longitude !== undefined) {
    updatePayload.location = `SRID=4326;POINT(${longitude} ${latitude})`;
  }

  const { data: provider, error: updateError } = await supabase
    .from('providers')
    .update(updatePayload)
    .eq('id', account.user.id)
    .select()
    .single();

  if (updateError) {
    console.error('providers update error:', updateError);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }

  return NextResponse.json({ provider });
}

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
  const devAccount = getDevAccountFromRequest(request);

  if (devAccount?.role === 'business') {
    const response = NextResponse.json(
      {
        provider: {
          id: devAccount.id,
          business_name,
          category,
          address,
          phone,
          location: `SRID=4326;POINT(${longitude} ${latitude})`,
          is_available: false,
          available_until: null,
          google_place_id: google_place_id ?? null,
        },
        demo: true,
      },
      { status: 201 }
    );

    response.cookies.set(DEV_ONBOARDING_COOKIE, '1', { path: '/', sameSite: 'lax' });
    return response;
  }

  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { data: existing, error: lookupError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', account.user.id)
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
      id: account.user.id,
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

  const { error: profileError } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', account.user.id);

  if (profileError) {
    console.error('users onboarding update error:', profileError);
  }

  return NextResponse.json({ provider }, { status: 201 });
}
