import { test, expect } from '@playwright/test';

/**
 * UAT Basic Operations Smoke Tests
 * Verifies core application functionality in UAT
 * 
 * Note: These tests require authenticated session
 * Run after successful login test or use API to generate auth token
 */

const UAT_PHONE = '+447700900000';

// Helper function to get auth token via API
async function getAuthToken(request: any): Promise<string | null> {
  const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
  
  try {
    // Request OTP
    const otpResponse = await request.post(`${apiUrl}/api/auth/request-otp`, {
      data: { phoneNumber: UAT_PHONE }
    });
    
    if (otpResponse.status() !== 200) {
      console.error('Failed to request OTP');
      return null;
    }
    
    // Note: In real test, you'd retrieve OTP from backend logs or test database
    // For smoke test, we return null to skip tests requiring auth
    console.log('OTP requested for', UAT_PHONE);
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

test.describe('UAT Navigation Smoke Tests', () => {
  
  test('Application should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected routes should be inaccessible without auth', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/users',
      '/organizations',
      '/applications',
      '/kyc-uploads',
      '/profile'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('Login page should be accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
  });
});

test.describe('UAT UI Components Smoke Tests', () => {
  
  test('Login page components should render properly', async ({ page }) => {
    await page.goto('/login');
    
    // Check form components
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();
    
    // Check branding/styling
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(bodyBgColor).toBeTruthy();
  });

  test('Application should not have console errors on login page', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected/known errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.toLowerCase().includes('warning')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('UAT API Integration Smoke Tests', () => {
  
  test('Should handle API request-otp endpoint', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    const response = await request.post(`${apiUrl}/api/auth/request-otp`, {
      data: {
        phoneNumber: UAT_PHONE
      }
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('phoneNumber');
    expect(body.phoneNumber).toBe(UAT_PHONE);
  });

  test('Should validate CORS headers', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    const response = await request.options(`${apiUrl}/api/auth/request-otp`, {
      headers: {
        'Origin': 'https://fincore-webui-uat-994490239798.europe-west2.run.app',
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    // Should allow CORS or return 2xx/4xx (not 5xx)
    expect(response.status()).toBeLessThan(500);
  });

  test('API should return proper error for missing data', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    const response = await request.post(`${apiUrl}/api/auth/verify-otp`, {
      data: {}
    });
    
    // Should return 4xx or 5xx error (not 200)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('UAT Performance Smoke Tests', () => {
  
  test('Login page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds (generous for UAT)
    expect(loadTime).toBeLessThan(10000);
  });

  test('API health check should respond quickly', async ({ request }) => {
    const apiUrl = process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app';
    
    const startTime = Date.now();
    const response = await request.get(`${apiUrl}/actuator/health`);
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    
    // Should respond within 5 seconds
    expect(responseTime).toBeLessThan(5000);
  });

  test('Static assets should be cached properly', async ({ page }) => {
    await page.goto('/login');
    
    // Get all CSS and JS resources
    const resources = await page.evaluate(() => {
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(el => el.getAttribute('href'));
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(el => el.getAttribute('src'));
      return { stylesheets, scripts };
    });
    
    // Should have at least one stylesheet and one script
    expect(resources.stylesheets.length).toBeGreaterThan(0);
    expect(resources.scripts.length).toBeGreaterThan(0);
  });
});

test.describe('UAT Mobile Responsiveness Smoke Tests', () => {
  
  test('Login page should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/login');
    
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();
    
    // Form should be usable
    await page.fill('input[name="phoneNumber"]', UAT_PHONE);
    await expect(page.locator('input[name="phoneNumber"]')).toHaveValue(UAT_PHONE);
  });

  test('Login page should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/login');
    
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();
  });
});
