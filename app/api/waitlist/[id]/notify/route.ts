import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessAccount } from '@/lib/auth/server';
import { sendYoureNextEmail } from '@/lib/email';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { account, error: authError, status } = await getBusinessAccount(supabase);
  if (!account || authError) {
    return NextResponse.json({ error: authError }, { status });
  }

  const { data: entry, error: lookupError } = await supabase
    .from('waitlists')
    .select('id, provider_id, status, contact_method, contact_value, category, service')
    .eq('id', id)
    .maybeSingle();

  if (lookupError) {
    console.error('waitlists lookup error:', lookupError);
    return NextResponse.json({ error: 'Failed to fetch waitlist entry' }, { status: 500 });
  }
  if (!entry) {
    return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
  }
  if (entry.provider_id !== account.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (entry.status !== 'waiting') {
    return NextResponse.json(
      { error: `Cannot notify — entry is already in status ${entry.status}` },
      { status: 409 }
    );
  }

  const { error: updateError } = await supabase
    .from('waitlists')
    .update({ status: 'notified' })
    .eq('id', id);

  if (updateError) {
    console.error('waitlists update error:', updateError);
    return NextResponse.json({ error: 'Failed to update waitlist entry' }, { status: 500 });
  }

  if (entry.contact_method === 'email' && entry.contact_value) {
    const { data: provider } = await supabase
      .from('providers')
      .select('business_name')
      .eq('id', account.user.id)
      .maybeSingle();
    const businessName = provider?.business_name ?? 'Your service provider';
    try {
      await sendYoureNextEmail(
        entry.contact_value,
        businessName,
        entry.service ?? entry.category,
      );
    } catch (err) {
      console.error('notify email error:', err);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
