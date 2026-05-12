import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const waitlistSchema = z
  .object({
    provider_id: z.string().uuid('provider_id must be a valid UUID'),
    category: z.string().min(1, 'Category is required'),
    service: z.string().optional(),
    urgency: z.enum(['now', 'today', 'this-week', 'flexible']).default('flexible'),
    contact_method: z.enum(['sms', 'email'], { required_error: 'contact_method is required' }),
    contact_value: z.string().min(1, 'contact_value is required'),
    expires_at: z.string().datetime('expires_at must be a valid ISO timestamp'),
  })
  .superRefine((data, ctx) => {
    if (data.contact_method === 'sms' && !/^\+?[1-9]\d{7,14}$/.test(data.contact_value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'contact_value must be a valid phone number when contact_method is sms',
        path: ['contact_value'],
      });
    }
    if (data.contact_method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'contact_value must be a valid email address when contact_method is email',
        path: ['contact_value'],
      });
    }
  });

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: waitlists, error: rpcError } = await supabase.rpc('get_user_waitlists', {
    p_user_id: user.id,
  });

  if (rpcError) {
    console.error('get_user_waitlists RPC error:', rpcError);
    return NextResponse.json({ error: 'Failed to fetch waitlists' }, { status: 500 });
  }

  return NextResponse.json({ waitlists }, { status: 200 });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = waitlistSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { provider_id, category, service, urgency, contact_method, contact_value, expires_at } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: provider, error: providerLookupError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', provider_id)
    .maybeSingle();

  if (providerLookupError) {
    console.error('providers lookup error:', providerLookupError);
    return NextResponse.json({ error: 'Failed to verify provider' }, { status: 500 });
  }

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { data: existing, error: waitlistLookupError } = await supabase
    .from('waitlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('provider_id', provider_id)
    .in('status', ['waiting', 'notified'])
    .maybeSingle();

  if (waitlistLookupError) {
    console.error('waitlists lookup error:', waitlistLookupError);
    return NextResponse.json({ error: 'Failed to check existing waitlist entry' }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: 'Already on this waitlist' }, { status: 409 });
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
      expires_at,
      status: 'waiting',
      search_location: null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('waitlists insert error:', insertError);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }

  return NextResponse.json({ waitlist }, { status: 201 });
}
