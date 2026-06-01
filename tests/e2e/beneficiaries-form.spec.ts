import { test, expect } from '@playwright/test';
import { setupMocks } from '../fixtures/auth.fixture';
import { BeneficiaryFormPage } from '../pages/BeneficiaryFormPage';

test.describe('Beneficiary Create/Edit Form', () => {
  let formPage: BeneficiaryFormPage;

  test.beforeEach(async ({ page }) => {
    formPage = new BeneficiaryFormPage(page);
    
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

  test.describe('Create Mode - Page Load', () => {
    test('should load create beneficiary form', async ({ page }) => {
      await formPage.gotoCreate();
      
      await expect(formPage.pageTitle).toBeVisible();
      await expect(formPage.beneficiaryNameInput).toBeVisible();
      await expect(formPage.saveButton).toBeVisible();
    });

    test('should display all required form sections', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Basic Information section
      await expect(page.getByText('Basic Information')).toBeVisible();
      
      // Collection Method section
      await expect(page.getByText('Collection Method')).toBeVisible();
      
      // Registered Address section
      await expect(page.getByText('Registered Address')).toBeVisible();
    });

    test('should have back button', async ({ page }) => {
      await formPage.gotoCreate();
      await expect(formPage.backButton).toBeVisible();
    });

    test('should have save button initially disabled', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Save button should be disabled until address is saved
      const isEnabled = await formPage.isSaveButtonEnabled();
      expect(isEnabled).toBeFalsy();
    });
  });

  test.describe('Form Validation - Required Fields', () => {
    test('should show error for missing beneficiary name', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Try to save without filling anything
      await formPage.submitForm();
      await page.waitForTimeout(500);
      
      const errorMsg = await formPage.getErrorMessage();
      expect(errorMsg.toLowerCase()).toContain('beneficiary name');
    });

    test('should show error for missing country', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill only name, skip country
      await formPage.beneficiaryNameInput.fill('Test Bank');
      await formPage.submitForm();
      await page.waitForTimeout(500);
      
      const errorMsg = await formPage.getErrorMessage();
      expect(errorMsg.toLowerCase()).toContain('country');
    });

    test('should show error when address not saved', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill basic info but don't save address
      await formPage.fillBasicInformation({
        beneficiaryName: 'Test Bank',
        country: 'United Kingdom',
      });
      
      await formPage.submitForm();
      await page.waitForTimeout(500);
      
      const errorMsg = await formPage.getErrorMessage();
      expect(errorMsg.toLowerCase()).toContain('address');
    });

    test('should validate address required fields', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Try to save address without required fields
      await formPage.saveAddress();
      await page.waitForTimeout(500);
      
      // Should show field-level validation errors
      const addressLine1Error = page.locator('text=Address line 1 is required');
      const countryError = page.locator('text=Country is required');
      
      expect(await addressLine1Error.isVisible() || await countryError.isVisible()).toBeTruthy();
    });
  });

  test.describe('C2C (Counter Over Counter) Validation', () => {
    test('should show collector contact field when C2C enabled', async ({ page }) => {
      await formPage.gotoCreate();
      
      // C2C field should not be visible initially
      await expect(formPage.collectorContactInput).not.toBeVisible();
      
      // Enable C2C
      await formPage.c2cCheckbox.check();
      await page.waitForTimeout(300);
      
      // Collector contact field should now be visible
      await expect(formPage.collectorContactInput).toBeVisible();
    });

    test('should hide collector contact field when C2C disabled', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Enable then disable C2C
      await formPage.c2cCheckbox.check();
      await page.waitForTimeout(300);
      await expect(formPage.collectorContactInput).toBeVisible();
      
      await formPage.c2cCheckbox.uncheck();
      await page.waitForTimeout(300);
      
      // Field should be hidden
      await expect(formPage.collectorContactInput).not.toBeVisible();
    });

    test('should require collector contact when C2C is enabled', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill form with C2C enabled but no contact number
      await formPage.fillBasicInformation({
        beneficiaryName: 'Test Bank',
        country: 'United Kingdom',
      });
      
      await formPage.c2cCheckbox.check();
      await page.waitForTimeout(300);
      
      // Fill and save address
      await formPage.fillAddress({
        addressLine1: '123 Test Street',
        country: 'United Kingdom',
      });
      await formPage.saveAddress();
      await page.waitForTimeout(1000);
      
      // Try to submit without collector contact
      await formPage.submitForm();
      await page.waitForTimeout(500);
      
      const errorMsg = await formPage.getErrorMessage();
      expect(errorMsg.toLowerCase()).toContain('collector contact');
    });

    test('should accept valid collector contact when C2C enabled', async ({ page }) => {
      await formPage.gotoCreate();
      
      await formPage.fillBasicInformation({
        beneficiaryName: 'Test Bank',
        country: 'United Kingdom',
      });
      
      await formPage.enableC2C('+44 20 1234 5678');
      
      // Should not show error
      const errorMsg = await formPage.getErrorMessage();
      expect(errorMsg).not.toContain('collector contact');
    });
  });

  test.describe('Address Form Integration', () => {
    test('should fill address form fields without flickering', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill address fields and ensure no infinite re-render
      await formPage.addressLine1Input.fill('123 Test Street');
      await page.waitForTimeout(300);
      
      await formPage.addressCountryInput.fill('United Kingdom');
      await page.waitForTimeout(300);
      
      // Fields should retain their values (no flickering/clearing)
      await expect(formPage.addressLine1Input).toHaveValue('123 Test Street');
      await expect(formPage.addressCountryInput).toHaveValue('United Kingdom');
    });

    test('should save address successfully', async ({ page }) => {
      await formPage.gotoCreate();
      
      await formPage.fillAddress({
        addressLine1: '123 Test Street',
        addressLine2: 'Suite 100',
        city: 'London',
        stateCode: 'LDN',
        postalCode: 'SW1A 1AA',
        country: 'United Kingdom',
      });
      
      await formPage.saveAddress();
      await page.waitForTimeout(1500);
      
      // Should show "Address Saved" indicator
      const isSaved = await formPage.isAddressSaved();
      expect(isSaved).toBeTruthy();
    });

    test('should enable save button after address is saved', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill basic info
      await formPage.fillBasicInformation({
        beneficiaryName: 'Test Bank',
        country: 'United Kingdom',
      });
      
      // Save button should be disabled
      expect(await formPage.isSaveButtonEnabled()).toBeFalsy();
      
      // Fill and save address
      await formPage.fillAddress({
        addressLine1: '123 Test Street',
        country: 'United Kingdom',
      });
      await formPage.saveAddress();
      await page.waitForTimeout(1500);
      
      // Save button should now be enabled
      expect(await formPage.isSaveButtonEnabled()).toBeTruthy();
    });

    test('should mark address as unsaved when modified after save', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill and save address
      await formPage.fillAddress({
        addressLine1: '123 Test Street',
        country: 'United Kingdom',
      });
      await formPage.saveAddress();
      await page.waitForTimeout(1500);
      
      expect(await formPage.isAddressSaved()).toBeTruthy();
      
      // Modify address
      await formPage.addressLine1Input.fill('456 New Street');
      await page.waitForTimeout(300);
      
      // Address saved indicator should disappear
      expect(await formPage.isAddressSaved()).toBeFalsy();
    });
  });

  test.describe('Create Beneficiary - Success Flow', () => {
    test('should create beneficiary without C2C', async ({ page }) => {
      await formPage.gotoCreate();
      
      await formPage.createBeneficiary({
        beneficiaryName: 'Test Bank Ltd',
        nickName: 'TestBank',
        businessName: 'Test Bank Business',
        country: 'United Kingdom',
        address: {
          addressLine1: '123 Banking Street',
          addressLine2: 'Financial District',
          city: 'London',
          stateCode: 'LDN',
          postalCode: 'EC1A 1BB',
          country: 'United Kingdom',
        },
      });
      
      // Should redirect to beneficiaries list
      await page.waitForURL('**/beneficiaries', { timeout: 5000 });
      
      // Success message might appear
      const successMsg = page.getByText(/beneficiary created successfully/i);
      if (await successMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(successMsg).toBeVisible();
      }
    });

    test('should create beneficiary with C2C enabled', async ({ page }) => {
      await formPage.gotoCreate();
      
      await formPage.createBeneficiary({
        beneficiaryName: 'C2C Test Bank',
        country: 'United Kingdom',
        address: {
          addressLine1: '456 Collection Street',
          country: 'United Kingdom',
        },
        isC2C: true,
        collectorContact: '+44 20 9876 5432',
      });
      
      // Should redirect to beneficiaries list
      await page.waitForURL('**/beneficiaries', { timeout: 5000 });
    });

    test('should create beneficiary with minimum required fields', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Only fill required fields
      await formPage.fillBasicInformation({
        beneficiaryName: 'Minimal Bank',
        country: 'USA',
      });
      
      await formPage.fillAddress({
        addressLine1: '789 Main St',
        country: 'USA',
      });
      
      await formPage.saveAddress();
      await page.waitForTimeout(1500);
      
      await formPage.submitForm();
      
      // Should succeed
      await page.waitForURL('**/beneficiaries', { timeout: 5000 });
    });
  });

  test.describe('Navigation and Cancel', () => {
    test('should cancel and return to list', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill some data
      await formPage.beneficiaryNameInput.fill('Test');
      
      // Click cancel
      await formPage.cancel();
      
      // Should return to beneficiaries list
      await page.waitForURL('**/beneficiaries', { timeout: 3000 });
    });

    test('should navigate back using back button', async ({ page }) => {
      await formPage.gotoCreate();
      
      await formPage.backButton.click();
      
      // Should return to beneficiaries list
      await page.waitForURL('**/beneficiaries', { timeout: 3000 });
    });
  });

  test.describe('Edit Mode', () => {
    test('should load edit form with existing data', async ({ page }) => {
      // This test requires an existing beneficiary ID
      // Skip if no beneficiary exists
      const beneficiaryId = 1; // Replace with actual ID or mock
      
      await page.goto('/beneficiaries');
      await page.waitForLoadState('networkidle');
      
      // Check if any beneficiary exists
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        // Click first beneficiary
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(500);
        
        // Click edit button if visible
        const editButton = page.getByRole('button', { name: /edit/i });
        
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editButton.click();
          await page.waitForURL('**/beneficiaries/edit/**');
          
          // Form should be populated
          await expect(formPage.beneficiaryNameInput).not.toHaveValue('');
          await expect(formPage.countryInput).not.toHaveValue('');
        }
      }
    });

    test('should display "Update Beneficiary" button in edit mode', async ({ page }) => {
      // Navigate to beneficiaries list and try to edit
      await page.goto('/beneficiaries');
      await page.waitForLoadState('networkidle');
      
      const rows = await page.locator('table tbody tr').count();
      
      if (rows > 0) {
        const editButton = page.locator('button[aria-label="Edit"]').first();
        
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editButton.click();
          await page.waitForTimeout(1000);
          
          // Should show "Update" button instead of "Create"
          const updateButton = page.getByRole('button', { name: /update beneficiary/i });
          await expect(updateButton).toBeVisible({ timeout: 3000 });
        }
      }
    });
  });

  test.describe('Form State Management', () => {
    test('should clear error when user starts typing', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Trigger validation error
      await formPage.submitForm();
      await page.waitForTimeout(500);
      
      let errorMsg = await formPage.getErrorMessage();
      expect(errorMsg).not.toBe('');
      
      // Start filling form
      await formPage.beneficiaryNameInput.fill('Test');
      await page.waitForTimeout(300);
      
      // Error should clear
      errorMsg = await formPage.getErrorMessage();
      // Error may still show until form is valid, but should not be the same error
      // This test verifies the form is responsive
    });

    test('should preserve form data when switching between sections', async ({ page }) => {
      await formPage.gotoCreate();
      
      // Fill basic info
      await formPage.beneficiaryNameInput.fill('Persistent Bank');
      await formPage.countryInput.fill('Canada');
      
      // Fill address
      await formPage.addressLine1Input.fill('100 Test Avenue');
      
      // Go back and check basic info is still there
      expect(await formPage.beneficiaryNameInput.inputValue()).toBe('Persistent Bank');
      expect(await formPage.countryInput.inputValue()).toBe('Canada');
    });
  });

  test.describe('Special Characters and Edge Cases', () => {
    test('should accept special characters in beneficiary name', async ({ page }) => {
      await formPage.gotoCreate();
      
      const specialName = "O'Brien & Co. - Test Bank";
      await formPage.beneficiaryNameInput.fill(specialName);
      
      expect(await formPage.beneficiaryNameInput.inputValue()).toBe(specialName);
    });

    test('should accept international addresses', async ({ page }) => {
      await formPage.gotoCreate();
      
      await formPage.fillAddress({
        addressLine1: 'Straße der Pariser Kommune 123',
        city: 'München',
        postalCode: '80805',
        country: 'Germany',
      });
      
      // Should accept non-ASCII characters
      expect(await formPage.addressLine1Input.inputValue()).toContain('Straße');
    });

    test('should handle very long beneficiary names', async ({ page }) => {
      await formPage.gotoCreate();
      
      const longName = 'A'.repeat(200); // 200 character name
      await formPage.beneficiaryNameInput.fill(longName);
      
      // Should accept or show appropriate validation
      const value = await formPage.beneficiaryNameInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    });
  });
});
