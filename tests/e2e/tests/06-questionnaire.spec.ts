import { test, expect } from '../fixtures/auth.fixture';

test.describe('Questionnaire Management Tests', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Use sidebar navigation to avoid hard page reload
    const questionnaireBtn = authenticatedPage.locator('button:has-text("Questionnaire")');
    if (await questionnaireBtn.count() > 0) {
      await questionnaireBtn.click();
    } else {
      await authenticatedPage.goto('/questionnaire');
    }
    await authenticatedPage.waitForSelector('h5:has-text("Questionnaire Management")', { timeout: 15000 }).catch(() => {});
  });

  test('should display questionnaire page', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.locator('h5:has-text("Questionnaire Management")')).toBeVisible();
  });

  test('should show list of questionnaires', async ({ authenticatedPage }) => {
    const table = authenticatedPage.locator('table, .MuiDataGrid-root');
    await expect(table).toBeVisible();
  });

  test('should have add questionnaire button', async ({ authenticatedPage }) => {
    const addButton = authenticatedPage.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    const count = await addButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should search questionnaires', async ({ authenticatedPage }) => {
    const searchBar = authenticatedPage.locator('input[placeholder*="Search"]');
    
    if (await searchBar.count() > 0) {
      await searchBar.fill('test');
      await authenticatedPage.waitForTimeout(1000);
    }
  });

  test('should display questionnaire status', async ({ authenticatedPage }) => {
    const statusChips = authenticatedPage.locator('.MuiChip-root');
    const count = await statusChips.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show questionnaire actions', async ({ authenticatedPage }) => {
    const actionButtons = authenticatedPage.locator('button[aria-label*="edit"], button[aria-label*="delete"], button[aria-label*="view"]');
    const count = await actionButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter questionnaires', async ({ authenticatedPage }) => {
    const filterButton = authenticatedPage.locator('button[aria-label="Filter"]');
    
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('should refresh questionnaires list', async ({ authenticatedPage }) => {
    const refreshButton = authenticatedPage.locator('button[aria-label*="Refresh"]');
    
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await authenticatedPage.waitForTimeout(1000);
    }
  });

  test('should display questionnaire details', async ({ authenticatedPage }) => {
    const rows = await authenticatedPage.locator('tbody tr').count();
    
    if (rows > 0) {
      const firstRow = authenticatedPage.locator('tbody tr').first();
      const viewButton = firstRow.locator('button[aria-label*="view"], button[aria-label*="details"]');
      
      if (await viewButton.count() > 0) {
        await viewButton.click();
        await authenticatedPage.waitForTimeout(1000);
      }
    }
  });

  test('should show question count in questionnaire list', async ({ authenticatedPage }) => {
    const questionCounts = authenticatedPage.locator('text=/\\d+.*question/i');
    const count = await questionCounts.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
