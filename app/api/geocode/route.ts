// POST { location: string } → { lat, lng, formattedAddress }
// POST { lat: number, lng: number } → { zipOrCity, formattedAddress }

import { geocodeLocation, reverseGeocodeLocation } from '@/integration/google-maps';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const forwardSchema = z.object({ location: z.string().min(1) }).strict();
const reverseSchema = z.object({ lat: z.number().finite(), lng: z.number().finite() }).strict();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const reverse = reverseSchema.safeParse(body);
  if (reverse.success) {
    const result = await reverseGeocodeLocation(reverse.data.lat, reverse.data.lng);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }
    return NextResponse.json({ zipOrCity: result.zipOrCity, formattedAddress: result.formattedAddress });
  }

  const forward = forwardSchema.safeParse(body);
  if (!forward.success) {
    return NextResponse.json({ error: 'Provide either { location } or { lat, lng }' }, { status: 400 });
  }

  const geocodeResult = await geocodeLocation(forward.data.location);
  if (!geocodeResult.success) {
    return NextResponse.json({ error: geocodeResult.error }, { status: 422 });
  }

  return NextResponse.json({
    lat: geocodeResult.lat,
    lng: geocodeResult.lng,
    formattedAddress: geocodeResult.formattedAddress,
  });
}
