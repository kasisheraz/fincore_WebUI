import { test, expect } from '@playwright/test';

/**
 * UAT Health Check Smoke Tests
 * Verifies that the UAT environment is up and responding
 */

test.describe('UAT Environment Health Checks', () => {
  
  test('Frontend should be accessible', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('API health endpoint should be accessible', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    const response = await request.get(`${apiUrl}/actuator/health`);
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('UP');
  });

  test('API should accept requests', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    // Try to request OTP (should work even if phone number is invalid)
    const response = await request.post(`${apiUrl}/api/auth/request-otp`, {
      data: {
        phoneNumber: '+447700900000'
      }
    });
    
    // Should get either 200 (success) or 500 (user not found), but not connection error
    expect([200, 500]).toContain(response.status());
  });

  test('Static assets should load', async ({ page }) => {
    await page.goto('/');
    
    // Check that CSS loaded
    const stylesheets = await page.evaluate(() => {
      return document.styleSheets.length;
    });
    expect(stylesheets).toBeGreaterThan(0);
    
    // Check that JavaScript loaded
    const scripts = await page.evaluate(() => {
      return document.scripts.length;
    });
    expect(scripts).toBeGreaterThan(0);
  });
});
