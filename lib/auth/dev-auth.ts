import type { NextRequest } from 'next/server';

export const DEV_AUTH_COOKIE = 'ssb-dev-auth';
export const DEV_EMAIL_COOKIE = 'ssb-dev-email';
export const DEV_ROLE_COOKIE = 'ssb-dev-role';
export const DEV_ONBOARDING_COOKIE = 'ssb-dev-onboarding';

type DevAccount = {
  id: string;
  email: string;
  role: 'user' | 'business';
  emailVerified: boolean;
  onboardingCompleted: boolean;
};

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
  // NODE_ENV is always 'production' on Vercel (including preview deployments), so we use
  // a dedicated flag instead. Set NEXT_PUBLIC_ENABLE_DEMO_AUTH=true in Vercel's environment
  // variables for any environment where demo accounts should be accessible.
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true';
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

export function getDevAccountFromRequest(request: NextRequest): DevAccount | null {
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
