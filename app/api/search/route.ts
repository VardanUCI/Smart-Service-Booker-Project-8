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
  let existingGooglePlaceIds: Set<string> = new Set();
  let dbDetailsMap: Record<string, { rating: number | null; review_count: number }> = {};

  if (dbProviders.length > 0) {
    const dbProviderIds = dbProviders.map((p) => p.id);
    const { data: dbDetails } = await supabase
      .from('providers')
      .select('id, google_place_id, rating, review_count')
      .in('id', dbProviderIds);
    
    if (dbDetails) {
      existingGooglePlaceIds = new Set(
        dbDetails
          .map((d) => d.google_place_id)
          .filter((id): id is string => Boolean(id))
      );
      dbDetailsMap = dbDetails.reduce((acc, curr) => {
        acc[curr.id] = {
          rating: curr.rating ?? null,
          review_count: curr.review_count ?? 0,
        };
        return acc;
      }, {} as Record<string, { rating: number | null; review_count: number }>);
    }
  }

  // Map dbProviders to include rating and review_count
  const mappedDbProviders = dbProviders.map((p) => ({
    id: p.id,
    business_name: p.business_name,
    dist_meters: p.dist_meters,
    rating: dbDetailsMap[p.id]?.rating ?? null,
    review_count: dbDetailsMap[p.id]?.review_count ?? 0,
  }));

  let mergedProviders = [...mappedDbProviders];

  if (category) {
    try {
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
            rating: biz.rating,
            review_count: biz.reviewCount,
            address: biz.address ?? null,
            phone: null, // nearby search doesn't return phone
            latitude: biz.location.latitude,
            longitude: biz.location.longitude,
          }));

        mergedProviders = [...mergedProviders, ...filteredMapsResults];
      } else {
        console.warn('Google Maps search warning:', mapsResult.error);
      }
    } catch (mapsErr) {
      console.error('Error fetching/merging Google Maps results:', mapsErr);
    }
  }

  // Get active waitlist counts for all providers with valid UUIDs
  const allProviderIds = mergedProviders.map((p) => p.id);
  const uuidProviderIds = allProviderIds.filter((id) => 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );

  let waitlistCountsMap: Record<string, number> = {};
  if (uuidProviderIds.length > 0) {
    const { data: countsData } = await supabase
      .from('waitlists')
      .select('provider_id')
      .in('provider_id', uuidProviderIds)
      .eq('status', 'waiting')
      .gt('expires_at', new Date().toISOString());

    if (countsData) {
      waitlistCountsMap = countsData.reduce((acc, curr) => {
        if (curr.provider_id) {
          acc[curr.provider_id] = (acc[curr.provider_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    }
  }

  const finalProviders = mergedProviders.map((p) => ({
    ...p,
    waitlist_count: waitlistCountsMap[p.id] || 0,
  }));

  return NextResponse.json({ providers: finalProviders });
}
