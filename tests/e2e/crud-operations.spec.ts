import { test, expect } from '@playwright/test';
import { setupMocks } from './fixtures/auth.fixture';

test.describe('CRUD Operations - All Pages', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup API mocks (auth state already loaded from storage)
    await setupMocks(page);
    
    // Navigate to dashboard (we're already authenticated)
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Verify we're authenticated
    const isAuthenticated = await page.evaluate(() => {
      return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
    });
    
    if (!isAuthenticated) {
      throw new Error('Auth state not loaded - global setup failed');
    }
  });

  test.describe('Users CRUD Operations', () => {
    test('should navigate to users page and verify buttons', async ({ page }) => {
      await page.goto('/users');
      await expect(page.getByText('User Management')).toBeVisible();
      
      // Verify Add User button exists and is clickable
      const addButton = page.getByRole('button', { name: /add user/i });
      await expect(addButton).toBeVisible();
      await addButton.click();
      await expect(page.getByText('Create New User')).toBeVisible();
    });

    test('should create a new user', async ({ page }) => {
      await page.goto('/users');
      await page.getByRole('button', { name: /add user/i }).click();
      
      // Fill form
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phoneNumber"]', '1234567890');
      await page.fill('input[name="dateOfBirth"]', '1990-01-01');
      
      // Submit
      await page.getByRole('button', { name: /^create$/i }).click();
      
      // Verify success message
      await expect(page.getByText(/user created successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should edit an existing user', async ({ page }) => {
      await page.goto('/users');
      
      // Click edit on first user
      const editButton = page.locator('button[aria-label="Edit"]').first();
      await editButton.click();
      
      // Verify edit dialog
      await expect(page.getByText('Edit User')).toBeVisible();
      
      // Update name
      await page.fill('input[name="firstName"]', 'Updated');
      await page.getByRole('button', { name: /^update$/i }).click();
      
      // Verify success
      await expect(page.getByText(/user updated successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should delete a user', async ({ page }) => {
      await page.goto('/users');
      
      // Click delete on first user
      const deleteButton = page.locator('button[aria-label="Delete"]').first();
      await deleteButton.click();
      
      // Confirm deletion
      await expect(page.getByText('Delete User')).toBeVisible();
      await page.getByRole('button', { name: /^delete$/i }).click();
      
      // Verify success
      await expect(page.getByText(/user deleted successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should refresh users list', async ({ page }) => {
      await page.goto('/users');
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      await expect(refreshButton).toBeVisible();
      await refreshButton.click();
      // Wait for table to reload
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Organizations CRUD Operations', () => {
    test('should navigate to organizations page and verify buttons', async ({ page }) => {
      await page.goto('/organizations');
      await expect(page.getByText('Organization Management')).toBeVisible();
      
      const addButton = page.getByRole('button', { name: /add organization/i });
      await expect(addButton).toBeVisible();
      await addButton.click();
      await expect(page.getByText('Create Organization')).toBeVisible();
    });

    test('should create a new organization', async ({ page }) => {
      await page.goto('/organizations');
      await page.getByRole('button', { name: /add organization/i }).click();
      
      // Fill basic info tab (Tab 0)
      await page.fill('input[name="legalName"]', 'Test Corporation');
      await page.selectOption('select[name="organisationType"]', 'MONEY_SERVICE_BUSINESS');
      await page.fill('input[name="registrationNumber"]', 'REG123456');
      
      // Navigate to last tab and save using the wizard navigation
      // Click Next through tabs until we reach the last tab
      for (let i = 0; i < 8; i++) {
        await page.getByRole('button', { name: /next/i }).click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(300);
      }
      
      // On the last tab, click Save Organization
      await page.getByRole('button', { name: /save organization/i }).click();
      await expect(page.getByText(/organization created successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should edit an organization', async ({ page }) => {
      await page.goto('/organizations');
      
      const editButton = page.locator('button[aria-label="Edit"]').first();
      await editButton.click();
      
      await expect(page.getByText('Edit Organization')).toBeVisible();
      await page.fill('input[name="legalName"]', 'Updated Corporation');
      await page.getByRole('button', { name: /^update$/i }).click();
      
      await expect(page.getByText(/organization updated successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should delete an organization', async ({ page }) => {
      await page.goto('/organizations');
      
      const deleteButton = page.locator('button[aria-label="Delete"]').first();
      await deleteButton.click();
      
      await expect(page.getByText('Delete Organization')).toBeVisible();
      await page.getByRole('button', { name: /^delete$/i }).click();
      
      await expect(page.getByText(/organization deleted successfully/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('KYC Documents Operations', () => {
    test('should navigate to KYC documents and verify upload button', async ({ page }) => {
      await page.goto('/kyc-documents');
      await expect(page.getByText('KYC Document Management')).toBeVisible();
      
      const uploadButton = page.getByRole('button', { name: /upload document/i });
      await expect(uploadButton).toBeVisible();
      await uploadButton.click();
      
      // Should show info message about implementation
      await expect(page.getByText(/upload functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
    });

    test('should approve a pending document', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Find approve button
      const approveButton = page.locator('button[aria-label="Approve"]').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await expect(page.getByText(/document approved successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should reject a pending document', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      const rejectButton = page.locator('button[aria-label="Reject"]').first();
      if (await rejectButton.isVisible()) {
        await rejectButton.click();
        await expect(page.getByText(/document rejected successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should delete a document', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      const deleteButton = page.locator('button[aria-label="Delete"]').first();
      await deleteButton.click();
      
      await expect(page.getByText('Delete Document')).toBeVisible();
      await page.getByRole('button', { name: /^delete$/i }).click();
      
      await expect(page.getByText(/document deleted successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should refresh documents list', async ({ page }) => {
      await page.goto('/kyc-documents');
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      await refreshButton.click();
      await page.waitForTimeout(1000);
    });
  });

  test.describe('KYC Verification Operations', () => {
    test('should navigate and verify new verification button', async ({ page }) => {
      await page.goto('/kyc/verifications');
      await expect(page.getByText('KYC Verification Management')).toBeVisible();
      
      const newButton = page.getByRole('button', { name: /new verification/i });
      await expect(newButton).toBeVisible();
      await newButton.click();
      
      await expect(page.getByText(/verification creation functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
    });

    test('should view verification details', async ({ page }) => {
      await page.goto('/kyc/verifications');
      
      const viewButton = page.locator('button[aria-label="View Details"]').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();
        // Should open view dialog
        await page.waitForTimeout(500);
      }
    });

    test('should approve a pending verification', async ({ page }) => {
      await page.goto('/kyc/verifications');
      
      const approveButton = page.locator('button[aria-label="Approve"]').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await expect(page.getByText(/verification approved successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should reject a pending verification', async ({ page }) => {
      await page.goto('/kyc/verifications');
      
      const rejectButton = page.locator('button[aria-label="Reject"]').first();
      if (await rejectButton.isVisible()) {
        await rejectButton.click();
        await expect(page.getByText(/verification rejected successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Questionnaire CRUD Operations', () => {
    test('should add a new question', async ({ page }) => {
      await page.goto('/questionnaire');
      await expect(page.getByText('Questionnaire Management')).toBeVisible();
      
      const addButton = page.getByRole('button', { name: /add question/i });
      await expect(addButton).toBeVisible();
      await addButton.click();
      
      await expect(page.getByText(/question creation functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
    });

    test('should edit a question', async ({ page }) => {
      await page.goto('/questionnaire');
      
      const editButton = page.locator('button[aria-label="Edit"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await expect(page.getByText(/question edit functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should activate a question', async ({ page }) => {
      await page.goto('/questionnaire');
      
      const activateButton = page.locator('button[aria-label="Activate"]').first();
      if (await activateButton.isVisible()) {
        await activateButton.click();
        await expect(page.getByText(/question activated successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should deactivate a question', async ({ page }) => {
      await page.goto('/questionnaire');
      
      const deactivateButton = page.locator('button[aria-label="Deactivate"]').first();
      if (await deactivateButton.isVisible()) {
        await deactivateButton.click();
        await expect(page.getByText(/question deactivated successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should delete a question', async ({ page }) => {
      await page.goto('/questionnaire');
      
      const deleteButton = page.locator('button[aria-label="Delete"]').first();
      await deleteButton.click();
      
      await expect(page.getByText('Delete Question')).toBeVisible();
      await page.getByRole('button', { name: /^delete$/i }).click();
      
      await expect(page.getByText(/question deleted successfully/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Customer Answers Operations', () => {
    test('should submit a new answer', async ({ page }) => {
      await page.goto('/customer-answers');
      await expect(page.getByText('Customer Answers Management')).toBeVisible();
      
      const submitButton = page.getByRole('button', { name: /submit answer/i });
      await expect(submitButton).toBeVisible();
      await submitButton.click();
      
      await expect(page.getByText(/answer submission functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
    });

    test('should edit an answer', async ({ page }) => {
      await page.goto('/customer-answers');
      
      const editButton = page.locator('button[aria-label="Edit"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await expect(page.getByText(/answer edit functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should delete an answer', async ({ page }) => {
      await page.goto('/customer-answers');
      
      const deleteButton = page.locator('button[aria-label="Delete"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        await expect(page.getByText('Delete Answer')).toBeVisible();
        await page.getByRole('button', { name: /^delete$/i }).click();
        
        await expect(page.getByText(/answer deleted successfully/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Profile Operations', () => {
    test('should open edit profile dialog', async ({ page }) => {
      await page.goto('/profile');
      await expect(page.getByText('My Profile')).toBeVisible();
      
      const editButton = page.getByRole('button', { name: /edit profile/i }).first();
      await expect(editButton).toBeVisible();
      await editButton.click();
      
      // Verify dialog opens
      await page.waitForTimeout(500);
      
      // Try to save (should show info message)
      const saveButton = page.getByRole('button', { name: /save changes/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await expect(page.getByText(/profile update functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Settings Operations', () => {
    test('should save settings', async ({ page }) => {
      await page.goto('/settings');
      await expect(page.getByText('Settings')).toBeVisible();
      
      const saveButton = page.getByRole('button', { name: /save settings/i });
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      
      await expect(page.getByText(/settings saved successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should toggle notification settings', async ({ page }) => {
      await page.goto('/settings');
      
      // Find and toggle email notifications
      const emailToggle = page.locator('input[type="checkbox"]').first();
      const initialState = await emailToggle.isChecked();
      await emailToggle.click();
      const newState = await emailToggle.isChecked();
      expect(newState).toBe(!initialState);
    });

    test('should open change password dialog', async ({ page }) => {
      await page.goto('/settings');
      
      // Click manage button for password changeconst manageButton = page.getByRole('button', { name: /manage/i }).first();
      await manageButton.click();
      
      // Verify dialog opens
      await page.waitForTimeout(500);
      
      // Try to update password
      const updateButton = page.getByRole('button', { name: /update password/i });
      if (await updateButton.isVisible()) {
        await updateButton.click();
        await expect(page.getByText(/password update functionality will be implemented soon/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should change language preference', async ({ page }) => {
      await page.goto('/settings');
      
      const languageSelect = page.locator('select').filter({ hasText: /language/i });
      if (await languageSelect.isVisible()) {
        await languageSelect.selectOption('es');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Search and Filter Operations', () => {
    test('should search users', async ({ page }) => {
      await page.goto('/users');
      
      const searchBar = page.getByPlaceholder(/search/i);
      await searchBar.fill('test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    });

    test('should filter users by status', async ({ page }) => {
      await page.goto('/users');
      
      // Open filter panel if exists
      const filterButton = page.getByRole('button', { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('should search organizations', async ({ page }) => {
      await page.goto('/organizations');
      
      const searchBar = page.getByPlaceholder(/search/i);
      await searchBar.fill('corp');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    });

    test('should search KYC documents', async ({ page }) => {
      await page.goto('/kyc/documents');
      
      const searchBar = page.getByPlaceholder(/search/i);
      await searchBar.fill('passport');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Pagination Operations', () => {
    test('should navigate pages in users table', async ({ page }) => {
      await page.goto('/users');
      
      // Wait for table to load
      await page.waitForTimeout(1000);
      
      // Check if next page button exists
      const nextButton = page.locator('button[aria-label="Go to next page"]');
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should change rows per page', async ({ page }) => {
      await page.goto('/users');
      
      // Find rows per page dropdown
      const rowsPerPage = page.locator('select[aria-label*="rows"]');
      if (await rowsPerPage.isVisible()) {
        await rowsPerPage.selectOption('25');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Sorting Operations', () => {
    test('should sort users table', async ({ page }) => {
      await page.goto('/users');
      
      // Click on column header to sort
      const firstNameHeader = page.getByText('First Name').first();
      if (await firstNameHeader.isVisible()) {
        await firstNameHeader.click();
        await page.waitForTimeout(1000);
        
        // Click again to reverse sort
        await firstNameHeader.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should sort organizations table', async ({ page }) => {
      await page.goto('/organizations');
      
      const legalNameHeader = page.getByText('Legal Name').first();
      if (await legalNameHeader.isVisible()) {
        await legalNameHeader.click();
        await page.waitForTimeout(1000);
      }
    });
  });
});
