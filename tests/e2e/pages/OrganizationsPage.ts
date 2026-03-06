import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Organizations Page
 */
export class OrganizationsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addButton: Locator;
  readonly searchBar: Locator;
  readonly filterButton: Locator;
  readonly refreshButton: Locator;
  readonly dataTable: Locator;
  readonly dialogTitle: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h5:has-text("Organization Management")');
    this.addButton = page.locator('button:has-text("Add Organization")');
    this.searchBar = page.locator('input[placeholder*="Search"]');
    this.filterButton = page.locator('button[aria-label="Filter"]');
    this.refreshButton = page.locator('button[aria-label*="Refresh"]');
    this.dataTable = page.locator('.MuiDataGrid-root, table');
    this.dialogTitle = page.locator('.MuiDialog-root h2');
    this.saveButton = page.locator('button:has-text("Save")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/organizations')) {
      // Use sidebar navigation (React Router) instead of hard page reload
      // to preserve authentication state
      const sidebarOrgBtn = this.page.getByRole('button', { name: 'Organizations' });
      const count = await sidebarOrgBtn.count();
      console.log(`[ORG_GOTO] Current URL: ${this.page.url()}, sidebar btn count: ${count}`);
      if (count > 0) {
        await sidebarOrgBtn.click();
        console.log(`[ORG_GOTO] Clicked Organizations btn, waiting for URL...`);
        await this.page.waitForURL('**/organizations', { timeout: 10000 });
        console.log(`[ORG_GOTO] URL after click: ${this.page.url()}`);
        await this.page.waitForTimeout(2000);
        const urlAfterWait = this.page.url();
        const h5sNow = await this.page.locator('h5').allTextContents();
        const allHeadings = await this.page.locator('h1,h2,h3,h4,h5,h6').allTextContents();
        const mainContent = await this.page.locator('main').textContent().catch(() => 'no main');
        console.log(`[ORG_GOTO] URL=${urlAfterWait}, h5s=${JSON.stringify(h5sNow)}`);
        console.log(`[ORG_GOTO] All headings: ${JSON.stringify(allHeadings)}`);
        console.log(`[ORG_GOTO] Main content (first 200): ${mainContent?.substring(0, 200)}`);
      } else {
        console.log(`[ORG_GOTO] No sidebar btn found, using page.goto`);
        await this.page.goto('/organizations');
      }
      // Wait for organizations page content to appear
      await this.page.waitForSelector('h5:has-text("Organization Management"), h1:has-text("Organization Management")', { timeout: 15000 });
    }
  }

  async clickAddOrganization() {
    await this.addButton.click();
    await this.page.waitForSelector('.MuiDialog-root');
  }

  async fillOrganizationForm(data: any) {
    // MUI TextField components don't use name attributes - use label-based selectors
    await this.page.getByLabel('Organization Name').fill(data.name);
    
    // MUI Select via clicking and selecting option
    await this.page.getByLabel('Organization Type').click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 3000 });
    // Use data-value attribute for exact match to avoid strict mode violation
    const orgType = data.organizationType || 'CORPORATION';
    await this.page.locator(`[role="option"][data-value="${orgType}"]`).click();
    
    await this.page.getByLabel('Registration Number').fill(data.registrationNumber || 'REG-001');
    await this.page.getByLabel('Tax ID').fill(data.taxId || 'TAX-001');
    await this.page.getByLabel('Email').fill(data.email || 'test@org.com');
    await this.page.getByLabel('Phone Number').fill(data.phoneNumber || '1234567890');
    
    if (data.website) {
      await this.page.getByLabel('Website').fill(data.website);
    }
  }

  async saveOrganization() {
    // Wait for save button to be enabled (form validation might take a moment)
    await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.saveButton.waitFor({ state: 'attached', timeout: 5000 });
    // Poll until enabled
    await this.page.waitForFunction(
      () => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        return btn && !btn.disabled;
      },
      { timeout: 5000 }
    );
    await this.saveButton.click();
    await this.page.waitForSelector('.MuiDialog-root', { state: 'hidden', timeout: 10000 });
  }

  async searchOrganization(name: string) {
    await this.searchBar.fill(name);
    await this.page.waitForTimeout(1000); // Debounce
  }

  async editOrganization(organizationName: string) {
    const row = this.page.locator(`tr:has-text("${organizationName}")`);
    await row.locator('button[aria-label*="Edit"]').click();
    await this.page.waitForSelector('.MuiDialog-root');
  }

  async deleteOrganization(organizationName: string) {
    const row = this.page.locator(`tr:has-text("${organizationName}")`);
    await row.locator('button[aria-label*="Delete"]').click();
    await this.page.waitForSelector('.MuiDialog-root');
    await this.page.locator('button:has-text("Delete")').click();
  }

  async getRowCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }

  async applyFilters(filters: Record<string, string>) {
    await this.filterButton.click();
    
    for (const [key, value] of Object.entries(filters)) {
      const input = this.page.locator(`[name="${key}"]`);
      if (await input.count() > 0) {
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'select') {
          await input.selectOption(value);
        } else {
          await input.fill(value);
        }
      }
    }
    
    await this.page.locator('button:has-text("Apply Filters")').click();
  }
}
