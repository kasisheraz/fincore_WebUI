import { chromium, FullConfig } from '@playwright/test';
import { ApiMockHelper } from './helpers/api-mock.helper';
import path from 'path';

/**
 * Global setup - runs ONCE before all tests
 * Authenticates and saves the session for all tests to reuse
 */
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('[GLOBAL SETUP] Starting one-time authentication...');
  
  // Setup API mocks
  const apiMock = new ApiMockHelper(page);
  await apiMock.mockAuthEndpoints();
  await apiMock.mockDashboardEndpoints();
  await apiMock.mockOrganizationsEndpoints();
  await apiMock.mockUsersEndpoints();
  await apiMock.mockKYCEndpoints();
  await apiMock.mockQuestionnaireEndpoints();
  await apiMock.mockCustomerAnswersEndpoints();
  
  // Perform login once
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="phoneNumber"]', '9876543210');
  await page.click('button:has-text("Request OTP")');
  await page.waitForSelector('input[name="otp"]', { timeout: 5000 });
  await page.fill('input[name="otp"]', '123456');
  await page.click('button:has-text("Verify OTP")');
  
  // Wait for successful login
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForFunction(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return token && user;
  }, { timeout: 5000 });
  
  console.log('[GLOBAL SETUP] Authentication successful');
  
  // Save signed-in state to 'storageState.json'
  const storageStatePath = path.join(__dirname, '.auth', 'storageState.json');
  await page.context().storageState({ path: storageStatePath });
  
  console.log(`[GLOBAL SETUP] Auth state saved to ${storageStatePath}`);
  
  await browser.close();
}

export default globalSetup;
