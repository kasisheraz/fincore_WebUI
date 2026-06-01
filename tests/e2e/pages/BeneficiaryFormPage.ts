import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Beneficiary Create/Edit Form
 * Handles all interactions with the beneficiary form page
 */
export class BeneficiaryFormPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly backButton: Locator;
  
  // Basic Information fields
  readonly beneficiaryNameInput: Locator;
  readonly nickNameInput: Locator;
  readonly businessNameInput: Locator;
  readonly countryInput: Locator;
  
  // C2C fields
  readonly c2cCheckbox: Locator;
  readonly collectorContactInput: Locator;
  
  // Address fields
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly postalCodeInput: Locator;
  readonly addressCountryInput: Locator;
  readonly saveAddressButton: Locator;
  
  // Form actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly errorAlert: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h5, h4').filter({ hasText: /beneficiary/i });
    this.backButton = page.getByRole('button', { name: /back to list/i });
    
    // Basic fields - use more flexible selectors
    this.beneficiaryNameInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'Beneficiary Name' }) }).or(
      page.getByLabel('Beneficiary Name')
    );
    this.nickNameInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'Nick Name' }) }).or(
      page.getByLabel('Nick Name')
    );
    this.businessNameInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'Business Name' }) }).or(
      page.getByLabel('Business Name')
    );
    this.countryInput = page.locator('input').filter({ has: page.locator('label', { hasText: /^Country$/i }) }).or(
      page.getByLabel(/^Country$/i)
    ).first();
    
    this.c2cCheckbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('span', { hasText: /counter over counter/i }) }).or(
      page.getByRole('checkbox', { name: /counter over counter/i })
    );
    this.collectorContactInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'Collector Contact Number' }) }).or(
      page.getByLabel('Collector Contact Number')
    );
    
    // Address fields
    this.addressLine1Input = page.locator('input').filter({ has: page.locator('label', { hasText: 'Address Line 1' }) }).or(
      page.getByLabel('Address Line 1')
    );
    this.addressLine2Input = page.locator('input').filter({ has: page.locator('label', { hasText: 'Address Line 2' }) }).or(
      page.getByLabel('Address Line 2')
    );
    this.cityInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'City' }) }).or(
      page.getByLabel('City')
    );
    this.stateInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'State' }) }).or(
      page.getByLabel(/state/i)
    );
    this.postalCodeInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'Postal Code' }) }).or(
      page.getByLabel('Postal Code')
    );
    this.addressCountryInput = page.locator('input').filter({ has: page.locator('label', { hasText: 'Country' }) }).or(
      page.getByLabel('Country')
    ).last();
    this.saveAddressButton = page.getByRole('button', { name: /save address/i }).or(
      page.getByRole('button', { name: /update address/i })
    );
    
    // Actions
    this.saveButton = page.getByRole('button', { name: /create beneficiary|update beneficiary/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.errorAlert = page.locator('[class*="MuiAlert"][class*="error"]');
    this.successMessage = page.locator('[class*="MuiAlert"][class*="success"]');
  }

  async gotoCreate() {
    await this.page.goto('/beneficiaries/create');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoEdit(id: number) {
    await this.page.goto(`/beneficiaries/edit/${id}`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillBasicInformation(data: {
    beneficiaryName: string;
    nickName?: string;
    businessName?: string;
    country: string;
  }) {
    await this.beneficiaryNameInput.fill(data.beneficiaryName);
    if (data.nickName) {
      await this.nickNameInput.fill(data.nickName);
    }
    if (data.businessName) {
      await this.businessNameInput.fill(data.businessName);
    }
    await this.countryInput.fill(data.country);
  }

  async enableC2C(collectorContact: string) {
    await this.c2cCheckbox.check();
    await this.page.waitForTimeout(300); // Wait for conditional field to appear
    await this.collectorContactInput.fill(collectorContact);
  }

  async disableC2C() {
    await this.c2cCheckbox.uncheck();
  }

  async fillAddress(data: {
    addressLine1: string;
    addressLine2?: string;
    city?: string;
    stateCode?: string;
    postalCode?: string;
    country: string;
  }) {
    await this.addressLine1Input.fill(data.addressLine1);
    if (data.addressLine2) {
      await this.addressLine2Input.fill(data.addressLine2);
    }
    if (data.city) {
      await this.cityInput.fill(data.city);
    }
    if (data.stateCode) {
      await this.stateInput.fill(data.stateCode);
    }
    if (data.postalCode) {
      await this.postalCodeInput.fill(data.postalCode);
    }
    await this.addressCountryInput.fill(data.country);
  }

  async saveAddress() {
    await this.saveAddressButton.click();
    await this.page.waitForTimeout(1000); // Wait for address save
  }

  async isAddressSaved(): Promise<boolean> {
    const savedIndicator = this.page.getByText('✓ Address Saved');
    return await savedIndicator.isVisible();
  }

  async submitForm() {
    await this.saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.errorAlert.isVisible()) {
      return await this.errorAlert.textContent() || '';
    }
    return '';
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.saveButton.isEnabled();
  }

  /**
   * Complete flow: Fill all fields and save beneficiary
   */
  async createBeneficiary(data: {
    beneficiaryName: string;
    nickName?: string;
    businessName?: string;
    country: string;
    address: {
      addressLine1: string;
      addressLine2?: string;
      city?: string;
      stateCode?: string;
      postalCode?: string;
      country: string;
    };
    isC2C?: boolean;
    collectorContact?: string;
  }) {
    // Fill basic information
    await this.fillBasicInformation({
      beneficiaryName: data.beneficiaryName,
      nickName: data.nickName,
      businessName: data.businessName,
      country: data.country,
    });

    // Handle C2C
    if (data.isC2C && data.collectorContact) {
      await this.enableC2C(data.collectorContact);
    }

    // Fill and save address
    await this.fillAddress(data.address);
    await this.saveAddress();

    // Wait for address saved indicator
    await this.page.waitForTimeout(1500);

    // Submit form
    await this.submitForm();
  }
}
