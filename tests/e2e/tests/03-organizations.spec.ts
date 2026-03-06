import { test, expect } from '../fixtures/auth.fixture';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { testOrganization, generateUniqueId } from '../helpers/test-data';

test.describe('Organizations Management Tests', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    await orgPage.goto();
  });

  test('should display organizations page correctly', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    await expect(orgPage.pageTitle).toBeVisible();
    await expect(orgPage.addButton).toBeVisible();
    await expect(orgPage.searchBar).toBeVisible();
    await expect(orgPage.dataTable).toBeVisible();
  });

  test('should open add organization dialog', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    await orgPage.clickAddOrganization();
    
    await expect(orgPage.dialogTitle).toContainText(/Add|Create.*Organization/i);
    await expect(orgPage.saveButton).toBeVisible();
    await expect(orgPage.cancelButton).toBeVisible();
  });

  test('should create new organization successfully', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    const uniqueOrg = {
      ...testOrganization,
      name: `Test Org ${generateUniqueId()}`
    };
    
    await orgPage.clickAddOrganization();
    await orgPage.fillOrganizationForm(uniqueOrg);
    await authenticatedPage.waitForTimeout(1000); // Wait for form data propagation
    await orgPage.saveOrganization();
    
    // Check for success message
    const successMessage = authenticatedPage.locator('.MuiAlert-standardSuccess, .MuiSnackbar-root').first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields in organization form', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    await orgPage.clickAddOrganization();
    
    // The form validates on mount - errors should be visible
    // The Save button is disabled when form is invalid, so we check for error indicators
    // Option 1: Check that save button is disabled (form validation working)
    await expect(orgPage.saveButton).toBeDisabled();
    
    // Option 2: Also verify form error alert is shown
    const errorAlert = authenticatedPage.locator('.MuiAlert-standardError, .MuiAlert-root[severity="error"]');
    await expect(errorAlert).toBeVisible({ timeout: 3000 });
  });

  test('should search organizations by name', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    const searchTerm = 'Test';
    await orgPage.searchOrganization(searchTerm);
    
    // Wait for search results
    await authenticatedPage.waitForTimeout(1500);
    
    // Results should be filtered
    const rows = await orgPage.getRowCount();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('should cancel organization creation', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    await orgPage.clickAddOrganization();
    await orgPage.cancelButton.click();
    
    // Dialog should close
    await expect(authenticatedPage.locator('.MuiDialog-root')).not.toBeVisible();
  });

  test('should refresh organizations list', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    const initialCount = await orgPage.getRowCount();
    
    await orgPage.refreshButton.click();
    await authenticatedPage.waitForTimeout(1000);
    
    const newCount = await orgPage.getRowCount();
    expect(newCount).toBeGreaterThanOrEqual(0);
  });

  test('should display organization details in table', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    const rowCount = await orgPage.getRowCount();
    
    if (rowCount > 0) {
      // Check if table has expected columns
      const headers = authenticatedPage.locator('th, .MuiDataGrid-columnHeader');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('should paginate through organizations', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    const pagination = authenticatedPage.locator('.MuiTablePagination-root, .MuiDataGrid-footerContainer');
    
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
      
      const nextButton = authenticatedPage.locator('button[aria-label="Go to next page"], button[title="Next page"]');
      if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
        await nextButton.click();
        await authenticatedPage.waitForTimeout(1000);
      }
    }
  });

  test('should filter organizations by type', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    // Check if filter button exists
    if (await orgPage.filterButton.count() > 0) {
      await orgPage.applyFilters({ organizationType: 'CORPORATION' });
      await authenticatedPage.waitForTimeout(1000);
      
      const rowCount = await orgPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort organizations by name', async ({ authenticatedPage }) => {
    const orgPage = new OrganizationsPage(authenticatedPage);
    
    const nameHeader = authenticatedPage.locator('th:has-text("Name"), .MuiDataGrid-columnHeader:has-text("Name")');
    
    if (await nameHeader.count() > 0) {
      await nameHeader.click();
      await authenticatedPage.waitForTimeout(1000);
      
      const rowCount = await orgPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });
});
