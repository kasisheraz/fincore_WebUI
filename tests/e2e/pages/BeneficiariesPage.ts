import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Beneficiaries List Page
 * Handles all interactions with the beneficiaries management page
 */
export class BeneficiariesPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addBeneficiaryButton: Locator;
  readonly searchBar: Locator;
  readonly refreshButton: Locator;
  readonly dataTable: Locator;
  readonly filterPanel: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByText('Beneficiaries', { exact: true });
    this.addBeneficiaryButton = page.getByRole('button', { name: /add beneficiary/i });
    this.searchBar = page.locator('input[placeholder*="Search"]');
    this.refreshButton = page.getByRole('button', { name: /refresh/i });
    this.dataTable = page.locator('table');
    this.filterPanel = page.locator('[class*="MuiPaper"]').filter({ hasText: 'Status' });
    this.statusFilter = page.locator('select[name="status"]');
  }

  async goto() {
    await this.page.goto('/beneficiaries');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddBeneficiary() {
    await this.addBeneficiaryButton.click();
    await this.page.waitForURL('**/beneficiaries/create');
  }

  async searchBeneficiary(name: string) {
    await this.searchBar.fill(name);
    await this.searchBar.press('Enter');
    await this.page.waitForTimeout(500); // Wait for search results
  }

  async clearSearch() {
    const clearButton = this.page.getByRole('button', { name: /clear/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  async refresh() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickEditBeneficiary(beneficiaryName: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const editButton = row.locator('button[aria-label="Edit"]').or(row.getByRole('button', { name: /edit/i }));
    await editButton.click();
  }

  async clickDeleteBeneficiary(beneficiaryName: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const deleteButton = row.locator('button[aria-label="Delete"]').or(row.getByRole('button', { name: /delete/i }));
    await deleteButton.click();
  }

  async confirmDelete() {
    const confirmButton = this.page.getByRole('button', { name: /^delete$/i });
    await confirmButton.click();
    await this.page.waitForTimeout(1000);
  }

  async cancelDelete() {
    const cancelButton = this.page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  }

  async clickSubmitForReview(beneficiaryName: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const submitButton = row.locator('button[title="Submit for Review"]');
    await submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickViewDetails(beneficiaryName: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    await row.click();
    await this.page.waitForTimeout(500);
  }

  async getBeneficiaryCount(): Promise<string> {
    const countText = await this.addBeneficiaryButton.textContent();
    return countText || '';
  }

  async isBeneficiaryVisible(beneficiaryName: string): Promise<boolean> {
    return await this.page.locator('tr').filter({ hasText: beneficiaryName }).isVisible();
  }

  async getStatusChip(beneficiaryName: string): Promise<string> {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const statusChip = row.locator('[class*="MuiChip"]');
    return await statusChip.textContent() || '';
  }

  // Admin-specific actions
  async clickApproveBeneficiary(beneficiaryName: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const approveButton = row.locator('button[title="Approve"]');
    await approveButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickRejectBeneficiary(beneficiaryName: string, reason: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const rejectButton = row.locator('button[title="Reject"]');
    await rejectButton.click();
    
    // Fill rejection reason
    const reasonTextarea = this.page.locator('textarea[placeholder*="reason"]');
    await reasonTextarea.fill(reason);
    
    const confirmButton = this.page.getByRole('button', { name: /reject/i });
    await confirmButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickSuspendBeneficiary(beneficiaryName: string, reason: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const suspendButton = row.locator('button[title="Suspend"]');
    await suspendButton.click();
    
    const reasonTextarea = this.page.locator('textarea[placeholder*="reason"]');
    await reasonTextarea.fill(reason);
    
    const confirmButton = this.page.getByRole('button', { name: /suspend/i });
    await confirmButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickReactivateBeneficiary(beneficiaryName: string) {
    const row = this.page.locator('tr').filter({ hasText: beneficiaryName });
    const reactivateButton = row.locator('button[title="Reactivate"]');
    await reactivateButton.click();
    await this.page.waitForTimeout(1000);
  }
}
