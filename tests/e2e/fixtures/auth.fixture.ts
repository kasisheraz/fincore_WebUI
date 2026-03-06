import { test as base, Page, Browser } from '@playwright/test';
import { ApiMockHelper } from '../helpers/api-mock.helper';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Test credentials for different user roles
 */
export const testUsers = {
  admin: {
    phoneNumber: '5555555555',
    otp: '123456',
    role: 'ADMIN'
  },
  manager: {
    phoneNumber: '9876543210',
    otp: '123456',
    role: 'MANAGER'
  },
  user: {
    phoneNumber: '1234567890',
    otp: '123456',
    role: 'USER'
  }
};

// Auth storage paths
const authDir = path.join(__dirname, '..', '.auth');
const userAuthFile = path.join(authDir, 'user.json');
const adminAuthFile = path.join(authDir, 'admin.json');

// Ensure auth directory exists
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

/**
 *  helper functions
 */
export async function setupMocks(page: Page) {
  const apiMock = new ApiMockHelper(page);
  await apiMock.mockDashboardEndpoints();
  await apiMock.mockOrganizationsEndpoints();
  await apiMock.mockUsersEndpoints();
  await apiMock.mockKYCEndpoints();
  await apiMock.mockQuestionnaireEndpoints();
  await apiMock.mockCustomerAnswersEndpoints();
}

/**
 * Wait for authentication to be ready after page load/navigation
 */
export async function waitForAuthReady(page: Page) {
  // Wait for the auth tokens to be in localStorage
  await page.waitForFunction(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return token && user;
  }, { timeout: 5000 });
  
  // Wait for the loading spinner to disappear (means auth initialized)
  await page.waitForFunction(() => {
    // Check if there's no loading spinner with "Authenticating..." or "Loading application..."
    const spinners = document.querySelectorAll('[role="progressbar"]');
    return spinners.length === 0;
  }, { timeout: 5000 });
  
  // Additional wait for networkidle to ensure page is fully loaded
  await page.waitForLoadState('networkidle');
}

export async function login(page: Page, phoneNumber: string, otp: string) {
  console.log(`[LOGIN] Starting login for ${phoneNumber}`);
  
  // Setup API mocks for non-auth endpoints (auth uses MOCK_AUTH config)
  await setupMocks(page);
  console.log('[LOGIN] Mocks setup complete');
  
  try {
    await page.goto('/login', { waitUntil: 'networkidle' });
    console.log('[LOGIN] Navigated to /login');
    
    // Enter phone number
    await page.fill('input[name="phoneNumber"]', phoneNumber);
    console.log('[LOGIN] Filled phone number');
    
    await page.click('button:has-text("Request OTP")');
    console.log('[LOGIN] Clicked Request OTP');
    
    // Wait for OTP input to appear
    await page.waitForSelector('input[name="otp"]', { timeout: 5000 });
    console.log('[LOGIN] OTP input visible');
    
    // Enter OTP
    await page.fill('input[name="otp"]', otp);
    console.log('[LOGIN] Filled OTP');
    
    await page.click('button:has-text("Verify OTP")');
    console.log('[LOGIN] Clicked Verify OTP');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('[LOGIN] Navigated to dashboard, URL:', page.url());
    
    // Wait for authentication to be fully set
    await page.waitForFunction(() => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      return token && user;
    }, { timeout: 5000 });
    console.log('[LOGIN] Auth tokens verified in localStorage');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log('[LOGIN] Page fully loaded');
  } catch (error) {
    console.error('[LOGIN] Login failed:', error);
    console.error('[LOGIN] Current URL:', page.url());
    console.error('[LOGIN] Page content:', await page.content());
    throw error;
  }
}

export async function logout(page: Page) {
  try {
    await page.click('button[aria-label="User menu"]', { timeout: 5000 });
    await page.click('text=Logout', { timeout: 5000 });
    await page.waitForURL('**/login', { timeout: 5000 });
  } catch (error) {
    // If logout fails, just navigate to login
    console.log('Logout failed, navigating to login directly');
    await page.goto('/login');
  }
}

/**
 * Custom fixture that provides authenticated context
 * Each test gets a fresh login to ensure auth state is reliable
 */
export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    console.log('[FIXTURE] Starting authentication for test');
    
    // Setup mocks
    await setupMocks(page);
    console.log('[FIXTURE] Mocks setup complete');
    
    // Login for this test
    try {
      await login(page, testUsers.user.phoneNumber, testUsers.user.otp);
      console.log('[FIXTURE] Login complete, current URL:', page.url());
      
      // Verify auth state
      const authCheck = await page.evaluate(() => ({
        token: !!localStorage.getItem('authToken'),
        user: !!localStorage.getItem('user'),
        url: window.location.href
      }));
      console.log('[FIXTURE] Auth state after login:', authCheck);
      
      // The page is now authenticated and on /dashboard
      // Pass it to the test
      await use(page);
    } catch (error) {
      console.error('[FIXTURE] Login failed:', error);
      throw error;
    }
    
    // Cleanup - logout removed to maintain auth state across tests
    // Only explicit logout tests will actually logout
    // This prevents "Logout failed" errors and is faster
    // try {
    //   await logout(page);
    // } catch (error) {
    //   console.log('Logout error during cleanup:', error);
    // }
  },
  
  adminPage: async ({ page }, use) => {
    // Setup mocks
    await setupMocks(page);
    
    // Login as admin for this test
    await login(page, testUsers.admin.phoneNumber, testUsers.admin.otp);
    
    // The page is now authenticated and on /dashboard
    // Pass it to the test
    await use(page);
    
    // Cleanup - logout removed to maintain auth state across tests
    // try {
    //   await logout(page);
    // } catch (error) {
    //   console.log('Logout error during cleanup:', error);
    // }
  }
});

export { expect } from '@playwright/test';
