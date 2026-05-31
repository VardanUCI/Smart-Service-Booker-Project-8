// POST lets an authenticated provider claim an open dispatch request via RPC.
// All existence, expiry, and race-condition logic is handled inside the RPC.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBusinessAccount } from '@/lib/auth/server';

const uuidSchema = z.string().uuid('Invalid dispatch request ID');

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: idResult.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { data: rpcResult, error: rpcError } = await supabase
    .rpc('claim_dispatch_request', {
      p_dispatch_id: id,
      p_provider_id: account.user.id,
    });

  if (rpcError) {
    console.error('dispatch claim error:', rpcError);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const { status: claimStatus, data: claimedRequest } = rpcResult as {
    status: number;
    data: unknown;
  };

  if (claimStatus === 404) {
    return NextResponse.json({ error: 'Dispatch request not found' }, { status: 404 });
  }
  if (claimStatus === 410) {
    return NextResponse.json({ error: 'This request has expired' }, { status: 410 });
  }
  if (claimStatus === 409) {
    return NextResponse.json({ error: 'This request has already been claimed' }, { status: 409 });
  }

  return NextResponse.json({ dispatch_request: claimedRequest }, { status: 200 });
}
