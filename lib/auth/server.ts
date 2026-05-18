import type { User } from '@supabase/supabase-js';
import type { createClient } from '@/utils/supabase/server';
import {
  type AccountRole,
  getRoleFromUserMetadata,
  isBusinessRole,
  isEmailVerified,
  normalizeAccountRole,
} from './roles';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url?: string | null;
  role: AccountRole;
  onboarding_completed: boolean;
};

export type CurrentAccount = {
  user: User;
  profile: UserProfile | null;
  role: AccountRole;
  emailVerified: boolean;
  onboardingCompleted: boolean;
};

export async function ensureUserProfile(
  supabase: SupabaseServerClient,
  user: User,
  preferredRole?: AccountRole
) {
  const { data: existingProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const metadataRole = getRoleFromUserMetadata(user);
  const existingRole = normalizeAccountRole(existingProfile?.role);
  const requestedRole = normalizeAccountRole(preferredRole ?? metadataRole);
  const role: AccountRole = existingRole === 'business' || requestedRole === 'business' ? 'business' : 'user';
  const name =
    typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()
      ? user.user_metadata.name
      : user.email?.split('@')[0] ?? 'Account';
  const phone =
    typeof user.user_metadata?.phone === 'string' && user.user_metadata.phone.trim()
      ? user.user_metadata.phone
      : null;

  return supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email ?? '',
        name,
        phone,
        role,
      },
      { onConflict: 'id' }
    )
    .select('id, email, name, phone, role, onboarding_completed')
    .single();
}

export async function getCurrentAccount(
  supabase: SupabaseServerClient
): Promise<CurrentAccount | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const metadataRole = getRoleFromUserMetadata(user);
  const emailVerified = isEmailVerified(user);

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, name, phone, role, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('users role fetch error:', profileError);
  }

  let role: AccountRole =
    normalizeAccountRole(profile?.role) === 'business' || metadataRole === 'business' ? 'business' : 'user';
  let onboardingCompleted = Boolean(profile?.onboarding_completed);
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (provider) {
    role = 'business';
    onboardingCompleted = true;
  }

  return {
    user,
    profile: profile
      ? {
          ...profile,
          avatar_url: null,
          role,
          onboarding_completed: onboardingCompleted,
        }
      : null,
    role,
    emailVerified,
    onboardingCompleted,
  };
}

export async function getBusinessAccount(supabase: SupabaseServerClient) {
  const account = await getCurrentAccount(supabase);

  if (!account) {
    return { account: null, error: 'Unauthorized', status: 401 as const };
  }

  if (!account.emailVerified) {
    return {
      account,
      error: 'Please verify your email before continuing.',
      status: 403 as const,
    };
  }

  if (!isBusinessRole(account.role)) {
    return {
      account,
      error: 'This dashboard is only available for business accounts.',
      status: 403 as const,
    };
  }

  return { account, error: null, status: 200 as const };
}
