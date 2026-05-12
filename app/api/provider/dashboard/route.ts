import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing, error: lookupError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (lookupError) {
    console.error('providers lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to check provider profile' }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
  }

  const { data: stats, error: rpcError } = await supabase.rpc('get_provider_dashboard_stats', {
    p_provider_id: user.id,
  });

  if (rpcError) {
    console.error('get_provider_dashboard_stats RPC error:', rpcError);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }

  return NextResponse.json({ stats }, { status: 200 });
}
