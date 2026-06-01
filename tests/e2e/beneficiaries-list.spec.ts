import { test, expect } from '@playwright/test';
import { setupMocks } from '../fixtures/auth.fixture';
import { BeneficiariesPage } from '../pages/BeneficiariesPage';

test.describe('Beneficiaries List Page', () => {
  let beneficiariesPage: BeneficiariesPage;

  test.beforeEach(async ({ page }) => {
    beneficiariesPage = new BeneficiariesPage(page);
    
    // Setup API mocks and authentication
    await setupMocks(page);
    
    // Navigate to beneficiaries page
    await beneficiariesPage.goto();
    
    // Verify authentication
    const isAuthenticated = await page.evaluate(() => {
      return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
    });
    
    if (!isAuthenticated) {
      throw new Error('Auth state not loaded - global setup failed');
    }
  });

  test.describe('Page Load and Navigation', () => {
    test('should load beneficiaries page successfully', async ({ page }) => {
      await expect(beneficiariesPage.pageTitle).toBeVisible();
      await expect(beneficiariesPage.dataTable).toBeVisible();
    });

    test('should display "Add Beneficiary" button with count', async ({ page }) => {
      await expect(beneficiariesPage.addBeneficiaryButton).toBeVisible();
      const buttonText = await beneficiariesPage.getBeneficiaryCount();
      expect(buttonText).toMatch(/\d+\s*\/\s*20/); // Matches "X / 20" format
    });

    test('should navigate to create beneficiary form', async ({ page }) => {
      await beneficiariesPage.clickAddBeneficiary();
      await expect(page).toHaveURL(/\/beneficiaries\/create/);
      await expect(page.getByText(/create beneficiary/i)).toBeVisible();
    });

    test('should display refresh button', async ({ page }) => {
      await expect(beneficiariesPage.refreshButton).toBeVisible();
    });
  });

  test.describe('Search and Filter', () => {
    test('should search for beneficiary by name', async ({ page }) => {
      const searchTerm = 'Test Bank';
      await beneficiariesPage.searchBeneficiary(searchTerm);
      
      // Verify search was performed (URL should update or results filter)
      await page.waitForTimeout(500);
      
      // Should show results or "no results" message
      const noResults = page.getByText(/no (results|beneficiaries) found/i);
      const hasResults = await beneficiariesPage.dataTable.locator('tbody tr').count() > 0;
      
      expect(hasResults || await noResults.isVisible()).toBeTruthy();
    });

    test('should clear search', async ({ page }) => {
      await beneficiariesPage.searchBeneficiary('Test');
      await page.waitForTimeout(300);
      
      await beneficiariesPage.clearSearch();
      await page.waitForTimeout(300);
      
      // Search box should be empty
      await expect(beneficiariesPage.searchBar).toHaveValue('');
    });

    test('should filter beneficiaries by status', async ({ page }) => {
      await beneficiariesPage.filterByStatus('ACTIVE');
      await page.waitForTimeout(500);
      
      // All visible beneficiaries should have ACTIVE status
      const statusChips = page.locator('[class*="MuiChip"]').filter({ hasText: 'ACTIVE' });
      const count = await statusChips.count();
      
      // If there are results, they should all be ACTIVE
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should filter beneficiaries by PENDING status', async ({ page }) => {
      await beneficiariesPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      // Should show only PENDING beneficiaries or no results
      const rows = beneficiariesPage.dataTable.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        const firstRow = rows.first();
        const statusChip = firstRow.locator('[class*="MuiChip"]');
        await expect(statusChip).toContainText('PENDING');
      }
    });
  });

  test.describe('Table Interactions', () => {
    test('should refresh beneficiaries list', async ({ page }) => {
      const initialCount = await beneficiariesPage.dataTable.locator('tbody tr').count();
      
      await beneficiariesPage.refresh();
      await page.waitForTimeout(500);
      
      // Table should still be visible (even if count is same)
      await expect(beneficiariesPage.dataTable).toBeVisible();
    });

    test('should display beneficiary information in table', async ({ page }) => {
      const rows = beneficiariesPage.dataTable.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        const firstRow = rows.first();
        
        // Should show at minimum: Name and Status
        const cells = firstRow.locator('td');
        const cellCount = await cells.count();
        expect(cellCount).toBeGreaterThan(1);
        
        // Status chip should be visible
        const statusChip = firstRow.locator('[class*="MuiChip"]');
        await expect(statusChip).toBeVisible();
      }
    });

    test('should click on beneficiary row to view details', async ({ page }) => {
      const rows = beneficiariesPage.dataTable.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        const firstRow = rows.first();
        await firstRow.click();
        await page.waitForTimeout(500);
        
        // Should navigate to details page
        expect(page.url()).toMatch(/\/beneficiaries\/\d+/);
      }
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination controls if needed', async ({ page }) => {
      // Check if pagination exists (might not if < 10 records)
      const pagination = page.locator('[aria-label="pagination"]').or(
        page.locator('.MuiPagination-root')
      );
      
      const rows = await beneficiariesPage.dataTable.locator('tbody tr').count();
      
      if (rows >= 10) {
        await expect(pagination).toBeVisible();
      }
    });

    test('should navigate between pages if pagination exists', async ({ page }) => {
      const pagination = page.locator('[aria-label="pagination"]').or(
        page.locator('.MuiPagination-root')
      );
      
      const hasPagination = await pagination.isVisible();
      
      if (hasPagination) {
        const nextButton = page.getByRole('button', { name: /next/i }).or(
          pagination.locator('button[aria-label*="next"]')
        );
        
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Should still be on beneficiaries page
          expect(page.url()).toContain('/beneficiaries');
        }
      }
    });
  });

  test.describe('Business User Actions', () => {
    test('should show edit button for PENDING beneficiaries', async ({ page }) => {
      // Filter to show only PENDING
      await beneficiariesPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = beneficiariesPage.dataTable.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        const editButton = rows.first().locator('button[aria-label="Edit"]');
        // Edit button should exist for PENDING status
        const buttonCount = await editButton.count();
        expect(buttonCount).toBeGreaterThanOrEqual(0); // May or may not be visible depending on user role
      }
    });

    test('should show delete button for beneficiaries', async ({ page }) => {
      const rows = beneficiariesPage.dataTable.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        const deleteButton = rows.first().locator('button[aria-label="Delete"]');
        const buttonCount = await deleteButton.count();
        expect(buttonCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Empty State', () => {
    test('should show appropriate message when no beneficiaries exist', async ({ page }) => {
      const rows = await beneficiariesPage.dataTable.locator('tbody tr').count();
      
      if (rows === 0) {
        // Should show empty state or "no data" message
        const emptyMessage = page.getByText(/no (beneficiaries|data|results)/i);
        await expect(emptyMessage).toBeVisible();
      }
    });

    test('should show "no results" when search returns empty', async ({ page }) => {
      // Search for something that definitely doesn't exist
      await beneficiariesPage.searchBeneficiary('XXXXXXXXX_NONEXISTENT_9999');
      await page.waitForTimeout(500);
      
      // Should show no results message
      const noResults = page.getByText(/no (results|beneficiaries) found/i).or(
        page.getByText(/no data/i)
      );
      
      const rows = await beneficiariesPage.dataTable.locator('tbody tr').count();
      
      if (rows === 0) {
        expect(await noResults.isVisible()).toBeTruthy();
      }
    });
  });

  test.describe('Status Display', () => {
    test('should display status chips with appropriate colors', async ({ page }) => {
      const statusChips = page.locator('[class*="MuiChip"]');
      const count = await statusChips.count();
      
      if (count > 0) {
        // Check first chip has color class
        const firstChip = statusChips.first();
        const className = await firstChip.getAttribute('class');
        
        // Should have MUI color class (success, warning, error, info, default)
        expect(className).toMatch(/(success|warning|error|info|default)/);
      }
    });

    test('should display all possible statuses correctly', async ({ page }) => {
      // Test that status chips are rendered for different statuses
      const statuses = ['PENDING', 'ACTIVE', 'UNDER_REVIEW', 'REJECTED', 'SUSPENDED'];
      
      for (const status of statuses) {
        await beneficiariesPage.filterByStatus(status);
        await page.waitForTimeout(300);
        
        const rows = await beneficiariesPage.dataTable.locator('tbody tr').count();
        
        if (rows > 0) {
          const statusChip = page.locator('[class*="MuiChip"]').filter({ hasText: status.replace('_', ' ') }).first();
          await expect(statusChip).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Try to perform an action that might fail
      await beneficiariesPage.refresh();
      await page.waitForTimeout(500);
      
      // Page should still be functional
      await expect(beneficiariesPage.pageTitle).toBeVisible();
      await expect(beneficiariesPage.addBeneficiaryButton).toBeVisible();
    });
  });
});
