// GET returns aggregated dashboard stats (open slots, pending requests, fill rate, etc.) for the authenticated provider via RPC.

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getBusinessAccount } from '@/lib/auth/server';

export async function GET() {
  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { data, error } = await supabase.rpc('get_provider_dashboard_stats', {
    p_provider_id: account.user.id,
  });

  if (error) {
    console.error('get_provider_dashboard_stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stats: data });
}
