import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyBusinesses } from '@/integration/google-maps';
import type { CategoryId } from '@/lib/constants';

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

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

  const dbProviders = data ?? [];
  let mergedProviders = [...dbProviders];

  if (category) {
    try {
      // 1. Get existing google_place_ids for providers returned by DB
      let existingGooglePlaceIds: Set<string> = new Set();
      if (dbProviders.length > 0) {
        const dbProviderIds = dbProviders.map((p) => p.id);
        const { data: dbDetails } = await supabase
          .from('providers')
          .select('google_place_id')
          .in('id', dbProviderIds);
        
        if (dbDetails) {
          existingGooglePlaceIds = new Set(
            dbDetails
              .map((d) => d.google_place_id)
              .filter((id): id is string => Boolean(id))
          );
        }
      }

      // 2. Call Maps API with the same lat/lon/category
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      const parsedRadius = parseFloat(radius);
      
      const mapsResult = await searchNearbyBusinesses(
        parsedLat,
        parsedLon,
        category as CategoryId,
        parsedRadius
      );

      if (mapsResult.success) {
        // 3. Filter out Maps results where place_id already exists in `data`
        const filteredMapsResults = mapsResult.businesses
          .filter((biz) => !existingGooglePlaceIds.has(biz.placeId))
          .map((biz) => ({
            id: biz.placeId,
            business_name: biz.name,
            dist_meters: calculateDistanceInMeters(
              parsedLat,
              parsedLon,
              biz.location.latitude,
              biz.location.longitude
            ),
          }));

        mergedProviders = [...mergedProviders, ...filteredMapsResults];
      } else {
        console.warn('Google Maps search warning:', mapsResult.error);
      }
    } catch (mapsErr) {
      console.error('Error fetching/merging Google Maps results:', mapsErr);
    }
  }

  return NextResponse.json({ providers: mergedProviders });
}
