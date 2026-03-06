import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly statsCards: Locator;
  readonly recentApplicationsTable: Locator;
  readonly recentOrganizationsTable: Locator;
  readonly newApplicationButton: Locator;
  readonly viewAllApplicationsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h5:has-text("FINCORE Dashboard")');
    this.statsCards = page.locator('.MuiCard-root').filter({ hasText: /Total|Pending|Approved|Success Rate/ });
    this.recentApplicationsTable = page.locator('text=Recent Applications').locator('..');
    this.recentOrganizationsTable = page.locator('text=Recent Organizations').locator('..');
    this.newApplicationButton = page.locator('button:has-text("New Application")').first();
    this.viewAllApplicationsButton = page.locator('button:has-text("View All Applications")');
  }

  async goto() {
    // Only navigate if we're not already on dashboard
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/dashboard')) {
      // Use sidebar navigation (React Router) instead of hard page reload
      const sidebarDashboardBtn = this.page.locator('button:has-text("Dashboard")');
      if (await sidebarDashboardBtn.count() > 0) {
        await sidebarDashboardBtn.click();
      } else {
        await this.page.goto('/dashboard');
      }
      // Wait for dashboard content to load
      await this.page.waitForSelector('h5:has-text("FINCORE Dashboard")', { timeout: 15000 }).catch(() => {});
    }
  }

  async getStatCardValue(title: string): Promise<string> {
    const card = this.page.locator(`.MuiCard-root:has-text("${title}")`);
    const value = await card.locator('.MuiTypography-h4').textContent();
    return value || '';
  }

  async clickNewApplication() {
    await this.newApplicationButton.click();
  }

  async clickViewAllApplications() {
    await this.viewAllApplicationsButton.click();
  }
}
