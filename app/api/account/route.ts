import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAccount, ensureUserProfile } from '@/lib/auth/server';
import { getDevAccountFromRequest } from '@/lib/auth/dev-auth';
import { createClient } from '@/utils/supabase/server';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Display name is required').max(80, 'Display name is too long'),
  avatarUrl: z.string().url().nullable().optional(),
});

function getNameFromMetadata(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export async function GET(request: NextRequest) {
  const devAccount = getDevAccountFromRequest(request);

  if (devAccount) {
    return NextResponse.json({
      user: {
        id: devAccount.id,
        email: devAccount.email,
        name: devAccount.role === 'business' ? 'Demo Business' : 'Demo User',
        avatarUrl: null,
        role: devAccount.role,
        onboardingCompleted: devAccount.onboardingCompleted,
      },
    });
  }

  const supabase = await createClient();
  const account = await getCurrentAccount(supabase);

  if (!account) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let profile = account.profile;
  if (!profile) {
    const { data, error } = await ensureUserProfile(supabase, account.user, account.role);
    if (error) {
      console.error('account profile ensure error:', error);
      return NextResponse.json({ error: 'Failed to load account profile' }, { status: 500 });
    }
    profile = data;
  }

  const fallbackName = account.user.email?.split('@')[0] ?? 'Account';
  const metadataAvatar = account.user.user_metadata?.avatar_url;

  return NextResponse.json({
    user: {
      id: account.user.id,
      email: account.user.email ?? profile.email,
      name: profile.name ?? getNameFromMetadata(account.user.user_metadata?.name, fallbackName),
      avatarUrl: profile.avatar_url ?? (typeof metadataAvatar === 'string' ? metadataAvatar : null),
      role: account.role,
      onboardingCompleted: account.onboardingCompleted,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const devAccount = getDevAccountFromRequest(request);

  if (devAccount) {
    return NextResponse.json({
      user: {
        id: devAccount.id,
        email: devAccount.email,
        name: devAccount.role === 'business' ? 'Demo Business' : 'Demo User',
        avatarUrl: null,
        role: devAccount.role,
        onboardingCompleted: devAccount.onboardingCompleted,
      },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const supabase = await createClient();
  const account = await getCurrentAccount(supabase);

  if (!account) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, avatarUrl } = result.data;
  const updatePayload = avatarUrl === undefined ? { name } : { name, avatar_url: avatarUrl };

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .update(updatePayload)
    .eq('id', account.user.id)
    .select('id, email, name, phone, role, onboarding_completed')
    .single();

  if (profileError) {
    console.error('account profile update error:', profileError);
    return NextResponse.json({ error: 'Failed to update account profile' }, { status: 500 });
  }

  const metadata = {
    ...account.user.user_metadata,
    name,
    ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
  };
  const { error: authError } = await supabase.auth.updateUser({ data: metadata });

  if (authError) {
    console.error('account metadata update error:', authError);
    return NextResponse.json({ error: 'Profile saved, but auth metadata could not be updated' }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: account.user.id,
      email: account.user.email ?? profile.email,
      name: profile.name,
      avatarUrl:
        avatarUrl ??
        (typeof account.user.user_metadata?.avatar_url === 'string'
          ? account.user.user_metadata.avatar_url
          : null),
      role: profile.role,
      onboardingCompleted: profile.onboarding_completed,
    },
  });
}
