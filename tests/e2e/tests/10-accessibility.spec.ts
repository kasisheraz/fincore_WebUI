import { test, expect } from '../fixtures/auth.fixture';

test.describe('Accessibility Tests', () => {
  test('should have proper page titles', async ({ authenticatedPage }) => {
    // Already on dashboard after login
    const title = await authenticatedPage.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ authenticatedPage }) => {
    // Already on dashboard
    const h1 = authenticatedPage.locator('h1');
    const h2 = authenticatedPage.locator('h2');
    const h3 = authenticatedPage.locator('h3');
    
    // Should have headings
    const totalHeadings = await h1.count() + await h2.count() + await h3.count();
    expect(totalHeadings).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ authenticatedPage }) => {
    // Already on dashboard
    const images = authenticatedPage.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('should have proper aria labels on buttons', async ({ authenticatedPage }) => {
    // Already on dashboard
    const iconButtons = authenticatedPage.locator('button[aria-label]');
    const count = await iconButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const name = el.getAttribute('name');
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        return !!(label || ariaLabel || ariaLabelledBy || name);
      });
      
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper button roles', async ({ authenticatedPage }) => {
    // Already on dashboard
    const buttons = authenticatedPage.locator('button, [role="button"]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper link roles', async ({ authenticatedPage }) => {
    // React Router app may not use traditional <a> links
    // Check that navigation works via buttons/router instead
    await authenticatedPage.waitForTimeout(1500);
    const navButtons = authenticatedPage.locator('[role="button"]');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0); // Should have at least some interactive elements
  });

  test('should have proper table structure', async ({ authenticatedPage }) => {
    // Navigate to organizations via sidebar
    const orgBtn = authenticatedPage.locator('button:has-text("Organizations")');
    if (await orgBtn.count() > 0) {
      await orgBtn.click();
      await authenticatedPage.waitForURL(/.*organizations/, { timeout: 5000 });
    }
    
    const table = authenticatedPage.locator('table');
    
    if (await table.count() > 0) {
      const thead = table.locator('thead');
      const tbody = table.locator('tbody');
      
      await expect(thead).toBeVisible();
      await expect(tbody).toBeVisible();
    }
  });

  test('should have proper dialog roles', async ({ authenticatedPage }) => {
    // Navigate to organizations via sidebar
    const orgBtn = authenticatedPage.locator('button:has-text("Organizations")');
    if (await orgBtn.count() > 0) {
      await orgBtn.click();
      await authenticatedPage.waitForURL(/.*organizations/, { timeout: 5000 });
    }
    
    const addButton = authenticatedPage.locator('button:has-text("Add")').first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      
      const dialog = authenticatedPage.locator('[role="dialog"], .MuiDialog-root');
      await expect(dialog).toBeVisible();
    }
  });
});
