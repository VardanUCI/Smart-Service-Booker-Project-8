import { NextRequest } from 'next/server';
import { POST as signupPOST } from '@/app/api/auth/signup/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { makeSupabase, mockCreateClient } from '../helpers/supabase';

function postReq(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  mockCreateClient(makeSupabase());
});

describe('POST /api/auth/signup', () => {
  it('returns 400 when name is missing', async () => {
    const res = await signupPOST(
      postReq('/api/auth/signup', { email: 'test@example.com', password: 'password123', role: 'user' })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Name is required');
  });

  it('returns 400 when password is too short', async () => {
    const res = await signupPOST(
      postReq('/api/auth/signup', { email: 'test@example.com', password: 'short', name: 'Alice' })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Password must be at least 8 characters');
  });

  it('returns 400 when email is invalid', async () => {
    const res = await signupPOST(
      postReq('/api/auth/signup', { email: 'notanemail', password: 'password123', name: 'Alice' })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid email address');
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when password is missing', async () => {
    const res = await loginPOST(
      postReq('/api/auth/login', { email: 'test@example.com' })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Password is required');
  });
});
