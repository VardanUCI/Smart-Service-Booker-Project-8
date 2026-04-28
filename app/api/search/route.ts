import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius') ?? '5000'; // default 5km
  const category = searchParams.get('category') ?? '';

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon are required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_available_providers_nearby', {
    user_lat: parseFloat(lat),
    user_lon: parseFloat(lon),
    search_radius_meters: parseFloat(radius),
    search_category: category,
  });

  if (error) {
    console.error('Supabase RPC error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: once Google Maps API is integrated, merge results here:
  // 1. Call Maps API with the same lat/lon/category
  // 2. Filter out Maps results where place_id already exists in `data`
  // 3. Return [...data, ...filteredMapsResults]

  return NextResponse.json({ providers: data });
}
