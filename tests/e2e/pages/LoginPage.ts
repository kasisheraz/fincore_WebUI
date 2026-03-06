import { Page, Locator } from '@playwright/test';
import { ApiMockHelper } from '../helpers/api-mock.helper';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly phoneNumberInput: Locator;
  readonly otpInput: Locator;
  readonly requestOtpButton: Locator;
  readonly verifyOtpButton: Locator;
  readonly errorMessage: Locator;
  readonly pageTitle: Locator;
  private apiMock: ApiMockHelper;

  constructor(page: Page) {
    this.page = page;
    this.phoneNumberInput = page.locator('input[name="phoneNumber"]');
    this.otpInput = page.locator('input[name="otp"]');
    this.requestOtpButton = page.locator('button:has-text("Request OTP")');
    this.verifyOtpButton = page.locator('button:has-text("Verify OTP")');
    this.errorMessage = page.locator('.MuiAlert-message');
    this.pageTitle = page.locator('h1:has-text("FinCore")');
    this.apiMock = new ApiMockHelper(page);
  }

  async goto(enableMock = false) {
    // For tests using fixtures, mocks are already set up
    // Only setup mocks if explicitly requested (for standalone login tests)
    if (enableMock) {
      await this.apiMock.mockAuthEndpoints();
    }
    await this.page.goto('/login');
  }

  async requestOtp(phoneNumber: string) {
    await this.phoneNumberInput.fill(phoneNumber);
    await this.requestOtpButton.click();
  }

  async verifyOtp(otp: string) {
    await this.otpInput.fill(otp);
    await this.verifyOtpButton.click();
  }

  async login(phoneNumber: string, otp: string) {
    await this.requestOtp(phoneNumber);
    await this.page.waitForSelector('input[name="otp"]', { timeout: 5000 });
    await this.verifyOtp(otp);
  }

  async waitForDashboard() {
    await this.page.waitForURL('**/dashboard');
  }
}