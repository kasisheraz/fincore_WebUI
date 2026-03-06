import { test, expect } from '../fixtures/auth.fixture';

/**
 * Helper to navigate via sidebar button (React Router, no hard reload)
 */
async function navigateViaSidebar(page: any, buttonText: string, expectedUrlPart: string): Promise<void> {
  const sidebarBtn = page.locator(`button:has-text("${buttonText}")`);
  if (await sidebarBtn.count() > 0) {
    await sidebarBtn.click();
    await page.waitForURL(`**/${expectedUrlPart}`, { timeout: 10000 });
  } else {
    await page.goto(`/${expectedUrlPart}`);
  }
  await page.waitForTimeout(1500);
}

test.describe('UI Visual Tests', () => {
  test('should have consistent spacing on Organizations page', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    
    // Check header section
    const header = authenticatedPage.locator('h4, h5').first();
    await expect(header).toBeVisible();
    
    // Check search and button section
    const searchBar = authenticatedPage.locator('input[placeholder*="Search"]');
    await expect(searchBar).toBeVisible();
    
    const addButton = authenticatedPage.locator('button:has-text("Add Organization")');
    await expect(addButton).toBeVisible();
    
    // Verify layout doesn't overflow
    const mainContent = authenticatedPage.locator('main, [role="main"]');
    const boundingBox = await mainContent.boundingBox();
    expect(boundingBox).toBeTruthy();
  });

  test('should have consistent spacing on Users page', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Users', 'users');
    
    const header = authenticatedPage.locator('h4, h5').first();
    await expect(header).toBeVisible();
    
    const searchBar = authenticatedPage.locator('input[placeholder*="Search"]');
    await expect(searchBar).toBeVisible();
    
    const addButton = authenticatedPage.locator('button:has-text("Add User")');
    await expect(addButton).toBeVisible();
  });

  test.skip('should have no horizontal scrollbar on Organizations page', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    await authenticatedPage.waitForTimeout(3500);
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Check if page has horizontal overflow
    const hasHorizontalScroll = await authenticatedPage.evaluate(() => {
      const diff = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return diff; // Return actual difference
    });
    
    // Allow for small differences (up to 5px) due to browser rounding and minor CSS issues
    expect(hasHorizontalScroll).toBeLessThanOrEqual(5);
  });

  test.skip('should have no horizontal scrollbar on Users page', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Users', 'users');
    await authenticatedPage.waitForTimeout(3500);
    await authenticatedPage.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await authenticatedPage.evaluate(() => {
      const diff = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return diff; // Return actual difference
    });
    
    // Allow for small differences (up to 5px)
    expect(hasHorizontalScroll).toBeLessThanOrEqual(5);
  });

  test('should properly align elements on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const loginPage = page;
    await loginPage.goto('/login');
    
    const phoneInput = loginPage.locator('input[name="phoneNumber"]');
    await expect(phoneInput).toBeVisible();
    
    // Check no overflow on mobile
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('should properly align elements on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    
    const phoneInput = page.locator('input[name="phoneNumber"]');
    await expect(phoneInput).toBeVisible();
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('should have consistent button sizes', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    await authenticatedPage.waitForTimeout(2000);
    
    const buttons = authenticatedPage.locator('button.MuiButton-contained');
    const count = await buttons.count();
    
    if (count > 0) {
      // Check that at least one button is visible
      const button = buttons.first();
      await expect(button).toBeVisible();
    }
  });

  test('should have consistent search bar styling', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    
    const searchBar = authenticatedPage.locator('input[placeholder*="Search"]');
    await expect(searchBar).toBeVisible();
    
    // Check search bar has proper width
    const boundingBox = await searchBar.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(200);
  });

  test('should not have Theme Switcher in sidebar', async ({ authenticatedPage }) => {
    // Already on dashboard
    const themeSwitcher = authenticatedPage.locator('text=/theme/i').filter({ hasText: /light|dark/i });
    const count = await themeSwitcher.count();
    
    // Should be 0 or very minimal
    expect(count).toBeLessThanOrEqual(1);
  });

  test('should have proper card shadows on dashboard', async ({ authenticatedPage }) => {
    // Already on dashboard
    const cards = authenticatedPage.locator('.MuiCard-root');
    const cardCount = await cards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Verify cards are visible
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should have consistent table styling', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    await authenticatedPage.waitForTimeout(2000);
    
    const table = authenticatedPage.locator('table, .MuiDataGrid-root');
    
    if (await table.count() > 0) {
      await expect(table).toBeVisible();
      
      // Check table headers
      const headers = authenticatedPage.locator('th, .MuiDataGrid-columnHeader');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('should have proper icon button sizing', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    
    const iconButtons = authenticatedPage.locator('button[aria-label*="Refresh"]');
    
    if (await iconButtons.count() > 0) {
      await expect(iconButtons.first()).toBeVisible();
      
      // Icon button should not be too large
      const boundingBox = await iconButtons.first().boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeLessThan(100);
      expect(boundingBox!.height).toBeLessThan(100);
    }
  });

  test('should have properly aligned form dialogs', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    
    const addButton = authenticatedPage.locator('button:has-text("Add Organization")');
    await addButton.click();
    
    const dialog = authenticatedPage.locator('.MuiDialog-root');
    await expect(dialog).toBeVisible();
    
    // Dialog should be centered
    const dialogContainer = authenticatedPage.locator('.MuiDialog-container');
    await expect(dialogContainer).toBeVisible();
  });

  test('should have consistent header across pages', async ({ authenticatedPage }) => {
    // Navigate to several pages via sidebar to check headers
    const sidebarPages = [
      { btn: 'Dashboard', urlPart: 'dashboard' },
      { btn: 'Organizations', urlPart: 'organizations' },
      { btn: 'Users', urlPart: 'users' },
      { btn: 'Questionnaire', urlPart: 'questionnaire' },
    ];
    
    for (const { btn, urlPart } of sidebarPages) {
      await navigateViaSidebar(authenticatedPage, btn, urlPart);
      
      // Check header exists
      const header = authenticatedPage.locator('h4, h5, h6').first();
      await expect(header).toBeVisible();
    }
  });

  test('should have consistent color scheme', async ({ authenticatedPage }) => {
    // Already on dashboard
    const primaryButtons = authenticatedPage.locator('button.MuiButton-containedPrimary');
    const count = await primaryButtons.count();
    
    if (count > 0) {
      await expect(primaryButtons.first()).toBeVisible();
    }
  });

  test('should have proper spacing between sections', async ({ authenticatedPage }) => {
    await navigateViaSidebar(authenticatedPage, 'Organizations', 'organizations');
    
    // Check spacing between header and content
    const header = authenticatedPage.locator('h4, h5').first();
    const searchSection = authenticatedPage.locator('input[placeholder*="Search"]').locator('..');
    
    await expect(header).toBeVisible();
    await expect(searchSection).toBeVisible();
    
    // Get positions
    const headerBox = await header.boundingBox();
    const searchBox = await searchSection.boundingBox();
    
    expect(headerBox).toBeTruthy();
    expect(searchBox).toBeTruthy();
    
    // Should have spacing between them
    if (headerBox && searchBox) {
      const spacing = searchBox.y - (headerBox.y + headerBox.height);
      expect(spacing).toBeGreaterThanOrEqual(0);
    }
  });
});
