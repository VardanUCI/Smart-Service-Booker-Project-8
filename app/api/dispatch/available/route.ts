// GET returns open dispatch requests near the authenticated provider, via RPC.

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getBusinessAccount } from '@/lib/auth/server';

export async function GET() {
  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { data, error } = await supabase.rpc('get_open_dispatch_requests_for_provider', {
    p_provider_id: account.user.id,
  });

  if (error) {
    console.error('get_open_dispatch_requests_for_provider error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ dispatch_requests: data ?? [] });
}
