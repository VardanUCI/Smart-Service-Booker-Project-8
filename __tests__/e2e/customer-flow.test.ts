import { test, expect } from '@playwright/test';
import { signupAndLogin, loginAsProvider, uniqueEmail, TEST_PASSWORD } from './helpers';

test.describe('Customer happy path', () => {
  test('can sign up, search for providers, and join a waitlist', async ({ page, browser }) => {
    // Create an available provider in a separate browser context so the
    // customer search has something to find.
    const providerContext = await browser.newContext();
    const providerPage = await providerContext.newPage();
    const { provider } = await loginAsProvider(providerPage);
    await providerContext.close();

    // Step 1 + 2: Customer signup and login
    const email = uniqueEmail('customer');
    const user = await signupAndLogin(page, email, TEST_PASSWORD, 'E2E Customer');
    expect(user.id).toBeTruthy();

    // Step 3: Search for providers near the test location
    const searchRes = await page.request.get(
      '/api/search?lat=33.6846&lon=-117.8265&radius=10000&category=veterinarian',
    );
    expect(searchRes.status()).toBe(200);
    const { providers } = await searchRes.json();
    expect(Array.isArray(providers)).toBe(true);
    // Verify the provider we just created appears in results
    const found = (providers as Array<{ id: string }>).find((p) => p.id === provider.id);
    expect(found).toBeDefined();

    // Step 4: Join the specific provider's waitlist (use provider.id, not providers[0]
    // to avoid joining a stale provider left over from a previous test run)
    const targetProviderId = provider.id;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const joinRes = await page.request.post('/api/waitlist', {
      data: {
        provider_id: targetProviderId,
        category: 'veterinarian',
        urgency: 'today',
        contact_method: 'email',
        contact_value: email,
        expires_at: expiresAt,
      },
    });
    expect(joinRes.status()).toBe(201);
    const { waitlist } = await joinRes.json();
    expect(waitlist.status).toBe('waiting');
    expect(waitlist.provider_id).toBe(targetProviderId);

    // Step 5: Verify the entry appears in GET /api/waitlist
    const listRes = await page.request.get('/api/waitlist');
    expect(listRes.status()).toBe(200);
    const { waitlists } = await listRes.json();
    const entry = (waitlists as Array<{ id: string; provider_id: string }>)
      .find((w) => w.id === waitlist.id);
    expect(entry).toBeDefined();
    expect(entry!.provider_id).toBe(provider.id);
  });
});
