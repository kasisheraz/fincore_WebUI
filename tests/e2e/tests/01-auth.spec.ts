import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testUsers } from '../fixtures/auth.fixture';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await expect(loginPage.pageTitle).toBeVisible();
    await expect(loginPage.phoneNumberInput).toBeVisible();
    await expect(loginPage.requestOtpButton).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login(testUsers.user.phoneNumber, testUsers.user.otp);
    
    // Should redirect to dashboard
    await loginPage.waitForDashboard();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show OTP input after requesting OTP', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.requestOtp(testUsers.user.phoneNumber);
    
    await expect(loginPage.otpInput).toBeVisible();
    await expect(loginPage.verifyOtpButton).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.phoneNumberInput.fill('invalid');
    await loginPage.requestOtpButton.click();
    
    // Check for validation error - look for the actual error message
    const errorMessage = await loginPage.errorMessage.textContent();
    expect(errorMessage).toContain('valid');
  });

  test('should handle logout correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login first
    await loginPage.login(testUsers.user.phoneNumber, testUsers.user.otp);
    await loginPage.waitForDashboard();
    
    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should prevent access to protected routes without login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login first
    await loginPage.login(testUsers.user.phoneNumber, testUsers.user.otp);
    await loginPage.waitForDashboard();
    
    // Try to go to login page again
    await page.goto('/login');
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should persist authentication after page reload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login
    await loginPage.login(testUsers.user.phoneNumber, testUsers.user.otp);
    await loginPage.waitForDashboard();
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
