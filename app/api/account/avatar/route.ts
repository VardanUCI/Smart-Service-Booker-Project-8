import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAccount } from '@/lib/auth/server';
import { getDevAccountFromRequest } from '@/lib/auth/dev-auth';
import { createClient } from '@/utils/supabase/server';

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

export async function POST(request: NextRequest) {
  if (getDevAccountFromRequest(request)) {
    return NextResponse.json({ error: 'Avatar uploads are disabled for demo accounts' }, { status: 400 });
  }

  const supabase = await createClient();
  const account = await getCurrentAccount(supabase);

  if (!account) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const avatar = formData.get('avatar');

  if (!(avatar instanceof File)) {
    return NextResponse.json({ error: 'Avatar file is required' }, { status: 400 });
  }

  const extension = allowedTypes.get(avatar.type);
  if (!extension) {
    return NextResponse.json({ error: 'Use a JPG, PNG, WebP, or GIF image' }, { status: 400 });
  }

  if (avatar.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Avatar must be 5MB or smaller' }, { status: 400 });
  }

  const path = `${account.user.id}/${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, avatar, {
      cacheControl: '3600',
      contentType: avatar.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('avatar upload error:', uploadError);
    return NextResponse.json(
      { error: 'Avatar upload failed. Make sure the avatars storage migration has been applied.' },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = publicUrlData.publicUrl;

  const { error: profileError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', account.user.id);

  if (profileError) {
    console.error('avatar profile update error:', profileError);
    return NextResponse.json({ error: 'Avatar uploaded, but profile could not be updated' }, { status: 500 });
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      ...account.user.user_metadata,
      avatar_url: avatarUrl,
    },
  });

  if (metadataError) {
    console.error('avatar metadata update error:', metadataError);
    return NextResponse.json({ error: 'Avatar uploaded, but auth metadata could not be updated' }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl });
}
