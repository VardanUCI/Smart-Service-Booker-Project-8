// POST { location: string } → { lat, lng, formattedAddress } — geocodes a ZIP/city string to coordinates using the Google Geocoding API.

import { geocodeLocation } from '@/integration/google-maps';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  location: z.string().min(1, 'Location is required'),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const geocodeResult = await geocodeLocation(result.data.location);

  if (!geocodeResult.success) {
    return NextResponse.json({ error: geocodeResult.error }, { status: 422 });
  }

  return NextResponse.json({
    lat: geocodeResult.lat,
    lng: geocodeResult.lng,
    formattedAddress: geocodeResult.formattedAddress,
  });
}
