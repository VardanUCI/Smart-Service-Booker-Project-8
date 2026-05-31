import { test, expect } from '@playwright/test';
import { signupAndLogin, loginAsProvider, uniqueEmail, TEST_PASSWORD } from './helpers';

test.describe('Dispatch flow (Model C)', () => {
  test('customer creates dispatch, provider claims it, double-claim returns 409', async ({
    page,
    browser,
  }) => {
    // Step 1: Set up an available provider in a separate context
    const providerContext = await browser.newContext();
    const providerPage = await providerContext.newPage();
    await loginAsProvider(providerPage);

    // Step 1 (continued): Customer signup and login on the main page
    const customerEmail = uniqueEmail('customer');
    const customer = await signupAndLogin(page, customerEmail, TEST_PASSWORD, 'E2E Customer');
    expect(customer.id).toBeTruthy();

    // Step 2: Customer creates a dispatch request
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const dispatchRes = await page.request.post('/api/dispatch', {
      data: {
        category: 'veterinarian',
        description: 'My dog needs urgent care',
        address: '456 Oak Ave, Irvine CA',
        latitude: 33.6846,
        longitude: -117.8265,
        radius_meters: 10000,
        expires_in_minutes: 60,
      },
    });
    expect(dispatchRes.status()).toBe(201);
    const { dispatch } = await dispatchRes.json();
    expect(dispatch.status).toBe('open');
    expect(dispatch.category).toBe('veterinarian');

    // Step 3: Provider sees the open request
    const availableRes = await providerPage.request.get('/api/dispatch/available');
    expect(availableRes.status()).toBe(200);
    const { dispatch_requests } = await availableRes.json();
    const found = (dispatch_requests as Array<{ id: string }>).find((r) => r.id === dispatch.id);
    expect(found).toBeDefined();

    // Step 4: Provider claims the request
    const claimRes = await providerPage.request.post(`/api/dispatch/${dispatch.id}/claim`);
    expect(claimRes.status()).toBe(200);
    const { dispatch_request: claimed } = await claimRes.json();
    expect(claimed.status).toBe('claimed');
    expect(claimed.claimed_by).toBeTruthy();

    // Step 5: Same provider tries to claim again — must get 409
    const reclaimRes = await providerPage.request.post(`/api/dispatch/${dispatch.id}/claim`);
    expect(reclaimRes.status()).toBe(409);
    const reclaimBody = await reclaimRes.json();
    expect(reclaimBody.error).toBeTruthy();

    await providerContext.close();
  });
});
