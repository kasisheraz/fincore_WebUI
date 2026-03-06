import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Users Page
 */
export class UsersPage {
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
    this.pageTitle = page.locator('h5:has-text("User Management")');
    this.addButton = page.locator('button:has-text("Add User")');
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
    if (!currentUrl.includes('/users')) {
      // Use sidebar navigation (React Router) instead of hard page reload
      // to preserve authentication state
      const sidebarUsersBtn = this.page.locator('button:has-text("Users")');
      if (await sidebarUsersBtn.count() > 0) {
        await sidebarUsersBtn.click();
      } else {
        await this.page.goto('/users');
      }
      // Wait for users page content to appear
      await this.page.waitForSelector('h5:has-text("User Management"), h1:has-text("User Management")', { timeout: 15000 });
    }
  }

  async clickAddUser() {
    await this.addButton.click();
    await this.page.waitForSelector('.MuiDialog-root', { state: 'visible' });
    // Wait for form to be fully rendered
    await this.page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 3000 });
  }

  async fillUserForm(data: any) {
    // Wait for dialog content to be ready
    await this.page.waitForSelector('.MuiDialogContent-root', { state: 'visible' });
    
    // Use label-based selectors for MUI compatibility
    await this.page.getByLabel('First Name').fill(data.firstName);
    await this.page.getByLabel('Last Name').fill(data.lastName);
    await this.page.getByLabel('Email').fill(data.email);
    await this.page.getByLabel('Phone Number').fill(data.phoneNumber);
    
    // Date field - MUI date inputs can be tricky, find by attributes
    // The date input is required and has InputLabelProps with shrink
    const dateInput = this.page.locator('input[type="date"][required]').first();
    await dateInput.click(); // Click to focus
    await dateInput.fill(data.dateOfBirth);
    
    // Gender dropdown
    await this.page.getByLabel('Gender').click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 3000 });
    // Use data-value attribute for exact match
    await this.page.locator(`[role="option"][data-value="${data.gender}"]`).click();

    // Note: UserForm component doesn't have address fields
    // Address is managed separately in the user management system
  }

  async saveUser() {
    // Wait for save button to be enabled (form validation might take a moment)
    await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
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

  async searchUser(name: string) {
    await this.searchBar.fill(name);
    await this.page.waitForTimeout(1000); // Debounce
  }

  async editUser(userName: string) {
    const row = this.page.locator(`tr:has-text("${userName}")`);
    await row.locator('button[aria-label*="Edit"]').click();
    await this.page.waitForSelector('.MuiDialog-root');
  }

  async deleteUser(userName: string) {
    const row = this.page.locator(`tr:has-text("${userName}")`);
    await row.locator('button[aria-label*="Delete"]').click();
    await this.page.waitForSelector('.MuiDialog-root');
    await this.page.locator('button:has-text("Delete")').click();
  }

  async getRowCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }

  async getUserStatus(userName: string): Promise<string> {
    const row = this.page.locator(`tr:has-text("${userName}")`);
    const statusChip = row.locator('.MuiChip-root');
    return await statusChip.textContent() || '';
  }
}
