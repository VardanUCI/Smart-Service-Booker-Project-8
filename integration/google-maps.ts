// =============================================================================
// GOOGLE MAPS — NEARBY BUSINESS SEARCH — Smart Service Booker
// =============================================================================
//
// PURPOSE:
//   This module provides a server-side utility for finding nearby businesses
//   using the Google Places API (New). Given a user's latitude, longitude,
//   and a service category (from `lib/mock-data.ts`), it returns a list of
//   real businesses that match — complete with name, address, rating, phone
//   number, and current open/closed status.
//
//   This powers the seeker search flow: when a seeker selects a category
//   (e.g. "Pet Care") and shares their location, this function finds relevant
//   providers nearby. The results can populate the provider list on the
//   search page (app/seeker/search/) or seed the `mockProviders` array
//   in lib/mock-data.ts with real data.
//
//   CATEGORY → GOOGLE PLACES TYPE MAPPING:
//     'pet-care'         →  veterinary_care, pet_store
//     'medical'          →  doctor, dentist, hospital, physiotherapist
//     'food-dining'      →  restaurant, cafe, bakery
//     'home-services'    →  electrician, plumber, locksmith
//     'beauty-wellness'  →  beauty_salon, hair_care, spa
//     'professional'     →  lawyer, accounting, insurance_agency
//
// -----------------------------------------------------------------------------
// SETUP INSTRUCTIONS (do these once before using this module):
// -----------------------------------------------------------------------------
//
//   1. CREATE A GOOGLE CLOUD PROJECT
//      Go to https://console.cloud.google.com/ and create a new project
//      (or use an existing one).
//
//   2. ENABLE THE PLACES API (NEW)
//      In the Cloud Console, go to APIs & Services → Library.
//      Search for "Places API (New)" and click Enable.
//      Note: This is the NEW version of the Places API — it uses a simpler
//      REST interface and does NOT require the older `@googlemaps/google-maps-services-js` SDK.
//
//   3. CREATE AN API KEY
//      Go to APIs & Services → Credentials → Create Credentials → API key.
//      Restrict it to the Places API (New) for security.
//      For production, also add HTTP referrer or IP restrictions.
//
//   4. ADD ENVIRONMENT VARIABLE
//      Add this line to your `.env.local` file in the project root:
//
//        GOOGLE_MAPS_API_KEY=AIzaSy...your-key-here...
//
//      Next.js loads `.env.local` automatically on the server side.
//      This key is NEVER exposed to the browser — it stays server-only.
//
//   5. NO EXTRA PACKAGES NEEDED
//      This module uses the built-in `fetch` API to call Google's REST
//      endpoints directly. No npm install required.
//
//   6. BILLING
//      The Places API (New) requires a billing account on Google Cloud.
//      New accounts get $300 in free credits. The Nearby Search endpoint
//      costs $32 per 1,000 requests (as of 2024). For development and
//      testing, the free tier is more than enough.
//
// =============================================================================

import type { CategoryId } from '@/lib/mock-data';


// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
//
// We read the API key from the environment variable set in `.env.local`.
//
// WHY SERVER-SIDE ONLY:
//   This file must ONLY be imported in server-side code (API routes, server
//   actions, Server Components). Importing it on the client side would expose
//   your API key in the browser, which is a security risk — anyone could
//   steal it and rack up charges on your Google Cloud account.
//
// HOW IT CONNECTS TO THE APP:
//   1. Create an API route (e.g., app/api/search/nearby/route.ts)
//   2. Import `searchNearbyBusinesses` from this file
//   3. Call it with the seeker's location and selected category
//   4. Return the results to the search page
//   See the USAGE EXAMPLES section at the bottom of this file.
// -----------------------------------------------------------------------------

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.warn(
    '[Google Maps] Missing GOOGLE_MAPS_API_KEY environment variable.\n' +
    'Nearby business search is disabled.\n' +
    'To enable it, add GOOGLE_MAPS_API_KEY to your .env.local file.\n' +
    'See integration/google-maps.ts for full setup instructions.'
  );
}


// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
//
// These types describe the shape of data returned by `searchNearbyBusinesses`.
// They are modeled to align closely with the `Provider` interface in
// lib/mock-data.ts so results can be easily mapped to app domain objects.
// =============================================================================

/** A single business returned from the nearby search. */
export interface NearbyBusiness {
  /** Google's unique place ID — can be used for Place Details requests. */
  placeId: string;

  /** Business name (e.g. "Happy Paws Vet Clinic"). */
  name: string;

  /** Full street address (e.g. "123 Main St, Irvine, CA 92614"). */
  address: string;

  /** Latitude and longitude of the business. */
  location: {
    latitude: number;
    longitude: number;
  };

  /** Star rating from 1.0 to 5.0, or null if unrated. */
  rating: number | null;

  /** Number of user reviews, or 0 if unavailable. */
  reviewCount: number;

  /** Whether the business is currently open, or null if unknown. */
  isOpenNow: boolean | null;

  /**
   * Google Places types that apply to this business.
   * Example: ["veterinary_care", "point_of_interest", "establishment"]
   */
  types: string[];

  /**
   * A photo URI for the business, or null if no photos are available.
   * This is a Google Places photo resource name — use `getPhotoUrl()`
   * to convert it to a displayable image URL.
   */
  photoUri: string | null;
}

/** Successful search result. */
interface SearchSuccess {
  success: true;
  businesses: NearbyBusiness[];
}

/** Failed search result. */
interface SearchFailure {
  success: false;
  error: string;
  businesses: [];
}

/** Return type for `searchNearbyBusinesses`. */
export type SearchResult = SearchSuccess | SearchFailure;


// =============================================================================
// CATEGORY → GOOGLE PLACES TYPE MAPPING
// =============================================================================
//
// Google's Places API uses its own set of "place types" to classify businesses.
// This map converts our app's CategoryId (from lib/mock-data.ts) into the
// relevant Google Places types for the Nearby Search request.
//
// Full list of supported types:
//   https://developers.google.com/maps/documentation/places/web-service/place-types
//
// We include multiple types per category to cast a wide net — the API returns
// results matching ANY of the listed types (OR logic).
// =============================================================================

const CATEGORY_TO_PLACE_TYPES: Record<CategoryId, string[]> = {
  'pet-care': [
    'veterinary_care',
    'pet_store',
  ],
  'medical': [
    'doctor',
    'dentist',
    'hospital',
    'physiotherapist',
    'pharmacy',
  ],
  'food-dining': [
    'restaurant',
    'cafe',
    'bakery',
    'meal_delivery',
    'meal_takeaway',
  ],
  'home-services': [
    'electrician',
    'plumber',
    'locksmith',
    'roofing_contractor',
    'moving_company',
  ],
  'beauty-wellness': [
    'beauty_salon',
    'hair_care',
    'spa',
  ],
  'professional': [
    'lawyer',
    'accounting',
    'insurance_agency',
    'real_estate_agency',
  ],
};


// =============================================================================
// MAIN FUNCTION — searchNearbyBusinesses
// =============================================================================
//
// Calls the Google Places API (New) Nearby Search endpoint to find businesses
// near a given location that match a service category.
//
// PARAMETERS:
//   latitude   — The seeker's latitude  (e.g. 33.6846)
//   longitude  — The seeker's longitude (e.g. -117.8265)
//   category   — One of the CategoryId values from lib/mock-data.ts
//                 (e.g. 'pet-care', 'medical', 'food-dining', etc.)
//   radiusMeters — Search radius in meters (default: 5000 = ~3.1 miles).
//                  Max allowed by Google is 50000 (50 km).
//   maxResults   — Maximum number of businesses to return (default: 10, max: 20).
//
// RETURNS:
//   { success: true,  businesses: NearbyBusiness[] }  on success
//   { success: false, error: string, businesses: [] } on failure
//
// HOW IT WORKS:
//   Uses the Places API (New) "Nearby Search" endpoint:
//   POST https://places.googleapis.com/v1/places:searchNearby
//
//   This is the newer, cleaner REST API — it accepts a JSON body and returns
//   structured JSON. No URL-encoded query params or XML involved.
//
//   Request flow:
//     1. Map the app category to Google Places types
//     2. Build the request body with location, radius, and types
//     3. POST to the API with the API key in the header
//     4. Parse the response and map to NearbyBusiness objects
//     5. Return the results
// =============================================================================

export async function searchNearbyBusinesses(
  latitude: number,
  longitude: number,
  category: CategoryId,
  radiusMeters: number = 5000,
  maxResults: number = 10,
): Promise<SearchResult> {

  // ── Guard: API key must be configured ──────────────────────────────────
  if (!apiKey) {
    const errorMsg =
      '[Google Maps] API key not configured — missing GOOGLE_MAPS_API_KEY env variable.';
    console.error(errorMsg);
    return { success: false, error: errorMsg, businesses: [] };
  }

  // ── Guard: validate coordinates ────────────────────────────────────────
  if (
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    const errorMsg =
      `[Google Maps] Invalid coordinates: (${latitude}, ${longitude}). ` +
      'Latitude must be between -90 and 90, longitude between -180 and 180.';
    console.error(errorMsg);
    return { success: false, error: errorMsg, businesses: [] };
  }

  // ── Guard: validate category ───────────────────────────────────────────
  const placeTypes = CATEGORY_TO_PLACE_TYPES[category];
  if (!placeTypes) {
    const errorMsg =
      `[Google Maps] Unknown category: "${category}". ` +
      `Valid categories: ${Object.keys(CATEGORY_TO_PLACE_TYPES).join(', ')}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg, businesses: [] };
  }

  // ── Clamp parameters to valid ranges ───────────────────────────────────
  const clampedRadius = Math.min(Math.max(radiusMeters, 1), 50000);
  const clampedMaxResults = Math.min(Math.max(maxResults, 1), 20);

  // ── Build the request body ─────────────────────────────────────────────
  // API reference:
  // https://developers.google.com/maps/documentation/places/web-service/nearby-search
  const requestBody = {
    includedTypes: placeTypes,
    maxResultCount: clampedMaxResults,
    locationRestriction: {
      circle: {
        center: {
          latitude,
          longitude,
        },
        radius: clampedRadius,
      },
    },
  };

  // ── Define which fields we want back (controls billing cost) ───────────
  // Only request the fields we actually use. Each field group has a
  // different price tier — keeping this minimal saves money.
  //
  // Basic fields (no extra cost):
  //   places.id, places.displayName, places.types, places.formattedAddress,
  //   places.location
  //
  // Advanced fields (extra cost per request):
  //   places.rating, places.userRatingCount, places.currentOpeningHours,
  //   places.photos
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.types',
    'places.rating',
    'places.userRatingCount',
    'places.currentOpeningHours',
    'places.photos',
  ].join(',');

  // ── Make the API request ───────────────────────────────────────────────
  try {
    console.log(
      `[Google Maps] Searching for "${category}" businesses near ` +
      `(${latitude}, ${longitude}) within ${clampedRadius}m...`
    );

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(requestBody),
      }
    );

    // ── Handle HTTP errors ─────────────────────────────────────────────
    if (!response.ok) {
      const errorBody = await response.text();
      const errorMsg =
        `[Google Maps] API request failed with status ${response.status}: ${errorBody}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg, businesses: [] };
    }

    const data = await response.json();

    // ── Handle empty results ───────────────────────────────────────────
    // The API returns an empty object `{}` when there are no results,
    // rather than an empty `places` array.
    if (!data.places || data.places.length === 0) {
      console.log(
        `[Google Maps] No businesses found for "${category}" near ` +
        `(${latitude}, ${longitude}).`
      );
      return { success: true, businesses: [] };
    }

    // ── Map API response to our NearbyBusiness type ────────────────────
    const businesses: NearbyBusiness[] = data.places.map(
      (place: GooglePlaceResult) => ({
        placeId: place.id,
        name: place.displayName?.text ?? 'Unknown Business',
        address: place.formattedAddress ?? 'Address unavailable',
        location: {
          latitude: place.location?.latitude ?? latitude,
          longitude: place.location?.longitude ?? longitude,
        },
        rating: place.rating ?? null,
        reviewCount: place.userRatingCount ?? 0,
        isOpenNow: place.currentOpeningHours?.openNow ?? null,
        types: place.types ?? [],
        photoUri: place.photos?.[0]?.name ?? null,
      })
    );

    console.log(
      `[Google Maps] Found ${businesses.length} businesses for "${category}".`
    );

    return { success: true, businesses };

  } catch (error) {
    // Network errors, JSON parse failures, etc.
    const message = error instanceof Error ? error.message : String(error);
    const errorMsg = `[Google Maps] Unexpected error during nearby search: ${message}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg, businesses: [] };
  }
}


// =============================================================================
// HELPER — getPhotoUrl
// =============================================================================
//
// Converts a Google Places photo resource name into a displayable image URL.
//
// The Nearby Search response returns photo names like:
//   "places/ChIJ.../photos/AUacSh..."
//
// To display the actual image, you need to construct a URL using the
// Places Photos API:
//   GET https://places.googleapis.com/v1/{photoName}/media
//
// PARAMETERS:
//   photoResourceName — The `name` field from a Places photo object
//   maxWidthPx        — Max image width in pixels (default: 400)
//   maxHeightPx       — Max image height in pixels (default: 400)
//
// RETURNS:
//   A URL string you can use in an <img> tag's `src` attribute, or null
//   if the API key is not configured.
// =============================================================================

export function getPhotoUrl(
  photoResourceName: string,
  maxWidthPx: number = 400,
  maxHeightPx: number = 400,
): string | null {
  if (!apiKey) {
    console.error('[Google Maps] Cannot generate photo URL — API key not configured.');
    return null;
  }

  return (
    `https://places.googleapis.com/v1/${photoResourceName}/media` +
    `?maxWidthPx=${maxWidthPx}` +
    `&maxHeightPx=${maxHeightPx}` +
    `&key=${apiKey}`
  );
}


// =============================================================================
// HELPER — toProvider
// =============================================================================
//
// Convenience function that converts a `NearbyBusiness` into a `Provider`
// object matching the interface in lib/mock-data.ts. This makes it easy to
// drop real Google Places results directly into the existing UI components
// that expect `Provider` objects.
//
// Fields that Google doesn't provide (like `phone`, `hours`, `description`)
// are filled with sensible defaults. For full details on a place, you'd need
// a separate Place Details API call using the `placeId`.
//
// PARAMETERS:
//   business — A NearbyBusiness object from the search results
//   category — The CategoryId used in the search
//
// RETURNS:
//   A Provider-compatible object ready for use in UI components.
// =============================================================================

export function toProvider(
  business: NearbyBusiness,
  category: CategoryId,
): {
  id: string;
  name: string;
  category: CategoryId;
  services: string[];
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  status: 'available-now' | 'waitlist-open' | 'next-slot-tomorrow' | 'fully-booked';
  isMobile: boolean;
  tags: string[];
  phone: string;
  hours: string;
  description: string;
  image?: string;
} {
  // Determine status based on whether we know if the business is open
  let status: 'available-now' | 'waitlist-open' | 'next-slot-tomorrow' | 'fully-booked';
  if (business.isOpenNow === true) {
    status = 'available-now';
  } else if (business.isOpenNow === false) {
    status = 'next-slot-tomorrow';
  } else {
    status = 'waitlist-open'; // Unknown — default to waitlist
  }

  // Build a photo URL if available
  const image = business.photoUri
    ? getPhotoUrl(business.photoUri, 600, 400) ?? undefined
    : undefined;

  return {
    id: business.placeId,
    name: business.name,
    category,
    services: [],                       // Would need Place Details to populate
    address: business.address,
    distance: '',                       // Compute from coordinates if needed
    rating: business.rating ?? 0,
    reviewCount: business.reviewCount,
    nextAvailable: business.isOpenNow ? 'Now' : 'Tomorrow',
    status,
    isMobile: false,
    tags: business.types.slice(0, 3),   // Use first 3 Google types as tags
    phone: '',                          // Would need Place Details to populate
    hours: business.isOpenNow !== null
      ? (business.isOpenNow ? 'Open now' : 'Currently closed')
      : 'Hours unavailable',
    description: `${business.name} — ${business.address}`,
    image,
  };
}


// =============================================================================
// INTERNAL TYPE — Google Places API Response Shape
// =============================================================================
//
// This is a simplified type representing the relevant fields from a single
// place in the Google Places API (New) Nearby Search response. We only type
// the fields we actually read to keep things simple.
//
// Full response reference:
//   https://developers.google.com/maps/documentation/places/web-service/nearby-search#response
// =============================================================================

interface GooglePlaceResult {
  id: string;
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow?: boolean;
  };
  photos?: Array<{
    name: string;
    widthPx?: number;
    heightPx?: number;
  }>;
}


// =============================================================================
// USAGE EXAMPLES
// =============================================================================
//
// Below are concrete examples showing how to import and call this function
// from Next.js server-side code. These are NOT executed — they're reference
// code for when you wire up real search functionality.
//
// ─── Example 1: API Route for searching nearby businesses ────────────────────
//
//   // File: app/api/search/nearby/route.ts
//
//   import { searchNearbyBusinesses } from '@/integration/google-maps';
//   import type { CategoryId } from '@/lib/mock-data';
//
//   export async function POST(request: Request) {
//     const { latitude, longitude, category } = await request.json();
//
//     const result = await searchNearbyBusinesses(
//       latitude,                   // e.g. 33.6846
//       longitude,                  // e.g. -117.8265
//       category as CategoryId,     // e.g. 'pet-care'
//     );
//
//     if (result.success) {
//       return Response.json({
//         found: result.businesses.length,
//         businesses: result.businesses,
//       });
//     } else {
//       return Response.json(
//         { error: result.error },
//         { status: 500 },
//       );
//     }
//   }
//
//
// ─── Example 2: Server Action with Provider mapping ──────────────────────────
//
//   // Inside a Server Component or server action file:
//
//   'use server';
//   import { searchNearbyBusinesses, toProvider } from '@/integration/google-maps';
//   import type { CategoryId } from '@/lib/mock-data';
//
//   export async function findProviders(
//     lat: number,
//     lng: number,
//     category: CategoryId,
//   ) {
//     const result = await searchNearbyBusinesses(lat, lng, category);
//
//     if (!result.success) {
//       throw new Error(result.error);
//     }
//
//     // Convert to Provider objects for the existing UI components
//     return result.businesses.map((biz) => toProvider(biz, category));
//   }
//
//
// ─── Example 3: Connecting to the seeker search page ─────────────────────────
//
//   The seeker search page (app/seeker/search/) currently uses mock data
//   to display providers. To make it use real Google Maps data:
//
//   1. Create the API route from Example 1 above.
//
//   2. On the search page, after the user selects a category and shares
//      their location (via the browser's Geolocation API), call:
//        fetch('/api/search/nearby', {
//          method: 'POST',
//          body: JSON.stringify({ latitude, longitude, category }),
//        })
//
//   3. Use the returned businesses to populate the provider list,
//      replacing `mockProviders` with real data.
//
//   4. For each provider card, use `getPhotoUrl()` to display the
//      business photo, and link the "View Details" button to a
//      Place Details page using the `placeId`.
//
// =============================================================================
