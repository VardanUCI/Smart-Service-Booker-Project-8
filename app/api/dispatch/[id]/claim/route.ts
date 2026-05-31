// POST lets an authenticated provider atomically claim an open dispatch request.

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

  const { data: dispatch, error: fetchError } = await supabase
    .from('dispatch_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('dispatch_requests fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch dispatch request' }, { status: 500 });
  }

  if (!dispatch) {
    return NextResponse.json({ error: 'Dispatch request not found' }, { status: 404 });
  }

  if (dispatch.status === 'claimed') {
    return NextResponse.json({ error: 'Dispatch request is no longer open' }, { status: 409 });
  }

  if (dispatch.status === 'expired' || new Date(dispatch.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Dispatch request has expired' }, { status: 410 });
  }

  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('dispatch_requests')
    .update({ status: 'claimed', claimed_by: account.user.id, claimed_at: now })
    .eq('id', id)
    .eq('status', 'open')
    .gt('expires_at', now)
    .select();

  if (updateError) {
    console.error('dispatch_requests update error:', updateError);
    return NextResponse.json({ error: 'Failed to claim dispatch request' }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    // Distinguish expired vs claimed so the caller gets the right status code
    const { data: current } = await supabase
      .from('dispatch_requests')
      .select('status, expires_at')
      .eq('id', id)
      .single();
    if (!current || new Date(current.expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Dispatch request has expired' }, { status: 410 });
    }
    return NextResponse.json({ error: 'Request was just claimed by another provider' }, { status: 409 });
  }

  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: dispatch.customer_id,
    type: 'confirmation',
    title: 'Provider on the way',
    message: `A provider has accepted your ${dispatch.category} request and is on the way.`,
    action_url: `/dispatch/${id}`,
  });

  if (notifError) {
    console.error('notification insert error:', notifError);
  }

  return NextResponse.json({ dispatch_request: updated[0] });
}
