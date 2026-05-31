import { test, expect } from '@playwright/test';
import { signupAndLogin, uniqueEmail, TEST_PASSWORD } from './helpers';

test.describe('Provider registration flow', () => {
  test('can register, create a slot, toggle availability, and appear in search', async ({ page }) => {
    // Step 1: Sign up and log in as a business account
    const email = uniqueEmail('provider');
    const user = await signupAndLogin(page, email, TEST_PASSWORD, 'E2E Test Clinic', 'business');
    expect(user.id).toBeTruthy();

    // Step 2: Register the provider profile
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
    expect(provider.id).toBe(user.id);
    expect(provider.business_name).toBe('E2E Test Clinic');

    // Step 3: Create an availability slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slotRes = await page.request.post('/api/availability', {
      data: {
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        capacity: 3,
      },
    });
    expect(slotRes.status()).toBe(201);
    const { slot } = await slotRes.json();
    expect(slot.date).toBe(dateStr);
    expect(slot.capacity).toBe(3);

    // Step 4: Verify the slot appears in the public availability endpoint
    const availRes = await page.request.get(`/api/providers/${provider.id}/availability`);
    expect(availRes.status()).toBe(200);
    const { slots } = await availRes.json();
    const created = (slots as Array<{ id: string; is_available: boolean }>)
      .find((s) => s.id === slot.id);
    expect(created).toBeDefined();
    expect(created!.is_available).toBe(true);

    // Step 5: Toggle availability on
    const toggleRes = await page.request.patch('/api/providers/toggle', {
      data: { is_available: true, duration_hours: 2 },
    });
    expect(toggleRes.status()).toBe(200);
    const { provider: toggled } = await toggleRes.json();
    expect(toggled.is_available).toBe(true);
    expect(toggled.available_until).not.toBeNull();

    // Step 6: Provider appears in search results
    const searchRes = await page.request.get(
      '/api/search?lat=33.6846&lon=-117.8265&radius=10000&category=veterinarian',
    );
    expect(searchRes.status()).toBe(200);
    const { providers } = await searchRes.json();
    const found = (providers as Array<{ id: string }>).find((p) => p.id === provider.id);
    expect(found).toBeDefined();
  });
});
