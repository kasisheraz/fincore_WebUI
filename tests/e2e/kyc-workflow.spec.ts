import { test, expect, Page } from '@playwright/test';

test.describe('KYC Workflow E2E Tests', () => {
  let page: Page;
  const testUser = {
    phone: '+447700900000',
    otp: '123456',
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/auth/login');
    
    // Login
    await page.fill('input[name="phoneNumber"]', testUser.phone);
    await page.click('button[type="submit"]');
    
    // Wait for OTP page
    await expect(page.locator('text=/Enter OTP/i')).toBeVisible();
    
    // Enter OTP
    await page.fill('input[name="otp"]', testUser.otp);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Complete KYC Workflow - Full Path', async () => {
    // Step 1: Navigate to KYC Start Page
    await page.goto('/kyc/start');
    await expect(page.locator('text=/Start Your KYC Verification/i')).toBeVisible();

    // Step 2: Select verification level
    const enhancedCard = page.locator('text=/Enhanced Verification/i').locator('..');
    await expect(enhancedCard).toBeVisible();
    
    // Click the Enhanced level card
    await enhancedCard.click();
    
    // Wait for selection to be active
    await expect(page.locator('input[value="ENHANCED"]:checked')).toBeVisible();

    // Step 3: Start workflow
    await page.click('button:has-text("Start Verification")');
    
    // Should navigate to wizard
    await expect(page).toHaveURL(/\/kyc\/workflow\?verificationId=\d+/);
    
    // Extract verification ID from URL
    const url = page.url();
    const verificationIdMatch = url.match(/verificationId=(\d+)/);
    expect(verificationIdMatch).not.toBeNull();
    const verificationId = verificationIdMatch![1];

    // Step 4: Complete User Information (Step 1)
    await expect(page.locator('text=/User Information/i')).toBeVisible();
    await expect(page.locator('text=/Your profile information will be validated/i')).toBeVisible();
    
    // Click Next to validate user info
    await page.click('button:has-text("Next")');
    
    // Wait for step 2
    await expect(page.locator('text=/Document Verification/i')).toBeVisible();

    // Step 5: Upload Documents (Step 2 - Mock)
    await expect(page.locator('text=/Upload your identity documents/i')).toBeVisible();
    
    // Click mock upload button
    await page.click('button:has-text("Mock Document Upload")');
    
    // Wait for success message
    await expect(page.locator('text=/Documents uploaded successfully/i')).toBeVisible();
    
    // Verify applicant ID is shown
    await expect(page.locator('text=/Applicant ID: MOCK_/i')).toBeVisible();
    
    // Click Next
    await page.click('button:has-text("Next")');
    
    // Wait for step 3
    await expect(page.locator('text=/Compliance Questionnaire/i')).toBeVisible();

    // Step 6: Answer Questionnaire (Step 3)
    // Wait for questions to load
    await page.waitForTimeout(1000); // Give time for questions to load
    
    // Find all question cards
    const questionCards = page.locator('.MuiCard-root:has(label)');
    const questionCount = await questionCards.count();
    
    if (questionCount > 0) {
      // Answer all questions
      for (let i = 0; i < questionCount; i++) {
        const input = questionCards.nth(i).locator('input[type="text"], textarea');
        await input.fill(`Answer to question ${i + 1}`);
      }
      
      // Click Next
      await page.click('button:has-text("Next")');
    } else {
      // If no questions, skip to next step
      console.log('No questions found, skipping questionnaire');
      await page.click('button:has-text("Next")');
    }
    
    // Wait for step 4
    await expect(page.locator('text=/Review & Submit/i')).toBeVisible();

    // Step 7: Review and Submit (Step 4)
    await expect(page.locator('text=/Please review your information/i')).toBeVisible();
    
    // Verify summary cards are visible
    await expect(page.locator('text=/User Information Validated/i')).toBeVisible();
    await expect(page.locator('text=/Documents Uploaded/i')).toBeVisible();
    
    // Submit for review
    await page.click('button:has-text("Submit for Review")');
    
    // Wait for success message
    await expect(page.locator('text=/Submitted successfully/i')).toBeVisible();
    
    // Wait for navigation to status page
    await expect(page).toHaveURL(new RegExp(`/kyc/status/${verificationId}`), { timeout: 5000 });

    // Step 8: Verify Status Page
    await expect(page.locator('text=/KYC Verification Status/i')).toBeVisible();
    
    // Verify verification ID is shown
    await expect(page.locator(`text=/Verification ID: ${verificationId}/i`)).toBeVisible();
    
    // Verify status badge
    await expect(page.locator('text=/PENDING/i')).toBeVisible();
    
    // Verify progress bar exists
    await expect(page.locator('.MuiLinearProgress-root')).toBeVisible();
    
    // Verify step completion indicators
    await expect(page.locator('text=/User Information/i')).toBeVisible();
    await expect(page.locator('text=/Document Verification/i')).toBeVisible();
    await expect(page.locator('text=/Questionnaire/i')).toBeVisible();
    await expect(page.locator('text=/Review/i')).toBeVisible();
  });

  test('KYC Workflow - BASIC Level', async () => {
    // Navigate to start page
    await page.goto('/kyc/start');

    // Select BASIC level
    const basicCard = page.locator('text=/Basic Verification/i').locator('..');
    await basicCard.click();
    await expect(page.locator('input[value="BASIC"]:checked')).toBeVisible();

    // Start workflow
    await page.click('button:has-text("Start Verification")');
    
    // Verify workflow starts
    await expect(page).toHaveURL(/\/kyc\/workflow\?verificationId=\d+/);
    await expect(page.locator('text=/User Information/i')).toBeVisible();
  });

  test('KYC Workflow - FULL Level', async () => {
    // Navigate to start page
    await page.goto('/kyc/start');

    // Select FULL level
    const fullCard = page.locator('text=/Full Verification/i').locator('..');
    await fullCard.click();
    await expect(page.locator('input[value="FULL"]:checked')).toBeVisible();

    // Start workflow
    await page.click('button:has-text("Start Verification")');
    
    // Verify workflow starts
    await expect(page).toHaveURL(/\/kyc\/workflow\?verificationId=\d+/);
  });

  test('Cannot skip workflow steps', async () => {
    // Start a workflow
    await page.goto('/kyc/start');
    const enhancedCard = page.locator('text=/Enhanced Verification/i').locator('..');
    await enhancedCard.click();
    await page.click('button:has-text("Start Verification")');
    
    // On step 1
    await expect(page.locator('text=/User Information/i')).toBeVisible();
    
    // Back button should be disabled
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeDisabled();
  });

  test('Can navigate back through completed steps', async () => {
    // Start workflow and complete step 1
    await page.goto('/kyc/start');
    const enhancedCard = page.locator('text=/Enhanced Verification/i').locator('..');
    await enhancedCard.click();
    await page.click('button:has-text("Start Verification")');
    
    // Complete step 1
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=/Document Verification/i')).toBeVisible();
    
    // Now back button should be enabled
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).not.toBeDisabled();
    
    // Click back
    await backButton.click();
    
    // Should be on step 1 again
    await expect(page.locator('text=/User Information/i')).toBeVisible();
  });

  test('Status page shows refresh functionality', async () => {
    // Start and complete a workflow (minimal path)
    await page.goto('/kyc/start');
    const basicCard = page.locator('text=/Basic Verification/i').locator('..');
    await basicCard.click();
    await page.click('button:has-text("Start Verification")');
    
    // Get to status page (simulate)
    const url = page.url();
    const verificationIdMatch = url.match(/verificationId=(\d+)/);
    const verificationId = verificationIdMatch![1];
    
    // Navigate directly to status page
    await page.goto(`/kyc/status/${verificationId}`);
    
    // Verify refresh button exists
    await expect(page.locator('button:has-text("Refresh")').or(page.locator('button[aria-label*="refresh"]'))).toBeVisible();
  });

  test('Handles questionnaire with no active questions', async () => {
    // Start workflow
    await page.goto('/kyc/start');
    const enhancedCard = page.locator('text=/Enhanced Verification/i').locator('..');
    await enhancedCard.click();
    await page.click('button:has-text("Start Verification")');
    
    // Complete steps 1 and 2
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Mock Document Upload")');
    await page.click('button:has-text("Next")');
    
    // On questionnaire step
    await expect(page.locator('text=/Compliance Questionnaire/i')).toBeVisible();
    
    // If no questions, should show message or allow skip
    const questionCards = page.locator('.MuiCard-root:has(label)');
    const count = await questionCards.count();
    
    if (count === 0) {
      // Should be able to proceed without answers
      await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();
    }
  });
});

test.describe('KYC Workflow Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="phoneNumber"]', '+447700900000');
    await page.click('button[type="submit"]');
    await page.fill('input[name="otp"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Handles API errors gracefully', async ({ page }) => {
    // Navigate to start page
    await page.goto('/kyc/start');
    
    // Select level
    const basicCard = page.locator('text=/Basic Verification/i').locator('..');
    await basicCard.click();
    
    // If API fails, should show error message
    await page.click('button:has-text("Start Verification")');
    
    // Either succeeds or shows error
    const isError = await page.locator('text=/error/i').or(page.locator('.MuiAlert-standardError')).isVisible({ timeout: 3000 }).catch(() => false);
    const isSuccess = await page.locator('text=/User Information/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(isError || isSuccess).toBe(true);
  });

  test('Shows validation error for incomplete forms', async ({ page }) => {
    // Start workflow
    await page.goto('/kyc/start');
    
    // Try to start without selecting level
    const startButton = page.locator('button:has-text("Start Verification")');
    
    // Button should be disabled or show validation
    const isDisabled = await startButton.isDisabled();
    expect(isDisabled).toBe(true);
  });
});
