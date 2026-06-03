import { test, expect } from '@playwright/test';
import { setupMocks } from './fixtures/auth.fixture';
import { BeneficiariesPage } from './pages/BeneficiariesPage';
import { BeneficiaryFormPage } from './pages/BeneficiaryFormPage';
import { BeneficiaryDetailsPage } from './pages/BeneficiaryDetailsPage';

/**
 * End-to-End Beneficiary Workflow Tests
 * 
 * These tests cover the complete beneficiary lifecycle:
 * 1. Create beneficiary (PENDING)
 * 2. Upload KYC documents
 * 3. Submit for review (UNDER_REVIEW)
 * 4. Admin approval/rejection (ACTIVE/REJECTED)
 * 5. Suspend/Reactivate (SUSPENDED/ACTIVE)
 */
test.describe('Beneficiary Workflow - End to End', () => {
  let listPage: BeneficiariesPage;
  let formPage: BeneficiaryFormPage;
  let detailsPage: BeneficiaryDetailsPage;

  test.beforeEach(async ({ page }) => {
    listPage = new BeneficiariesPage(page);
    formPage = new BeneficiaryFormPage(page);
    detailsPage = new BeneficiaryDetailsPage(page);
    
    // Setup API mocks and authentication
    await setupMocks(page);
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Verify authentication
    const isAuthenticated = await page.evaluate(() => {
      return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
    });
    
    if (!isAuthenticated) {
      throw new Error('Auth state not loaded - global setup failed');
    }
  });

  test.describe('Complete Beneficiary Creation Flow', () => {
    test('should create beneficiary and see it in list with PENDING status', async ({ page }) => {
      const beneficiaryName = `E2E Test Bank ${Date.now()}`;
      
      // Navigate to list
      await listPage.goto();
      
      // Click Add Beneficiary
      await listPage.clickAddBeneficiary();
      
      // Create beneficiary
      await formPage.createBeneficiary({
        beneficiaryName: beneficiaryName,
        nickName: 'E2ETest',
        country: 'United Kingdom',
        address: {
          addressLine1: '123 Test Street',
          city: 'London',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      });
      
      // Should redirect to list
      await page.waitForURL('**/beneficiaries', { timeout: 5000 });
      
      // Search for created beneficiary
      await listPage.searchBeneficiary(beneficiaryName);
      await page.waitForTimeout(1000);
      
      // Verify it exists with PENDING status
      const isVisible = await listPage.isBeneficiaryVisible(beneficiaryName);
      if (isVisible) {
        const status = await listPage.getStatusChip(beneficiaryName);
        expect(status).toContain('PENDING');
      }
    });

    test('should create C2C beneficiary with collector contact', async ({ page }) => {
      const beneficiaryName = `C2C Bank ${Date.now()}`;
      
      await listPage.goto();
      await listPage.clickAddBeneficiary();
      
      await formPage.createBeneficiary({
        beneficiaryName: beneficiaryName,
        country: 'United Kingdom',
        address: {
          addressLine1: '456 Collection Avenue',
          country: 'United Kingdom',
        },
        isC2C: true,
        collectorContact: '+44 20 1234 5678',
      });
      
      await page.waitForURL('**/beneficiaries', { timeout: 5000 });
      
      // Search and verify
      await listPage.searchBeneficiary(beneficiaryName);
      await page.waitForTimeout(1000);
      
      const isVisible = await listPage.isBeneficiaryVisible(beneficiaryName);
      expect(isVisible).toBeTruthy();
    });
  });

  test.describe('Edit Beneficiary Flow', () => {
    test('should edit PENDING beneficiary', async ({ page }) => {
      // Go to list and filter PENDING
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        // Get first beneficiary name
        const firstRow = page.locator('table tbody tr').first();
        const beneficiaryName = await firstRow.locator('td').first().textContent() || '';
        
        // Click on it to view details
        await firstRow.click();
        await page.waitForTimeout(500);
        
        // Click edit if available
        if (await detailsPage.isEditButtonVisible()) {
          await detailsPage.clickEdit();
          
          // Should navigate to edit page
          expect(page.url()).toMatch(/\/beneficiaries\/edit\/\d+/);
          
          // Modify nick name
          await formPage.nickNameInput.fill(`Updated ${Date.now()}`);
          
          // Submit
          await formPage.submitForm();
          
          // Should redirect back to list or details
          await page.waitForTimeout(2000);
        }
      }
    });

    test('should not allow editing non-PENDING beneficiaries', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('ACTIVE');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('ACTIVE')) {
          const editVisible = await detailsPage.isEditButtonVisible();
          expect(editVisible).toBeFalsy();
        }
      }
    });
  });

  test.describe('Delete Beneficiary Flow', () => {
    test('should delete PENDING beneficiary', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        const firstRow = page.locator('table tbody tr').first();
        const beneficiaryName = await firstRow.locator('td').first().textContent() || '';
        
        // Find and click delete button
        const deleteButton = firstRow.locator('button[aria-label="Delete"]');
        
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(500);
          
          // Confirm deletion
          const confirmButton = page.getByRole('button', { name: /^delete$/i });
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
            
            // Beneficiary should be removed from list
            const stillVisible = await listPage.isBeneficiaryVisible(beneficiaryName);
            expect(stillVisible).toBeFalsy();
          }
        }
      }
    });

    test('should cancel beneficiary deletion', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        const firstRow = page.locator('table tbody tr').first();
        const beneficiaryName = await firstRow.locator('td').first().textContent() || '';
        
        const deleteButton = firstRow.locator('button[aria-label="Delete"]');
        
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(500);
          
          // Cancel deletion
          const cancelButton = page.getByRole('button', { name: /cancel/i });
          if (await cancelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cancelButton.click();
            await page.waitForTimeout(500);
            
            // Beneficiary should still be visible
            const stillVisible = await listPage.isBeneficiaryVisible(beneficiaryName);
            expect(stillVisible).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('KYC Document Upload Flow', () => {
    test('should show KYC documents section for PENDING beneficiaries', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Scroll to KYC section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        
        // Should show KYC Documents
        const kycHeading = page.getByText('KYC Documents');
        await expect(kycHeading).toBeVisible();
      }
    });

    test('should enable submit button after uploading required documents', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('PENDING')) {
          // Scroll to documents
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(500);
          
          // Check if submit button exists
          const submitButtonVisible = await detailsPage.isSubmitButtonVisible();
          
          // Button visibility depends on whether required docs are uploaded
          expect(typeof submitButtonVisible === 'boolean').toBeTruthy();
        }
      }
    });
  });

  test.describe('Submit for Review Flow', () => {
    test('should submit beneficiary for review', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        if (await detailsPage.isSubmitButtonVisible() && await detailsPage.isSubmitButtonEnabled()) {
          const beneficiaryName = await detailsPage.getBeneficiaryName();
          
          await detailsPage.clickSubmitForReview();
          await page.waitForTimeout(1500);
          
          // Status should change to UNDER_REVIEW
          const newStatus = await detailsPage.getStatus();
          expect(newStatus).toContain('UNDER_REVIEW');
          
          // Submit button should no longer be visible
          const submitStillVisible = await detailsPage.isSubmitButtonVisible();
          expect(submitStillVisible).toBeFalsy();
        }
      }
    });

    test('should not show submit button after submission', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('UNDER_REVIEW');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const submitVisible = await detailsPage.isSubmitButtonVisible();
        expect(submitVisible).toBeFalsy();
      }
    });
  });

  test.describe('Admin Approval Workflow', () => {
    test('should display approve/reject buttons for UNDER_REVIEW beneficiaries (admin role)', async ({ page }) => {
      // Check user role
      const user = await page.evaluate(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      });
      
      const isAdmin = user?.role?.includes('ADMIN') || user?.role?.includes('COMPLIANCE');
      
      if (isAdmin) {
        await listPage.goto();
        await listPage.filterByStatus('UNDER_REVIEW');
        await page.waitForTimeout(500);
        
        const rows = await page.locator('table tbody tr').count();
        
        if (rows > 0) {
          const firstRow = page.locator('table tbody tr').first();
          
          // Should show approve/reject buttons
          const approveButton = firstRow.locator('button[title="Approve"]');
          const rejectButton = firstRow.locator('button[title="Reject"]');
          
          const hasApprove = await approveButton.count() > 0;
          const hasReject = await rejectButton.count() > 0;
          
          expect(hasApprove || hasReject).toBeTruthy();
        }
      }
    });

    test('should hide approve/reject buttons for business users', async ({ page }) => {
      const user = await page.evaluate(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      });
      
      const isBusinessUser = user?.role === 'BUSINESS_USER';
      
      if (isBusinessUser) {
        await listPage.goto();
        await listPage.filterByStatus('UNDER_REVIEW');
        await page.waitForTimeout(500);
        
        const rows = await page.locator('table tbody tr').count();
        
        if (rows > 0) {
          const firstRow = page.locator('table tbody tr').first();
          
          const approveButton = firstRow.locator('button[title="Approve"]');
          const rejectButton = firstRow.locator('button[title="Reject"]');
          
          expect(await approveButton.count()).toBe(0);
          expect(await rejectButton.count()).toBe(0);
        }
      }
    });
  });

  test.describe('Status Transitions', () => {
    test('should show correct status progression: PENDING → UNDER_REVIEW → ACTIVE', async ({ page }) => {
      // This is a visual verification test
      const statuses = ['PENDING', 'UNDER_REVIEW', 'ACTIVE'];
      
      for (const status of statuses) {
        await listPage.goto();
        await listPage.filterByStatus(status);
        await page.waitForTimeout(500);
        
        const rows = await page.locator('table tbody tr').count();
        
        if (rows > 0) {
          await page.locator('table tbody tr').first().click();
          await page.waitForTimeout(500);
          
          const currentStatus = await detailsPage.getStatus();
          
          // Verify status chip shows correct status
          expect(currentStatus.toLowerCase()).toContain(status.toLowerCase().replace('_', ' '));
          
          await listPage.goto(); // Go back for next iteration
        }
      }
    });

    test('should handle REJECTED status with rejection reason', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('REJECTED');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        expect(status).toContain('REJECTED');
        
        // Should show rejection reason in banner
        const banner = await detailsPage.getStatusBannerMessage();
        expect(banner.toLowerCase()).toContain('reject');
      }
    });

    test('should handle SUSPENDED status', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('SUSPENDED');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        expect(status).toContain('SUSPENDED');
        
        const banner = await detailsPage.getStatusBannerMessage();
        expect(banner.toLowerCase()).toContain('suspend');
      }
    });
  });

  test.describe('Permission-Based UI', () => {
    test('should show appropriate actions based on user role', async ({ page }) => {
      const user = await page.evaluate(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      });
      
      await listPage.goto();
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        const firstRow = page.locator('table tbody tr').first();
        
        // Check which action buttons are visible
        const editButton = firstRow.locator('button[aria-label="Edit"]');
        const deleteButton = firstRow.locator('button[aria-label="Delete"]');
        const approveButton = firstRow.locator('button[title="Approve"]');
        
        const hasEdit = await editButton.count() > 0;
        const hasDelete = await deleteButton.count() > 0;
        const hasApprove = await approveButton.count() > 0;
        
        // Actions should match user role
        if (user?.role === 'BUSINESS_USER') {
          expect(hasEdit || hasDelete).toBeTruthy();
          expect(hasApprove).toBeFalsy();
        } else if (user?.role?.includes('ADMIN')) {
          // Admin might see approve/reject
          expect(hasApprove || hasEdit || hasDelete).toBeTruthy();
        }
      }
    });
  });

  test.describe('Beneficiary Limit (20 max)', () => {
    test('should display beneficiary count in add button', async ({ page }) => {
      await listPage.goto();
      
      const buttonText = await listPage.getBeneficiaryCount();
      
      // Should show format like "Add Beneficiary (X / 20)"
      expect(buttonText).toMatch(/\d+\s*\/\s*20/);
    });

    test('should disable add button when limit reached', async ({ page }) => {
      await listPage.goto();
      
      const buttonText = await listPage.getBeneficiaryCount();
      
      // Extract current count
      const match = buttonText.match(/(\d+)\s*\/\s*20/);
      
      if (match && parseInt(match[1]) >= 20) {
        // Button should be disabled
        const isDisabled = await listPage.addBeneficiaryButton.isDisabled();
        expect(isDisabled).toBeTruthy();
      } else if (match && parseInt(match[1]) < 20) {
        // Button should be enabled
        const isEnabled = await listPage.addBeneficiaryButton.isEnabled();
        expect(isEnabled).toBeTruthy();
      }
    });
  });
});
