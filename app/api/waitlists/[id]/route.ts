// DELETE removes the authenticated user from a specific waitlist entry (leave waitlist).

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('waitlists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('waitlists delete error:', error);
    return NextResponse.json({ error: 'Failed to leave waitlist' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
