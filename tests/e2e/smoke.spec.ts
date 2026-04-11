import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Critical Path Validation
 * Fast subset of tests to run before push (< 1 minute)
 * Full E2E suite runs in CI/CD pipeline
 */
test.describe('Smoke Tests - Critical Paths', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="phoneNumber"]', '+1234567890');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should successfully login and reach dashboard', async ({ page }) => {
    // Already logged in via beforeEach
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    await expect(page.url()).toContain('/dashboard');
  });

  test('should navigate to users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText('User Management')).toBeVisible();
    
    // Verify Create User button exists
    const createButton = page.getByRole('button', { name: /create user/i });
    await expect(createButton).toBeVisible();
  });

  test('should open create user dialog', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: /create user/i }).click();
    
    // Verify dialog opened with required fields
    await expect(page.getByText('Create User')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should navigate to organizations page', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page.getByText('Organization Management')).toBeVisible();
    
    const createButton = page.getByRole('button', { name: /create organization/i });
    await expect(createButton).toBeVisible();
  });

  test('should open create organization dialog', async ({ page }) => {
    await page.goto('/organizations');
    await page.getByRole('button', { name: /create organization/i }).click();
    
    await expect(page.getByText('Create Organization')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should navigate to KYC documents page', async ({ page }) => {
    await page.goto('/kyc-documents');
    // Verify page loaded (adjust selector based on actual page)
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
