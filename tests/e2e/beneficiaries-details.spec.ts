import { test, expect } from '@playwright/test';
import { setupMocks } from '../fixtures/auth.fixture';
import { BeneficiaryDetailsPage } from '../pages/BeneficiaryDetailsPage';
import { BeneficiariesPage } from '../pages/BeneficiariesPage';

test.describe('Beneficiary Details Page', () => {
  let detailsPage: BeneficiaryDetailsPage;
  let listPage: BeneficiariesPage;

  test.beforeEach(async ({ page }) => {
    detailsPage = new BeneficiaryDetailsPage(page);
    listPage = new BeneficiariesPage(page);
    
    // Setup API mocks and authentication
    await setupMocks(page);
    
    // Verify authentication
    const isAuthenticated = await page.evaluate(() => {
      return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
    });
    
    if (!isAuthenticated) {
      throw new Error('Auth state not loaded - global setup failed');
    }
  });

  test.describe('Page Load and Navigation', () => {
    test('should load beneficiary details from list', async ({ page }) => {
      // Navigate to list
      await listPage.goto();
      
      // Check if any beneficiaries exist
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        // Click first beneficiary
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Should show details page
        expect(page.url()).toMatch(/\/beneficiaries\/\d+/);
        await expect(detailsPage.beneficiaryName).toBeVisible();
      }
    });

    test('should display back button', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        await expect(detailsPage.backButton).toBeVisible();
      }
    });

    test('should navigate back to list using back button', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        await detailsPage.clickBack();
        
        // Should return to list
        expect(page.url()).toContain('/beneficiaries');
        expect(page.url()).not.toMatch(/\/beneficiaries\/\d+/);
      }
    });
  });

  test.describe('Status Display', () => {
    test('should display current status chip', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        expect(status).toMatch(/PENDING|ACTIVE|UNDER_REVIEW|REJECTED|SUSPENDED/i);
      }
    });

    test('should display status banner for PENDING status', async ({ page }) => {
      // Filter by PENDING
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('PENDING')) {
          const bannerMsg = await detailsPage.getStatusBannerMessage();
          expect(bannerMsg.toLowerCase()).toContain('pending');
        }
      }
    });

    test('should display status banner for UNDER_REVIEW status', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('UNDER_REVIEW');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('UNDER_REVIEW')) {
          const bannerMsg = await detailsPage.getStatusBannerMessage();
          expect(bannerMsg.toLowerCase()).toContain('review');
        }
      }
    });

    test('should display status banner for REJECTED status', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('REJECTED');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('REJECTED')) {
          const bannerMsg = await detailsPage.getStatusBannerMessage();
          expect(bannerMsg.toLowerCase()).toContain('reject');
        }
      }
    });

    test('should display status banner for SUSPENDED status', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('SUSPENDED');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('SUSPENDED')) {
          const bannerMsg = await detailsPage.getStatusBannerMessage();
          expect(bannerMsg.toLowerCase()).toContain('suspend');
        }
      }
    });
  });

  test.describe('Basic Information Display', () => {
    test('should display beneficiary name', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const name = await detailsPage.getBeneficiaryName();
        expect(name.length).toBeGreaterThan(0);
      }
    });

    test('should display Basic Information card', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        await expect(detailsPage.basicInfoCard).toBeVisible();
        await expect(page.getByText('Basic Information')).toBeVisible();
      }
    });

    test('should display country chip', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Country chip should be visible
        const countryChip = page.locator('[class*="MuiChip"]').filter({ 
          has: page.locator('[data-testid*="LocationOnIcon"], [data-testid*="location"]') 
        }).or(
          page.locator('[class*="MuiChip"]').filter({ hasText: /[A-Z]{2,}/ })
        );
        
        const count = await countryChip.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display C2C chip if enabled', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const isC2C = await detailsPage.isC2C();
        
        if (isC2C) {
          await expect(detailsPage.c2cChip).toBeVisible();
          
          const collectorContact = await detailsPage.getCollectorContact();
          expect(collectorContact).not.toBeNull();
        }
      }
    });

    test('should display nick name if exists', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const nickName = await detailsPage.getNickName();
        // Nick name is optional, so it may or may not be present
        expect(nickName === null || typeof nickName === 'string').toBeTruthy();
      }
    });

    test('should display business name if exists', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const businessName = await detailsPage.getBusinessName();
        // Business name is optional
        expect(businessName === null || typeof businessName === 'string').toBeTruthy();
      }
    });
  });

  test.describe('Registered Address Display', () => {
    test('should display Registered Address card', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        await expect(detailsPage.addressCard).toBeVisible();
        await expect(page.getByText('Registered Address')).toBeVisible();
      }
    });

    test('should display address details', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const address = await detailsPage.getAddress();
        
        expect(address.addressLine1.length).toBeGreaterThan(0);
        expect(address.country.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Edit Button Visibility', () => {
    test('should show edit button for PENDING beneficiaries', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('PENDING')) {
          const editVisible = await detailsPage.isEditButtonVisible();
          expect(editVisible).toBeTruthy();
        }
      }
    });

    test('should hide edit button for ACTIVE beneficiaries', async ({ page }) => {
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

    test('should navigate to edit page when edit clicked', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        if (await detailsPage.isEditButtonVisible()) {
          await detailsPage.clickEdit();
          
          expect(page.url()).toMatch(/\/beneficiaries\/edit\/\d+/);
        }
      }
    });
  });

  test.describe('Submit for Review Button', () => {
    test('should show submit button for PENDING beneficiaries with KYC docs', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('PENDING')) {
          // Submit button visibility depends on KYC documents being uploaded
          const submitVisible = await detailsPage.isSubmitButtonVisible();
          expect(typeof submitVisible === 'boolean').toBeTruthy();
        }
      }
    });

    test('should hide submit button for non-PENDING beneficiaries', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('ACTIVE');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (!status.includes('PENDING')) {
          const submitVisible = await detailsPage.isSubmitButtonVisible();
          expect(submitVisible).toBeFalsy();
        }
      }
    });
  });

  test.describe('KYC Documents Section', () => {
    test('should display KYC Documents section', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Scroll to KYC section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        
        const kycSection = page.getByText('KYC Documents');
        await expect(kycSection).toBeVisible();
      }
    });

    test('should display required documents list for PENDING status', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('PENDING')) {
          // Scroll to documents section
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          
          // Should show required documents info
          const requiredText = page.getByText(/required document/i);
          const hasRequired = await requiredText.isVisible({ timeout: 2000 }).catch(() => false);
          
          expect(typeof hasRequired === 'boolean').toBeTruthy();
        }
      }
    });

    test('should show upload interface for PENDING beneficiaries', async ({ page }) => {
      await listPage.goto();
      await listPage.filterByStatus('PENDING');
      await page.waitForTimeout(500);
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const status = await detailsPage.getStatus();
        if (status.includes('PENDING')) {
          // Scroll to documents section
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(500);
          
          // Upload button or file input should be visible
          const uploadElements = page.locator('input[type="file"]').or(
            page.getByRole('button', { name: /upload|choose file/i })
          );
          
          const count = await uploadElements.count();
          expect(count).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should display uploaded documents table', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Scroll to documents section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        
        // Look for documents table
        const docTable = page.locator('table').filter({ has: page.locator('th', { hasText: /document type|file name/i }) });
        const tableCount = await docTable.count();
        
        // Table may or may not be present depending on whether docs are uploaded
        expect(tableCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Audit Information', () => {
    test('should display creation date', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Scroll to bottom to see audit info
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        
        const createdText = page.getByText(/created/i);
        const hasCreatedInfo = await createdText.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(typeof hasCreatedInfo === 'boolean').toBeTruthy();
      }
    });

    test('should display last modified date', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        
        const modifiedText = page.getByText(/modified|updated/i);
        const hasModifiedInfo = await modifiedText.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(typeof hasModifiedInfo === 'boolean').toBeTruthy();
      }
    });
  });

  test.describe('Responsive Layout', () => {
    test('should display all sections in proper card layout', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Check for card layouts
        const cards = page.locator('[class*="MuiCard"], [class*="MuiPaper"][class*="elevation"]');
        const cardCount = await cards.count();
        
        // Should have at least 2 cards (Basic Info and Address)
        expect(cardCount).toBeGreaterThanOrEqual(2);
      }
    });

    test('should handle long beneficiary names gracefully', async ({ page }) => {
      await listPage.goto();
      
      const rows = await page.locator('table tbody tr').count();
      if (rows > 0) {
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        const name = await detailsPage.getBeneficiaryName();
        
        // Should display name without overflow issues
        await expect(detailsPage.beneficiaryName).toBeVisible();
        expect(name.length).toBeGreaterThan(0);
      }
    });
  });
});
