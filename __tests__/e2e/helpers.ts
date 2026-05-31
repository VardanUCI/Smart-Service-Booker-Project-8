import { expect, type Page } from '@playwright/test';

export const TEST_PASSWORD = 'E2Etest123!';

// Generates a unique email per test run to avoid duplicate-account conflicts
export function uniqueEmail(prefix: string): string {
  return `${prefix}+${Date.now()}@e2e.test`;
}

/**
 * Signs up a new account then logs in, returning the user profile.
 * Requires Supabase email confirmation to be DISABLED in project settings —
 * if signup returns requiresEmailVerification:true the helper throws a
 * descriptive error rather than an opaque assertion failure.
 */
export async function signupAndLogin(
  page: Page,
  email: string,
  password: string,
  name: string,
  role: 'user' | 'business' = 'user',
) {
  const signupRes = await page.request.post('/api/auth/signup', {
    data: {
      email,
      password,
      name,
      role,
      ...(role === 'business' && { businessLocation: '123 Test St, Irvine CA' }),
    },
  });
  expect(signupRes.status()).toBe(201);

  const signupBody = await signupRes.json();
  if (signupBody.requiresEmailVerification) {
    throw new Error(
      'Supabase email confirmation is enabled — disable it in your project settings to run E2E tests.',
    );
  }

  const loginRes = await page.request.post('/api/auth/login', {
    data: { email, password },
  });
  expect(loginRes.status()).toBe(200);

  const { user } = await loginRes.json();
  return user as { id: string; email: string; role: string };
}

/**
 * Signs up and registers a provider account, then toggles availability on.
 * Returns the user and provider objects so tests can reference provider.id.
 */
export async function loginAsProvider(page: Page) {
  const email = uniqueEmail('provider');
  const user = await signupAndLogin(page, email, TEST_PASSWORD, 'E2E Test Clinic', 'business');

  const providerRes = await page.request.post('/api/providers', {
    data: {
      business_name: 'E2E Test Clinic',
      category: 'veterinarian',
      address: '123 Test St, Irvine CA',
      phone: '949-555-0000',
      latitude: 33.6846,
      longitude: -117.8265,
    },
  });
  expect(providerRes.status()).toBe(201);
  const { provider } = await providerRes.json();

  const toggleRes = await page.request.patch('/api/providers/toggle', {
    data: { is_available: true, duration_hours: 2 },
  });
  expect(toggleRes.status()).toBe(200);

  return { user, provider: provider as { id: string; business_name: string; category: string }, email };
}
