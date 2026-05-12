import type { User } from '@supabase/supabase-js';

export type AccountRole = 'user' | 'business';

const BUSINESS_ROLE_VALUES = new Set(['business', 'provider']);

export function normalizeAccountRole(value: unknown): AccountRole {
  if (typeof value === 'string' && BUSINESS_ROLE_VALUES.has(value.toLowerCase())) {
    return 'business';
  }

  return 'user';
}

export function getRoleFromUserMetadata(user: User | null | undefined): AccountRole {
  return normalizeAccountRole(
    user?.user_metadata?.role ?? user?.user_metadata?.account_type ?? user?.app_metadata?.role
  );
}

export function isBusinessRole(role: AccountRole | null | undefined) {
  return role === 'business';
}

export function isEmailVerified(user: User | null | undefined) {
  return Boolean(user?.email_confirmed_at ?? user?.confirmed_at);
}
