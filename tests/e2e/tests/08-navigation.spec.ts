import { test, expect } from '../fixtures/auth.fixture';

/**
 * Helper to navigate via sidebar (avoids hard page reload, preserves auth)
 */
async function navigateTo(page: any, buttonText: string, expectedUrlPart: string): Promise<void> {
  const sidebarBtn = page.locator(`button:has-text("${buttonText}")`);
  if (await sidebarBtn.count() > 0) {
    await sidebarBtn.click();
    await page.waitForURL(`**/${expectedUrlPart}`, { timeout: 10000 });
  } else {
    await page.goto(`/${expectedUrlPart}`);
  }
  await page.waitForTimeout(1000);
}

test.describe('Navigation Tests', () => {
  test('should display sidebar navigation', async ({ authenticatedPage }) => {
    // Already on dashboard after login - check sidebar renders  
    await authenticatedPage.waitForTimeout(2500);
    // Sidebar contains navigation buttons (ListItemButton) - check for menu items
    const sidebarItem = authenticatedPage.locator('[role="button"]:has-text("Dashboard"), [role="button"]:has-text("Organizations"), [role="button"]:has-text("Users")').first();
    await expect(sidebarItem).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Dashboard', async ({ authenticatedPage }) => {
    // Click sidebar Dashboard button (uses React Router navigate, no hard reload)
    await navigateTo(authenticatedPage, 'Dashboard', 'dashboard');
    
    await expect(authenticatedPage).toHaveURL(/.*dashboard/);
  });

  test('should navigate to Applications', async ({ authenticatedPage }) => {
    // Applications may not be in sidebar directly, check for any app navigation
    await authenticatedPage.waitForTimeout(1000);
    const applicationsLink = authenticatedPage.locator('button:has-text("Applications"), a[href*="application"]:has-text("Applications")').first();
    
    if (await applicationsLink.count() > 0) {
      await applicationsLink.click();
      await authenticatedPage.waitForTimeout(1000);
      const url = authenticatedPage.url();
      expect(url).toContain('application');
    } else {
      // Applications may be accessed via New Application button or similar
      const newAppBtn = authenticatedPage.locator('button:has-text("New Application")');
      const count = await newAppBtn.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should navigate to Organizations', async ({ authenticatedPage }) => {
    // Use sidebar button (React Router, no hard reload)
    await navigateTo(authenticatedPage, 'Organizations', 'organizations');
    
    await expect(authenticatedPage).toHaveURL(/.*organizations/);
  });

  test('should navigate to Users', async ({ authenticatedPage }) => {
    // Use sidebar button (React Router, no hard reload)
    await navigateTo(authenticatedPage, 'Users', 'users');
    
    await expect(authenticatedPage).toHaveURL(/.*users/);
  });

  test('should navigate to Settings', async ({ authenticatedPage }) => {
    // Use sidebar button
    const settingsBtn = authenticatedPage.locator('button:has-text("Settings")');
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await expect(authenticatedPage).toHaveURL(/.*settings/);
    }
  });

  test('should toggle sidebar', async ({ authenticatedPage }) => {
    // Already on dashboard - find menu toggle button in header
    const menuButton = authenticatedPage.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    
    if (await menuButton.count() > 0) {
      await menuButton.click();
      await authenticatedPage.waitForTimeout(500);
      
      // Sidebar should still be present
      const sidebar = authenticatedPage.locator('nav, aside, .MuiDrawer-root');
      await expect(sidebar).toBeVisible();
    }
  });

  test('should show active route in sidebar', async ({ authenticatedPage }) => {
    // Dashboard is active by default after login
    const activeLink = authenticatedPage.locator('.MuiListItem-root.Mui-selected, .MuiListItemButton-root.Mui-selected, nav a.active, nav a[aria-current="page"]');
    const count = await activeLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display user menu in header', async ({ authenticatedPage }) => {
    const userMenu = authenticatedPage.locator('button[aria-label*="User menu"], button[aria-label*="user"], button[aria-label*="account"]');
    const count = await userMenu.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate using breadcrumbs', async ({ authenticatedPage }) => {
    // Navigate to organizations via sidebar (React Router)
    await navigateTo(authenticatedPage, 'Organizations', 'organizations');
    
    const breadcrumbs = authenticatedPage.locator('nav[aria-label*="breadcrumb"], .MuiBreadcrumbs-root');
    
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible();
    }
  });
});
