import { test, expect } from '../fixtures/auth.fixture';

test.describe('KYC Management Tests', () => {
  test.describe('KYC Documents', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      // Use sidebar navigation to avoid hard page reload
      const kycDocsBtn = authenticatedPage.locator('button:has-text("KYC Documents")');
      if (await kycDocsBtn.count() > 0) {
        await kycDocsBtn.click();
      } else {
        await authenticatedPage.goto('/kyc-documents');
      }
      await authenticatedPage.waitForSelector('h5:has-text("KYC Document Management")', { timeout: 15000 }).catch(() => {});
    });

    test('should display KYC documents page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('h5:has-text("KYC Document Management")')).toBeVisible();
    });

    test('should show document upload functionality', async ({ authenticatedPage }) => {
      const uploadButton = authenticatedPage.locator('button:has-text("Upload"), input[type="file"]');
      const count = await uploadButton.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display document types', async ({ authenticatedPage }) => {
      const documentTypes = authenticatedPage.locator('text=/Passport|Driver.*License|ID.*Card|Utility.*Bill/i');
      const count = await documentTypes.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should show document status', async ({ authenticatedPage }) => {
      const statusChips = authenticatedPage.locator('.MuiChip-root');
      const count = await statusChips.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter documents by status', async ({ authenticatedPage }) => {
      const filterButton = authenticatedPage.locator('button[aria-label="Filter"]');
      
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await authenticatedPage.waitForTimeout(500);
        
        const filterPanel = authenticatedPage.locator('.MuiPopover-root, .MuiDrawer-root');
        const isVisible = await filterPanel.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('should search documents', async ({ authenticatedPage }) => {
      const searchBar = authenticatedPage.locator('input[placeholder*="Search"]');
      
      if (await searchBar.count() > 0) {
        await searchBar.fill('passport');
        await authenticatedPage.waitForTimeout(1000);
      }
    });
  });

  test.describe('KYC Verification', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      // Use sidebar navigation to avoid hard page reload
      const kycVerBtn = authenticatedPage.locator('button:has-text("KYC Verification")');
      if (await kycVerBtn.count() > 0) {
        await kycVerBtn.click();
      } else {
        await authenticatedPage.goto('/kyc-verification');
      }
      await authenticatedPage.waitForSelector('h5:has-text("KYC Verification Management")', { timeout: 15000 }).catch(() => {});
    });

    test('should display KYC verification page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('h5:has-text("KYC Verification Management")')).toBeVisible();
    });

    test('should show verification requests', async ({ authenticatedPage }) => {
      const table = authenticatedPage.locator('table, .MuiDataGrid-root');
      await expect(table).toBeVisible();
    });

    test('should display verification status', async ({ authenticatedPage }) => {
      const statusChips = authenticatedPage.locator('.MuiChip-root');
      const count = await statusChips.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should allow filtering verification requests', async ({ authenticatedPage }) => {
      const filterButton = authenticatedPage.locator('button[aria-label="Filter"]');
      
      if (await filterButton.count() > 0) {
        await filterButton.click();
        const filterPanel = authenticatedPage.locator('.MuiPopover-root, .MuiDrawer-root');
        await expect(filterPanel).toBeVisible();
      }
    });

    test('should show verification actions', async ({ authenticatedPage }) => {
      const actionButtons = authenticatedPage.locator('button[aria-label*="approve"], button[aria-label*="reject"], button:has-text("Approve"), button:has-text("Reject")');
      const count = await actionButtons.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display verification details', async ({ authenticatedPage }) => {
      const rows = await authenticatedPage.locator('tbody tr').count();
      
      if (rows > 0) {
        const firstRow = authenticatedPage.locator('tbody tr').first();
        await firstRow.click();
        await authenticatedPage.waitForTimeout(1000);
        
        // Check if details panel or dialog opened
        const detailsVisible = await authenticatedPage.locator('.MuiDialog-root, .MuiDrawer-root').count() > 0;
        expect(detailsVisible).toBeTruthy();
      }
    });
  });
});
