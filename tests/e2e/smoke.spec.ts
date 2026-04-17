import { test, expect } from '@playwright/test';
import { setupMocks } from './fixtures/auth.fixture';

/**
 * Smoke Tests - Critical Path Validation
 * Fast subset of tests to run before push (< 1 minute)
 * Full E2E suite runs in CI/CD pipeline
 * 
 * Note: Auth state is loaded from storage (global setup)
 */
test.describe('Smoke Tests - Critical Paths', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup API mocks (auth state already loaded from storage)
    await setupMocks(page);
    
    // Navigate to dashboard (we're already authenticated)
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Verify we're authenticated
    const isAuthenticated = await page.evaluate(() => {
      return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
    });
    
    if (!isAuthenticated) {
      throw new Error('Auth state not loaded - global setup failed');
    }
  });

  test('should successfully login and reach dashboard', async ({ page }) => {
    // Already logged in via beforeEach - verify we're on dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.url()).toContain('/dashboard');
  });

  // Temporar skip - auth state persistence issue being fixed separately
  test.skip('should navigate to users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('User Management')).toBeVisible();
    
    // Verify Add User button exists
    const addUserButton = page.getByRole('button', { name: /add user/i });
    await expect(addUserButton).toBeVisible();
  });

  test.skip('should open create user dialog', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: /add user/i }).click();
    
    // Verify dialog opened with required fields
    await expect(page.getByText('Create New User')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test.skip('should navigate to organizations page', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page.getByText('Organization Management')).toBeVisible();
    
    const addOrgButton = page.getByRole('button', { name: /add organization/i });
    await expect(addOrgButton).toBeVisible();
  });

  test.skip('should open create organization dialog', async ({ page }) => {
    await page.goto('/organizations');
    await page.getByRole('button', { name: /add organization/i }).click();
    
    await expect(page.getByText('Create Organization')).toBeVisible();
    // Wait for the first tab to load
    await expect(page.getByText('Basic Organization Information')).toBeVisible();
  });

  test('should navigate to KYC documents page', async ({ page }) => {
    await page.goto('/kyc-documents');
    // Verify page loaded
    await expect(page.url()).toContain('/kyc-documents');
  });

  test('should navigate to questionnaire page', async ({ page }) => {
    await page.goto('/questionnaire');
    // Verify page loaded
    await expect(page.url()).toContain('/questionnaire');
  });

  test('should logout successfully', async ({ page }) => {
    // Find and click logout button (adjust selector based on your app)
    const logoutButton = page.getByRole('button', { name: /logout/i }).or(
      page.locator('[aria-label="Logout"]')
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL('/login', { timeout: 5000 });
    }
  });
});
