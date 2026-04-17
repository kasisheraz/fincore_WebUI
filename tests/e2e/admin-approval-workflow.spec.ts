import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Admin Approval Workflow
 * Tests the complete organization approval process including:
 * - Submit for Review button for organization owners
 * - Admin approve/reject functionality
 * - Rejection feedback display
 * - Resubmission workflow
 */

test.describe('Admin Approval Workflow', () => {
  let organizationId: number;
  let organizationName: string;

  test.beforeEach(async ({ page }) => {
    // Will be run before each test - login happens via global setup
    await page.goto('/');
  });

  test.describe('Organization Owner Flow', () => {
    test('should create organization and submit for review', async ({ page }) => {
      // Navigate to organizations page
      await page.goto('/organizations');
      await expect(page).toHaveURL(/.*organizations/);

      // Click create button
      await page.click('button:has-text("Add Organization")');
      
      // Fill organization form
      organizationName = `Test Org ${Date.now()}`;
      await page.fill('[name="legalName"]', organizationName);
      await page.selectOption('[name="organisationType"]', 'CORPORATION');
      await page.fill('[name="registrationNumber"]', `REG${Date.now()}`);
      await page.fill('[name="email"]', `test${Date.now()}@example.com`);
      await page.fill('[name="phoneNumber"]', '+1234567890');
      
      // Submit form
      await page.click('button:has-text("Create")');
      
      // Wait for success message
      await expect(page.locator('.MuiAlert-message:has-text("Organization created successfully")')).toBeVisible({ timeout: 10000 });
      
      // Verify organization appears in list with PENDING status
      await expect(page.locator(`text=${organizationName}`)).toBeVisible();
      const row = page.locator('tr').filter({ hasText: organizationName });
      await expect(row.locator('[data-testid="status-chip"]:has-text("PENDING")')).toBeVisible();
    });

    test('should see Submit for Review button on PENDING organization', async ({ page }) => {
      await page.goto('/organizations');
      
      // Find a PENDING organization
      const pendingRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("PENDING")') }).first();
      
      // Should see Submit for Review button (blue send icon)
      await expect(pendingRow.locator('button[aria-label="Submit for Review"]')).toBeVisible();
    });

    test('should submit organization for review', async ({ page }) => {
      await page.goto('/organizations');
      
      // Find a PENDING organization
      const pendingRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("PENDING")') }).first();
      const orgName = await pendingRow.locator('td').nth(1).textContent();
      
      // Click Submit for Review
      await pendingRow.locator('button[aria-label="Submit for Review"]').click();
      
      // Wait for success message
      await expect(page.locator('.MuiAlert-message:has-text("submitted for review successfully")')).toBeVisible();
      
      // Verify status changed to UNDER_REVIEW
      const updatedRow = page.locator('tr').filter({ hasText: orgName! });
      await expect(updatedRow.locator('[data-testid="status-chip"]:has-text("UNDER_REVIEW")')).toBeVisible();
    });

    test('should not see Submit button on UNDER_REVIEW organization', async ({ page }) => {
      await page.goto('/organizations');
      
      // Find an UNDER_REVIEW organization
      const reviewRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("UNDER_REVIEW")') }).first();
      
      if (await reviewRow.count() > 0) {
        // Should NOT see Submit for Review button
        await expect(reviewRow.locator('button[aria-label="Submit for Review"]')).not.toBeVisible();
      }
    });
  });

  test.describe('Admin Flow', () => {
    test.use({ storageState: 'tests/e2e/.auth/adminStorageState.json' });

    test('should see Approve and Reject buttons on UNDER_REVIEW organizations', async ({ page }) => {
      await page.goto('/organizations');
      
      // Filter by UNDER_REVIEW status
      await page.click('button:has-text("Filters")');
      await page.selectOption('[name="status"]', 'UNDER_REVIEW');
      await page.click('button:has-text("Apply")');
      
      // Find first UNDER_REVIEW organization
      const reviewRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("UNDER_REVIEW")') }).first();
      
      if (await reviewRow.count() > 0) {
        // Should see Approve button (green)
        await expect(reviewRow.locator('button[aria-label="Approve"]')).toBeVisible();
        
        // Should see Reject button (red)
        await expect(reviewRow.locator('button[aria-label="Reject"]')).toBeVisible();
      }
    });

    test('should approve organization successfully', async ({ page }) => {
      await page.goto('/organizations');
      
      // Find an UNDER_REVIEW organization
      const reviewRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("UNDER_REVIEW")') }).first();
      const orgName = await reviewRow.locator('td').nth(1).textContent();
      
      // Click Approve
      await reviewRow.locator('button[aria-label="Approve"]').click();
      
      // Wait for success message
      await expect(page.locator('.MuiAlert-message:has-text("approved successfully")')).toBeVisible();
      
      // Verify status changed to ACTIVE
      const updatedRow = page.locator('tr').filter({ hasText: orgName! });
      await expect(updatedRow.locator('[data-testid="status-chip"]:has-text("ACTIVE")')).toBeVisible();
    });

    test('should reject organization with feedback', async ({ page }) => {
      await page.goto('/organizations');
      
      // Find an UNDER_REVIEW organization
      const reviewRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("UNDER_REVIEW")') }).first();
      const orgName = await reviewRow.locator('td').nth(1).textContent();
      
      // Click Reject
      await reviewRow.locator('button[aria-label="Reject"]').click();
      
      // Wait for rejection dialog
      await expect(page.locator('text=Reject Organization')).toBeVisible();
      
      // Select first document
      const firstCheckbox = page.locator('[type="checkbox"]').first();
      await firstCheckbox.check();
      
      // Enter rejection reason
      await page.fill('[label="Rejection Reason"]', 'Document is blurry and expiration date is not clearly visible');
      
      // Submit rejection
      await page.click('button:has-text("Reject Organization")');
      
      // Wait for success message
      await expect(page.locator('.MuiAlert-message:has-text("rejected successfully")')).toBeVisible();
      
      // Verify status changed to REQUIRES_RESUBMISSION
      const updatedRow = page.locator('tr').filter({ hasText: orgName! });
      await expect(updatedRow.locator('[data-testid="status-chip"]:has-text("REQUIRES_RESUBMISSION")')).toBeVisible();
    });
  });

  test.describe('Rejection Feedback Display', () => {
    test('should display rejection alert on Organizations page', async ({ page }) => {
      await page.goto('/organizations');
      
      // Check if there are any rejected organizations
      const rejectedOrg = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("REQUIRES_RESUBMISSION")') }).first();
      
      if (await rejectedOrg.count() > 0) {
        // Should see rejection alert
        await expect(page.locator('.MuiAlert-root:has-text("rejected and require resubmission")')).toBeVisible();
        
        // Alert should contain organization name and rejection summary
        const alert = page.locator('.MuiAlert-root:has-text("rejected and require resubmission")');
        await expect(alert.locator('text=/\\d+ of \\d+ documents rejected/')).toBeVisible();
      }
    });

    test('should display rejection feedback in KYC documents page', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Check if there are any rejected documents
      const rejectedDoc = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("REJECTED")') }).first();
      
      if (await rejectedDoc.count() > 0) {
        // Should see rejection alert
        await expect(page.locator('.MuiAlert-root:has-text("documents have been rejected")')).toBeVisible();
        
        // Should see rejection reason in the table
        await expect(rejectedDoc.locator('td:has-text("Admin Feedback")')).toBeVisible();
      }
    });

    test('should see rejection reason column in KYC documents table', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Verify Admin Feedback column exists
      await expect(page.locator('th:has-text("Admin Feedback")')).toBeVisible();
      
      // Find rejected document
      const rejectedDoc = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("REJECTED")'  ) }).first();
      
      if (await rejectedDoc.count() > 0) {
        // Rejection reason should be visible (not just "-")
        const feedbackCell = rejectedDoc.locator('td').filter({ has: page.locator('[title]') });
        await expect(feedbackCell).toBeVisible();
        
        // Hover to see full tooltip
        await feedbackCell.hover();
        await expect(page.locator('.MuiTooltip-popper')).toBeVisible();
      }
    });
  });

  test.describe('Resubmission Workflow', () => {
    test('should allow resubmission of rejected organization', async ({ page }) => {
      await page.goto('/organizations');
      
      // Find a REQUIRES_RESUBMISSION organization
      const rejectedRow = page.locator('tr').filter({ has: page.locator('[data-testid="status-chip"]:has-text("REQUIRES_RESUBMISSION")') }).first();
      
      if (await rejectedRow.count() > 0) {
        const orgName = await rejectedRow.locator('td').nth(1).textContent();
        
        // Should see Submit for Review button
        await expect(rejectedRow.locator('button[aria-label="Submit for Review"]')).toBeVisible();
        
        // Click Submit for Review
        await rejectedRow.locator('button[aria-label="Submit for Review"]').click();
        
        // Wait for success message
        await expect(page.locator('.MuiAlert-message:has-text("submitted for review successfully")')).toBeVisible();
        
        // Verify status changed to UNDER_REVIEW
        const updatedRow = page.locator('tr').filter({ hasText: orgName! });
        await expect(updatedRow.locator('[data-testid="status-chip"]:has-text("UNDER_REVIEW")')).toBeVisible();
      }
    });
  });
});
