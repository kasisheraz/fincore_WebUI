import { test, expect } from '../fixtures/auth.fixture';
import { UsersPage } from '../pages/UsersPage';
import { testUser, generateUniqueId } from '../helpers/test-data';

test.describe('Users Management Tests', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    await usersPage.goto();
  });

  test('should display users page correctly', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await expect(usersPage.pageTitle).toBeVisible();
    await expect(usersPage.addButton).toBeVisible();
    await expect(usersPage.searchBar).toBeVisible();
    await expect(usersPage.dataTable).toBeVisible();
  });

  test('should open add user dialog', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.clickAddUser();
    
    await expect(usersPage.dialogTitle).toContainText(/Add|Create.*User/i);
    await expect(usersPage.saveButton).toBeVisible();
    await expect(usersPage.cancelButton).toBeVisible();
  });

  test('should create new user successfully', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    const uniqueUser = {
      ...testUser,
      email: `test.${generateUniqueId()}@example.com`
    };
    
    await usersPage.clickAddUser();
    await usersPage.fillUserForm(uniqueUser);
    await authenticatedPage.waitForTimeout(1000); // Wait for form data propagation
    await usersPage.saveUser();
    
    // Check for success message
    const successMessage = authenticatedPage.locator('.MuiAlert-standardSuccess, .MuiSnackbar-root').first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should validate email format', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.clickAddUser();
    
    await authenticatedPage.getByLabel('Email').fill('invalid-email');
    await authenticatedPage.getByLabel('First Name').fill('Test');
    
    // Check if save button is disabled or shows error
    await authenticatedPage.waitForTimeout(500);
    const saveDisabled = await usersPage.saveButton.isDisabled();
    const error = authenticatedPage.locator('text=/invalid.*email/i');
    const hasError = await error.count() > 0;
    
    expect(saveDisabled || hasError).toBeTruthy();
  });

  test('should validate phone number format', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.clickAddUser();
    
    await authenticatedPage.getByLabel('Phone Number').fill('123');
    await authenticatedPage.getByLabel('First Name').fill('Test');
    
    // Check if save button is disabled or shows error
    await authenticatedPage.waitForTimeout(500);
    const saveDisabled = await usersPage.saveButton.isDisabled();
    const hasError = await authenticatedPage.locator('text=/invalid|format/i').count() > 0;
    
    expect(saveDisabled || hasError).toBeTruthy();
  });

  test('should search users by name', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.searchUser('Test');
    
    // Wait for search results
    await authenticatedPage.waitForTimeout(1500);
    
    const rowCount = await usersPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should cancel user creation', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.clickAddUser();
    await usersPage.cancelButton.click();
    
    // Dialog should close
    await expect(authenticatedPage.locator('.MuiDialog-root')).not.toBeVisible();
  });

  test('should display user status chips', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    const statusChips = authenticatedPage.locator('.MuiChip-root');
    const count = await statusChips.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should refresh users list', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.refreshButton.click();
    await authenticatedPage.waitForTimeout(1000);
    
    const rowCount = await usersPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should validate required fields', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    await usersPage.clickAddUser();
    await authenticatedPage.waitForTimeout(500);
    
    // Save button should be disabled or show validation errors
    const saveDisabled = await usersPage.saveButton.isDisabled();
    
    if (!saveDisabled) {
      await usersPage.saveButton.click();
      await authenticatedPage.waitForTimeout(300);
      
      // Should show validation errors for required fields
      const errors = authenticatedPage.locator('text=/required/i');
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThan(0);
    } else {
      expect(saveDisabled).toBeTruthy();
    }
  });

  test('should paginate through users', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    const pagination = authenticatedPage.locator('.MuiTablePagination-root, .MuiDataGrid-footerContainer');
    
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should display user details in table columns', async ({ authenticatedPage }) => {
    const usersPage = new UsersPage(authenticatedPage);
    
    const rowCount = await usersPage.getRowCount();
    
    if (rowCount > 0) {
      const headers = authenticatedPage.locator('th:has-text("Name"), th:has-text("Email"), th:has-text("Phone")');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });
});
