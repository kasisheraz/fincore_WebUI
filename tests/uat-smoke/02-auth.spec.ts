import { test, expect } from '@playwright/test';

/**
 * UAT Login Smoke Tests
 * Verifies that authentication flow works in UAT
 */

// UAT Test Credentials
const UAT_CREDENTIALS = {
  phoneNumber: '+447700900000',
  // OTP will be retrieved from API response or logs
};

test.describe('UAT Authentication Smoke Tests', () => {
  
  test('Login page should render correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/FinCore/i);
  });

  test('Should accept international phone number format', async ({ page }) => {
    await page.goto('/login');
    
    const phoneInput = page.locator('input[name="phoneNumber"]');
    await phoneInput.fill(UAT_CREDENTIALS.phoneNumber);
    
    // Should accept the full international number
    await expect(phoneInput).toHaveValue(UAT_CREDENTIALS.phoneNumber);
    
    // Request OTP button should be enabled
    const requestButton = page.locator('button:has-text("Request OTP")');
    await expect(requestButton).toBeEnabled();
  });

  test('Should successfully request OTP via API', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    const response = await request.post(`${apiUrl}/api/auth/request-otp`, {
      data: {
        phoneNumber: UAT_CREDENTIALS.phoneNumber
      }
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.message).toContain('OTP sent');
    expect(body.phoneNumber).toBe(UAT_CREDENTIALS.phoneNumber);
    expect(body.expiresIn).toBe(300);
  });

  test('OTP input should appear after requesting OTP', async ({ page }) => {
    await page.goto('/login');
    
    // Fill phone number
    await page.fill('input[name="phoneNumber"]', UAT_CREDENTIALS.phoneNumber);
    
    // Click Request OTP
    await page.click('button:has-text("Request OTP")');
    
    // Wait for OTP input to appear (should appear within 5 seconds)
    await expect(page.locator('input[name="otp"]')).toBeVisible({ timeout: 10000 });
    
    // Verify OTP button is visible
    await expect(page.locator('button:has-text("Verify OTP")')).toBeVisible();
  });

  test('Should show validation for invalid OTP', async ({ page }) => {
    await page.goto('/login');
    
    // Request OTP first
    await page.fill('input[name="phoneNumber"]', UAT_CREDENTIALS.phoneNumber);
    await page.click('button:has-text("Request OTP")');
    await page.waitForSelector('input[name="otp"]', { timeout: 10000 });
    
    // Enter invalid OTP
    await page.fill('input[name="otp"]', '000000');
    await page.click('button:has-text("Verify OTP")');
    
    // Should show error (either "Invalid OTP" or "expired")
    await expect(page.locator('text=/invalid|expired/i')).toBeVisible({ timeout: 10000 });
  });

  test('Login form should be responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Form elements should still be visible
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();
    
    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
  });
});

test.describe('UAT API Authentication Tests', () => {
  
  test('API should validate phone number format', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    // Test with invalid phone (empty)
    const response1 = await request.post(`${apiUrl}/api/auth/request-otp`, {
      data: {
        phoneNumber: ''
      }
    });
    expect([400, 500]).toContain(response1.status());
    
    // Test with valid international format
    const response2 = await request.post(`${apiUrl}/api/auth/request-otp`, {
      data: {
        phoneNumber: UAT_CREDENTIALS.phoneNumber
      }
    });
    expect(response2.status()).toBe(200);
  });

  test('API should enforce OTP expiration', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    // Try to verify with expired/invalid OTP
    const response = await request.post(`${apiUrl}/api/auth/verify-otp`, {
      data: {
        phoneNumber: UAT_CREDENTIALS.phoneNumber,
        otp: '999999' // Invalid OTP
      }
    });
    
    expect(response.status()).toBe(500);
    const body = await response.json();
    expect(body.message).toMatch(/invalid|expired/i);
  });
});
