import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/waitlist/route';
import { DELETE } from '@/app/api/waitlist/[id]/route';
import { makeSupabase, mockCreateClient } from '../helpers/supabase';

function getReq(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

function postReq(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function deleteReq(path: string) {
  return new NextRequest(`http://localhost${path}`, { method: 'DELETE' });
}

describe('GET /api/waitlist', () => {
  it('returns 401 when unauthenticated', async () => {
    // user: null → getUser returns { data: { user: null }, error: null }
    mockCreateClient(makeSupabase({ user: null }));

    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });
});

describe('POST /api/waitlist', () => {
  it('returns 401 when unauthenticated', async () => {
    mockCreateClient(makeSupabase({ user: null }));

    const res = await POST(
      postReq('/api/waitlist', {
        provider_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        category: 'veterinarian',
        contact_method: 'email',
        contact_value: 'test@example.com',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      })
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });
});

describe('DELETE /api/waitlist/[id]', () => {
  it('returns 400 when id is not a valid UUID', async () => {
    mockCreateClient(makeSupabase({ user: { id: 'user-1' } }));

    const res = await DELETE(deleteReq('/api/waitlist/not-a-uuid'), {
      params: Promise.resolve({ id: 'not-a-uuid' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid waitlist entry ID');
  });
});
