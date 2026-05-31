import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/route';
import { makeSupabase, mockCreateClient } from '../helpers/supabase';

const PROVIDERS = [
  { id: 'prov-1', business_name: 'City Vets', dist_meters: 1200 },
  { id: 'prov-2', business_name: 'Downtown Clinic', dist_meters: 3400 },
];

function req(qs: string) {
  return new NextRequest(`http://localhost/api/search${qs}`);
}

beforeEach(() => {
  mockCreateClient(makeSupabase({ rpcResult: { data: PROVIDERS, error: null } }));
});

describe('GET /api/search', () => {
  it('returns 400 when lat is missing', async () => {
    const res = await GET(req('?lon=-74.0'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('lat and lon are required');
  });

  it('returns 400 when lon is missing', async () => {
    const res = await GET(req('?lat=40.7'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('lat and lon are required');
  });

  it('returns 400 when lat is non-numeric', async () => {
    const res = await GET(req('?lat=abc&lon=-74.0'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('lat and lon must be valid numbers');
  });

  it('returns 200 with providers array on valid params', async () => {
    const res = await GET(req('?lat=40.7128&lon=-74.0060&radius=5000&category=veterinarian'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.providers).toEqual(PROVIDERS);
  });

  it('defaults radius to 5000 when radius param is absent', async () => {
    const supabase = makeSupabase({ rpcResult: { data: PROVIDERS, error: null } });
    mockCreateClient(supabase);

    await GET(req('?lat=40.7128&lon=-74.0060'));

    expect(supabase.rpc).toHaveBeenCalledWith(
      'get_available_providers_nearby',
      expect.objectContaining({ search_radius_meters: 5000 })
    );
  });
});
