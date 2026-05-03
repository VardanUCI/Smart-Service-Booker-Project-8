// GET returns aggregated dashboard stats (open slots, pending requests, fill rate, etc.) for the authenticated provider via RPC.

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_provider_dashboard_stats', {
    p_provider_id: user.id,
  });

  if (error) {
    console.error('get_provider_dashboard_stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stats: data });
}
