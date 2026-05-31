import { NextRequest } from 'next/server';
import { POST as dispatchPOST, GET as dispatchGET } from '@/app/api/dispatch/route';
import { GET as availableGET } from '@/app/api/dispatch/available/route';
import { makeSupabase, mockCreateClient } from '../helpers/supabase';

function postReq(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const VALID_DISPATCH_BODY = {
  category: 'plumber',
  address: '123 Main St',
  latitude: 40.7128,
  longitude: -74.006,
  radius_meters: 10000,
  expires_in_minutes: 60,
};

describe('POST /api/dispatch', () => {
  it('returns 401 when unauthenticated', async () => {
    mockCreateClient(makeSupabase({ user: null }));

    const res = await dispatchPOST(postReq('/api/dispatch', VALID_DISPATCH_BODY));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 400 when expires_in_minutes is not an allowed value', async () => {
    // Validation runs before auth, but createClient is still called — use a no-op mock
    mockCreateClient(makeSupabase({ user: null }));

    const res = await dispatchPOST(
      postReq('/api/dispatch', { ...VALID_DISPATCH_BODY, expires_in_minutes: 45 })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/expires_in_minutes/);
  });
});

describe('GET /api/dispatch/available', () => {
  it('returns 401 when unauthenticated', async () => {
    // getBusinessAccount uses createClient → auth.getUser returns null user
    mockCreateClient(makeSupabase({ user: null }));

    const res = await availableGET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });
});
