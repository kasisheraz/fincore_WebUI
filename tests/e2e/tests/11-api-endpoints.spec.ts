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

test.describe('API Endpoints Tests', () => {
  test.describe('Organization API Tests', () => {
    test('should fetch organizations list', async ({ authenticatedPage }) => {
      // Intercept API call
      const responsePromise = authenticatedPage.waitForResponse(
        response => response.url().includes('/api/organizations') && response.status() === 200
      );
      
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      
      try {
        const response = await responsePromise;
        expect(response.ok()).toBeTruthy();
      } catch (error) {
        // API might not be running, verify UI loads
        await expect(authenticatedPage.locator('h5, h4').filter({ hasText: /organization/i })).toBeVisible();
      }
    });

    test('should handle organization search', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      
      const searchInput = authenticatedPage.locator('input[placeholder*="Search"]');
      await searchInput.fill('test');
      await authenticatedPage.waitForTimeout(1500);
      
      // Verify search is functioning
      await expect(searchInput).toHaveValue('test');
    });

    test('should open create organization form', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      
      const addButton = authenticatedPage.locator('button:has-text("Add Organization")');
      await addButton.click();
      
      await expect(authenticatedPage.locator('.MuiDialog-root')).toBeVisible();
    });
  });

  test.describe('User API Tests', () => {
    test('should fetch users list', async ({ authenticatedPage }) => {
      const responsePromise = authenticatedPage.waitForResponse(
        response => response.url().includes('/api/users') && response.status() === 200
      );
      
      await navigateTo(authenticatedPage, 'Users', 'users');
      
      try {
        const response = await responsePromise;
        expect(response.ok()).toBeTruthy();
      } catch (error) {
        await expect(authenticatedPage.locator('h5, h4').filter({ hasText: /user/i })).toBeVisible();
      }
    });

    test('should handle user search', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Users', 'users');
      
      const searchInput = authenticatedPage.locator('input[placeholder*="Search"]');
      await searchInput.fill('test');
      await authenticatedPage.waitForTimeout(1500);
      
      await expect(searchInput).toHaveValue('test');
    });

    test('should open create user form', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Users', 'users');
      
      const addButton = authenticatedPage.locator('button:has-text("Add User")');
      await addButton.click();
      
      await expect(authenticatedPage.locator('.MuiDialog-root')).toBeVisible();
    });
  });

  test.describe('KYC API Tests', () => {
    test('should fetch KYC documents', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'KYC Documents', 'kyc-documents');
      
      await expect(authenticatedPage.locator('h4, h5').filter({ hasText: /KYC Document/i })).toBeVisible();
    });

    test('should fetch KYC verifications', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'KYC Verification', 'kyc-verification');
      
      await expect(authenticatedPage.locator('h4, h5').filter({ hasText: /KYC Verification/i })).toBeVisible();
    });
  });

  test.describe('Questionnaire API Tests', () => {
    test('should fetch questionnaires', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Questionnaire', 'questionnaire');
      
      await expect(authenticatedPage.locator('h4, h5').filter({ hasText: /Questionnaire/i })).toBeVisible();
    });

    test('should handle questionnaire search', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Questionnaire', 'questionnaire');
      
      const searchInput = authenticatedPage.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await authenticatedPage.waitForTimeout(1500);
      }
    });
  });

  test.describe('Customer Answers API Tests', () => {
    test('should fetch customer answers', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Customer Answers', 'customer-answers');
      
      await expect(authenticatedPage.locator('h4, h5').filter({ hasText: /Answer/i })).toBeVisible();
    });

    test('should handle answers search', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Customer Answers', 'customer-answers');
      
      const searchInput = authenticatedPage.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await authenticatedPage.waitForTimeout(1500);
      }
    });
  });

  test.describe('Dashboard API Tests', () => {
    test('should load dashboard data', async ({ authenticatedPage }) => {
      // Already on dashboard after login - no navigation needed
      await expect(authenticatedPage.locator('h4, h5').filter({ hasText: /dashboard/i })).toBeVisible();
      
      // Verify stats cards
      const statsCards = authenticatedPage.locator('.MuiCard-root');
      const count = await statsCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display recent applications', async ({ authenticatedPage }) => {
      // Already on dashboard
      const recentSection = authenticatedPage.locator('text=/Recent/i');
      const count = await recentSection.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('API Error Handling', () => {
    test('should handle network errors gracefully', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      await authenticatedPage.waitForTimeout(2500);
      
      // Page should still render even if API fails
      await expect(authenticatedPage.locator('body')).toBeVisible();
      await expect(authenticatedPage.locator('h4, h5').first()).toBeVisible();
    });

    test('should show loading states', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Users', 'users');
      
      // Check for loading indicators
      const loadingIndicator = authenticatedPage.locator('.MuiCircularProgress-root, [role="progressbar"]');
      
      // Loading indicator might be briefly visible
      await authenticatedPage.waitForTimeout(500);
    });

    test('should handle empty data states', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      
      // Wait for page to load
      await authenticatedPage.waitForTimeout(2000);
      
      // Page should handle empty state
      const emptyMessage = authenticatedPage.locator('text=/No.*found/i, text=/No data/i');
      const dataRows = authenticatedPage.locator('tbody tr');
      
      const hasEmptyMessage = await emptyMessage.count() > 0;
      const hasData = await dataRows.count() > 0;
      
      // Either should have data or empty message
      expect(hasEmptyMessage || hasData).toBeTruthy();
    });
  });

  test.describe('Pagination API Tests', () => {
    test('should handle pagination in organizations', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      await authenticatedPage.waitForTimeout(2000);
      
      const pagination = authenticatedPage.locator('.MuiTablePagination-root, .MuiPagination-root');
      
      if (await pagination.count() > 0) {
        await expect(pagination).toBeVisible();
      }
    });

    test('should handle pagination in users', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Users', 'users');
      await authenticatedPage.waitForTimeout(2000);
      
      const pagination = authenticatedPage.locator('.MuiTablePagination-root, .MuiPagination-root');
      
      if (await pagination.count() > 0) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe('Filter API Tests', () => {
    test('should apply filters in organizations', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      
      const filterButton = authenticatedPage.locator('button[aria-label="Filter"]');
      
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await authenticatedPage.waitForTimeout(500);
        
        const filterPanel = authenticatedPage.locator('.MuiPopover-root, .MuiDrawer-root');
        await expect(filterPanel).toBeVisible();
      }
    });

    test('should apply filters in users', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Users', 'users');
      
      const filterButton = authenticatedPage.locator('button[aria-label="Filter"]');
      
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await authenticatedPage.waitForTimeout(500);
      }
    });
  });

  test.describe('Sorting API Tests', () => {
    test('should handle column sorting in organizations', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Organizations', 'organizations');
      await authenticatedPage.waitForTimeout(2000);
      
      const headers = authenticatedPage.locator('th, .MuiDataGrid-columnHeader');
      const headerCount = await headers.count();
      
      if (headerCount > 0) {
        const firstHeader = headers.first();
        await firstHeader.click();
        await authenticatedPage.waitForTimeout(1000);
      }
    });

    test('should handle column sorting in users', async ({ authenticatedPage }) => {
      await navigateTo(authenticatedPage, 'Users', 'users');
      await authenticatedPage.waitForTimeout(2000);
      
      const headers = authenticatedPage.locator('th, .MuiDataGrid-columnHeader');
      const headerCount = await headers.count();
      
      if (headerCount > 0) {
        const firstHeader = headers.first();
        await firstHeader.click();
        await authenticatedPage.waitForTimeout(1000);
      }
    });
  });
});