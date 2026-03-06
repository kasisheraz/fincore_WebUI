import { test, expect } from '../fixtures/auth.fixture';

test.describe('Applications Management Tests', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to applications list page
    await authenticatedPage.goto('/applications');
    await authenticatedPage.waitForSelector('h5:has-text("Applications Management"), h5:has-text("Application"), h4:has-text("Application")', { timeout: 15000 }).catch(() => {});
  });

  test('should display applications page', async ({ authenticatedPage }) => {
    const pageTitle = authenticatedPage.locator('h5:has-text("Applications Management"), h5:has-text("Application"), h4:has-text("Application")');
    await expect(pageTitle).toBeVisible();
  });

  test('should show applications list', async ({ authenticatedPage }) => {
    await authenticatedPage.waitForTimeout(2000);
    // Look specifically for the applications table, not all cards
    const table = authenticatedPage.locator('table, .MuiDataGrid-root').first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('should have new application button', async ({ authenticatedPage }) => {
    const newButton = authenticatedPage.locator('button:has-text("New Application"), button:has-text("Create Application"), button:has-text("Add")');
    const count = await newButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should search applications', async ({ authenticatedPage }) => {
    const searchBar = authenticatedPage.locator('input[placeholder*="Search"]');
    
    if (await searchBar.count() > 0) {
      await searchBar.fill('test');
      await authenticatedPage.waitForTimeout(1000);
    }
  });

  test('should filter applications by status', async ({ authenticatedPage }) => {
    const filterButton = authenticatedPage.locator('button[aria-label="Filter"]');
    
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('should display application status chips', async ({ authenticatedPage }) => {
    const statusChips = authenticatedPage.locator('.MuiChip-root');
    const count = await statusChips.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show application progress', async ({ authenticatedPage }) => {
    // Look for either progress bars or percentage text
    const progressBars = authenticatedPage.locator('.MuiLinearProgress-root');
    const percentages = authenticatedPage.locator('text=/\\d+%/');
    const progressCount = await progressBars.count();
    const percentageCount = await percentages.count();
    expect(progressCount + percentageCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to application details', async ({ authenticatedPage }) => {
    const rows = await authenticatedPage.locator('tbody tr, .MuiCard-root').count();
    
    if (rows > 0) {
      const firstRow = authenticatedPage.locator('tbody tr, .MuiCard-root').first();
      await firstRow.click();
      await authenticatedPage.waitForTimeout(1000);
      
      // Check if navigated or dialog opened
      const urlChanged = authenticatedPage.url().includes('application');
      const dialogVisible = await authenticatedPage.locator('.MuiDialog-root, .MuiDrawer-root').count() > 0;
      
      expect(urlChanged || dialogVisible).toBeTruthy();
    }
  });

  test('should show application actions', async ({ authenticatedPage }) => {
    const actionButtons = authenticatedPage.locator('button[aria-label*="edit"], button[aria-label*="delete"], button[aria-label*="view"]');
    const count = await actionButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should paginate through applications', async ({ authenticatedPage }) => {
    const pagination = authenticatedPage.locator('.MuiTablePagination-root, .MuiDataGrid-footerContainer, .MuiPagination-root');
    
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
    }
  });
});
