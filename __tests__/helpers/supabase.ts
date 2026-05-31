import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

// Builds a chainable query builder where every method returns itself until
// the terminal call (.single / .maybeSingle) which resolves to `result`.
export function makeQueryChain(result: { data?: unknown; error?: unknown } = { data: null, error: null }) {
  const chain: Record<string, jest.Mock> = {};
  const self = () => chain;

  for (const m of [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'in', 'gt', 'gte', 'lt', 'lte',
    'order', 'limit', 'filter',
  ]) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }

  chain['single'] = jest.fn().mockResolvedValue(result);
  chain['maybeSingle'] = jest.fn().mockResolvedValue(result);

  void self; // suppress unused warning
  return chain;
}

// Builds a mock Supabase client. Pass a User object to simulate authentication,
// or leave it null to simulate an unauthenticated request.
export function makeSupabase(options: {
  user?: Partial<User> | null;
  rpcResult?: { data?: unknown; error?: unknown };
  fromResult?: { data?: unknown; error?: unknown };
} = {}) {
  const { user = null, rpcResult = { data: [], error: null }, fromResult } = options;

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue(makeQueryChain(fromResult)),
    rpc: jest.fn().mockResolvedValue(rpcResult),
  };
}

// Convenience: wire up createClient to return the given mock.
export function mockCreateClient(supabase: ReturnType<typeof makeSupabase>) {
  (createClient as jest.MockedFunction<typeof createClient>).mockResolvedValue(supabase as never);
}
