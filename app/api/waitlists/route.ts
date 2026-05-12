// GET returns the authenticated user's waitlists via RPC; POST joins a provider's waitlist with duplicate-entry protection.

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const joinSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  category: z.string().min(1, 'Category is required'),
  service: z.string().optional(),
  urgency: z.enum(['now', 'today', 'this-week', 'flexible']).default('flexible'),
  contact_method: z.enum(['sms', 'email']),
  contact_value: z.string().min(1, 'Contact value is required'),
});

function expiresAtFromUrgency(urgency: string): string {
  const now = new Date();
  switch (urgency) {
    case 'now':       now.setHours(now.getHours() + 2); break;
    case 'today':     now.setHours(23, 59, 59, 0); break;
    case 'this-week': now.setDate(now.getDate() + 7); break;
    default:          now.setDate(now.getDate() + 30);
  }
  return now.toISOString();
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_user_waitlists', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('get_user_waitlists error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ waitlists: data });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = joinSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider_id, category, service, urgency, contact_method, contact_value } = result.data;

  // Prevent duplicate active waitlist entries for the same provider
  const { data: existing } = await supabase
    .from('waitlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('provider_id', provider_id)
    .in('status', ['waiting', 'notified'])
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'You are already on this provider\'s waitlist' },
      { status: 409 }
    );
  }

  const { data: waitlist, error: insertError } = await supabase
    .from('waitlists')
    .insert({
      user_id: user.id,
      provider_id,
      category,
      service: service ?? null,
      urgency,
      contact_method,
      contact_value,
      expires_at: expiresAtFromUrgency(urgency),
      status: 'waiting',
    })
    .select()
    .single();

  if (insertError) {
    console.error('waitlists insert error:', insertError);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }

  return NextResponse.json({ waitlist }, { status: 201 });
}
