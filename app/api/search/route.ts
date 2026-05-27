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

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const radiusNum = parseFloat(radius);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json(
      { error: 'lat and lon must be valid numbers' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_available_providers_nearby', {
    user_lat: latNum,
    user_lon: lonNum,
    search_radius_meters: isNaN(radiusNum) ? 5000 : radiusNum,
    search_category: category,
  });

  if (error) {
    console.error('Supabase RPC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // TODO: once Google Maps API is integrated, merge results here:
  // 1. Call Maps API with the same lat/lon/category
  // 2. Filter out Maps results where place_id already exists in `data`
  // 3. Return [...data, ...filteredMapsResults]

  return NextResponse.json({ providers: data });
}
