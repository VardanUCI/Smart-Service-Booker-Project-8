import type { NextRequest } from 'next/server';

export const DEV_AUTH_COOKIE = 'ssb-dev-auth';
export const DEV_EMAIL_COOKIE = 'ssb-dev-email';
export const DEV_ROLE_COOKIE = 'ssb-dev-role';
export const DEV_ONBOARDING_COOKIE = 'ssb-dev-onboarding';

export const demoAccounts = [
  {
    email: 'user@demo.local',
    password: 'DemoUser123!',
    role: 'user' as const,
    onboardingCompleted: true,
  },
  {
    email: 'business@demo.local',
    password: 'DemoBusiness123!',
    role: 'business' as const,
    onboardingCompleted: false,
  },
];

export function isDevAuthEnabled() {
  return process.env.NODE_ENV !== 'production';
}

export function getDemoAccount(email: string, password: string) {
  if (!isDevAuthEnabled()) return null;

  return (
    demoAccounts.find(
      (account) =>
        account.email.toLowerCase() === email.toLowerCase() && account.password === password
    ) ?? null
  );
}

export function getDevAccountFromRequest(request: NextRequest) {
  if (!isDevAuthEnabled() || request.cookies.get(DEV_AUTH_COOKIE)?.value !== '1') {
    return null;
  }

  const role = request.cookies.get(DEV_ROLE_COOKIE)?.value === 'business' ? 'business' : 'user';
  const email = request.cookies.get(DEV_EMAIL_COOKIE)?.value ?? `${role}@demo.local`;
  const onboardingCompleted = request.cookies.get(DEV_ONBOARDING_COOKIE)?.value === '1';

  return {
    id: `dev-${role}`,
    email,
    role,
    emailVerified: true,
    onboardingCompleted,
  };
}
