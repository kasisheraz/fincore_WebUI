import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Beneficiary Details Page
 * Handles all interactions with the beneficiary details/view page
 */
export class BeneficiaryDetailsPage {
  readonly page: Page;
  readonly beneficiaryName: Locator;
  readonly backButton: Locator;
  readonly editButton: Locator;
  readonly submitForReviewButton: Locator;
  readonly statusChip: Locator;
  readonly statusBanner: Locator;
  
  // Basic Info section
  readonly basicInfoCard: Locator;
  readonly nickNameField: Locator;
  readonly businessNameField: Locator;
  readonly countryChip: Locator;
  readonly c2cChip: Locator;
  readonly collectorContactField: Locator;
  
  // Address section
  readonly addressCard: Locator;
  readonly addressLine1: Locator;
  readonly addressLine2: Locator;
  readonly city: Locator;
  readonly country: Locator;
  
  // Audit section
  readonly createdDate: Locator;
  readonly modifiedDate: Locator;
  
  // KYC Documents section
  readonly kycDocumentsSection: Locator;
  readonly uploadButton: Locator;
  readonly documentTypeSelect: Locator;
  readonly fileInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.beneficiaryName = page.locator('h4').first();
    this.backButton = page.getByRole('button', { name: /back to list/i });
    this.editButton = page.getByRole('button', { name: /edit/i });
    this.submitForReviewButton = page.getByRole('button', { name: /submit for review/i });
    this.statusChip = page.locator('[class*="MuiChip"]').first();
    this.statusBanner = page.locator('[class*="MuiAlert"]').first();
    
    this.basicInfoCard = page.locator('[class*="MuiCard"]').filter({ hasText: 'Basic Information' });
    this.nickNameField = this.basicInfoCard.locator('text=Nick Name').locator('..');
    this.businessNameField = this.basicInfoCard.locator('text=Business Name').locator('..');
    this.countryChip = this.basicInfoCard.locator('[class*="MuiChip"]').filter({ has: page.locator('[data-testid="LocationOnIcon"]') });
    this.c2cChip = this.basicInfoCard.locator('[class*="MuiChip"]').filter({ hasText: /counter over counter/i });
    this.collectorContactField = this.basicInfoCard.locator('text=Collector Contact Number').locator('..');
    
    this.addressCard = page.locator('[class*="MuiCard"]').filter({ hasText: 'Registered Address' });
    this.addressLine1 = this.addressCard.locator('p').first();
    this.addressLine2 = this.addressCard.locator('p').nth(1);
    this.city = this.addressCard.locator('p').nth(2);
    this.country = this.addressCard.locator('p').last();
    
    this.createdDate = page.locator('text=Created').locator('..');
    this.modifiedDate = page.locator('text=Last Modified').locator('..');
    
    this.kycDocumentsSection = page.locator('text=KYC Documents').locator('..');
    this.uploadButton = page.getByRole('button', { name: /upload|choose file/i });
    this.documentTypeSelect = page.locator('select[name="documentType"]').or(
      page.locator('[aria-label="Document Type"]')
    );
    this.fileInput = page.locator('input[type="file"]');
  }

  async goto(id: number) {
    await this.page.goto(`/beneficiaries/${id}`);
    await this.page.waitForURL(/\/beneficiaries\/\d+/, { timeout: 10000 });
    await this.beneficiaryName.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickBack() {
    await this.backButton.click();
    await this.page.waitForURL('**/beneficiaries');
  }

  async clickEdit() {
    await this.editButton.click();
    await this.page.waitForURL('**/beneficiaries/edit/**');
  }

  async clickSubmitForReview() {
    await this.submitForReviewButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getStatus(): Promise<string> {
    return await this.statusChip.textContent() || '';
  }

  async getStatusBannerMessage(): Promise<string> {
    if (await this.statusBanner.isVisible()) {
      return await this.statusBanner.textContent() || '';
    }
    return '';
  }

  async getBeneficiaryName(): Promise<string> {
    return await this.beneficiaryName.textContent() || '';
  }

  async getNickName(): Promise<string | null> {
    if (await this.nickNameField.isVisible()) {
      const text = await this.nickNameField.textContent();
      return text?.replace('Nick Name', '').trim() || null;
    }
    return null;
  }

  async getBusinessName(): Promise<string | null> {
    if (await this.businessNameField.isVisible()) {
      const text = await this.businessNameField.textContent();
      return text?.replace('Business Name', '').trim() || null;
    }
    return null;
  }

  async isC2C(): Promise<boolean> {
    return await this.c2cChip.isVisible();
  }

  async getCollectorContact(): Promise<string | null> {
    if (await this.collectorContactField.isVisible()) {
      const text = await this.collectorContactField.textContent();
      return text?.replace('Collector Contact Number', '').trim() || null;
    }
    return null;
  }

  async getAddress(): Promise<{
    addressLine1: string;
    city: string;
    country: string;
  }> {
    return {
      addressLine1: await this.addressLine1.textContent() || '',
      city: await this.city.textContent() || '',
      country: await this.country.textContent() || '',
    };
  }

  async isEditButtonVisible(): Promise<boolean> {
    return await this.editButton.isVisible();
  }

  async isSubmitButtonVisible(): Promise<boolean> {
    return await this.submitForReviewButton.isVisible();
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    if (await this.isSubmitButtonVisible()) {
      return await this.submitForReviewButton.isEnabled();
    }
    return false;
  }

  // KYC Document operations
  async uploadDocument(documentType: string, filePath: string) {
    // Select document type
    await this.documentTypeSelect.selectOption(documentType);
    
    // Upload file
    await this.fileInput.setInputFiles(filePath);
    
    // Wait for upload to complete
    await this.page.waitForTimeout(2000);
  }

  async isDocumentUploaded(documentType: string): Promise<boolean> {
    const documentRow = this.page.locator('tr').filter({ hasText: documentType });
    return await documentRow.isVisible();
  }

  async getDocumentStatus(documentType: string): Promise<string> {
    const documentRow = this.page.locator('tr').filter({ hasText: documentType });
    const statusChip = documentRow.locator('[class*="MuiChip"]');
    return await statusChip.textContent() || '';
  }

  async deleteDocument(documentType: string) {
    const documentRow = this.page.locator('tr').filter({ hasText: documentType });
    const deleteButton = documentRow.locator('button[aria-label="Delete"]');
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getRequiredDocumentsList(): Promise<string[]> {
    const requiredList = this.kycDocumentsSection.locator('ul li');
    const count = await requiredList.count();
    const documents: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await requiredList.nth(i).textContent();
      if (text) {
        documents.push(text.trim());
      }
    }
    
    return documents;
  }
}
