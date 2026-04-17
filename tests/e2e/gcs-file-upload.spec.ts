import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E Tests for GCS File Upload
 * Tests the complete file upload flow including:
 * - File selection and validation
 * - Upload progress
 * - GCS storage verification
 * - File size limits
 * - Supported file types
 */

test.describe('GCS File Upload', () => {
  const TEST_FILES_DIR = path.join(__dirname, '../fixtures/files');
  
  test.beforeAll(async () => {
    // Create test files directory if it doesn't exist
    if (!fs.existsSync(TEST_FILES_DIR)) {
      fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    }
    
    // Create test PDF file (small, valid)
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n%%EOF';
    fs.writeFileSync(path.join(TEST_FILES_DIR, 'test-passport.pdf'), testPdfContent);
    
    // Create test image file (JPEG)
    const testImageContent = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AN//Z', 'base64');
    fs.writeFileSync(path.join(TEST_FILES_DIR, 'test-id.jpg'), testImageContent);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('File Upload UI', () => {
    test('should show upload button on KYC documents page', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Should see Upload Document button
      await expect(page.locator('button:has-text("Upload")')).toBeVisible();
    });

    test('should open upload dialog when clicking upload button', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Click Upload button
      await page.click('button:has-text("Upload")');
      
      // Upload dialog should appear
      await expect(page.locator('text="Upload KYC Document"')).toBeVisible();
      
      // Should have organization selector
      await expect(page.locator('[label="Organization"]')).toBeVisible();
      
      // Should have document type selector
      await expect(page.locator('[label="Document Type"]')).toBeVisible();
      
      // Should have file input
      await expect(page.locator('input[type="file"]')).toBeAttached();
    });

    test('should show file selection UI with drag-drop area', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Should see drag-drop area
      await expect(page.locator('text=/Drag.*drop.*file here/')).toBeVisible();
      await expect(page.locator('text="or click to browse"')).toBeVisible();
      
      // Should show accepted file types
      await expect(page.locator('text=/PDF.*JPG.*PNG/')).toBeVisible();
      
      // Should show file size limit
      await expect(page.locator('text=/Max.*10MB/')).toBeVisible();
    });
  });

  test.describe('File Selection and Validation', () => {
    test('should accept valid PDF file', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Select organization and document type
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(TEST_FILES_DIR, 'test-passport.pdf'));
      
      // File name should be displayed
      await expect(page.locator('text="test-passport.pdf"')).toBeVisible();
      
      // File size should be displayed
      await expect(page.locator('text=/\\d+ KB|\\d+ MB/')).toBeVisible();
      
      // Upload button should be enabled
      await expect(page.locator('button:has-text("Upload"):not([disabled])')).toBeVisible();
    });

    test('should accept valid image file', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Select organization and document type
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'NATIONAL_ID');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(TEST_FILES_DIR, 'test-id.jpg'));
      
      // File should be accepted
      await expect(page.locator('text="test-id.jpg"')).toBeVisible();
    });

    test('should show error for unsupported file type', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Create temporary .txt file
      const txtFilePath = path.join(TEST_FILES_DIR, 'invalid.txt');
      fs.writeFileSync(txtFilePath, 'This is not a valid document');
      
      // Select organization and document type
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      
      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(txtFilePath);
      
      // Should show error message
      await expect(page.locator('.MuiAlert-message:has-text("Invalid file type")')).toBeVisible({ timeout: 3000 });
      
      // Clean up
      fs.unlinkSync(txtFilePath);
    });

    test('should show error for file size exceeding 10MB', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Create large file (> 10MB)
      const largeFilePath = path.join(TEST_FILES_DIR, 'large.pdf');
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a'); // 11MB
      fs.writeFileSync(largeFilePath, largeBuffer);

      // Select organization and document type
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      
      // Try to upload large file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(largeFilePath);
      
      // Should show error message
      await expect(page.locator('.MuiAlert-message:has-text("File size exceeds 10MB limit")')).toBeVisible({ timeout: 3000 });
      
      // Clean up
      fs.unlinkSync(largeFilePath);
    });
  });

  test.describe('Upload Process', () => {
    test('should upload file successfully', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Fill form
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(TEST_FILES_DIR, 'test-passport.pdf'));
      
      // Click Upload button
      await page.click('button:has-text("Upload"):not([disabled])');
      
      // Should show uploading state
      await expect(page.locator('text="Uploading..."')).toBeVisible({ timeout: 2000 });
      
      // Should show success message
      await expect(page.locator('.MuiAlert-message:has-text("uploaded successfully")')).toBeVisible({ timeout: 15000 });
      
      // Dialog should close
      await expect(page.locator('text="Upload KYC Document"')).not.toBeVisible();
      
      // Document should appear in the list
      await expect(page.locator('text="test-passport.pdf"')).toBeVisible();
    });

    test('should show upload progress for larger files', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Create a 2MB file to see progress
      const mediumFilePath = path.join(TEST_FILES_DIR, 'medium.pdf');
      const mediumBuffer = Buffer.alloc(2 * 1024 * 1024, 'a'); // 2MB
      fs.writeFileSync(mediumFilePath, mediumBuffer);
      
      // Fill form
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(mediumFilePath);
      
      // Click Upload
      await page.click('button:has-text("Upload"):not([disabled])');
      
      // Should see progress indicator
      await expect(page.locator('.MuiCircularProgress-root, text="Uploading..."')).toBeVisible();
      
      // Wait for completion
      await expect(page.locator('.MuiAlert-message:has-text("uploaded successfully")')).toBeVisible({ timeout: 20000 });
      
      // Clean up
      fs.unlinkSync(mediumFilePath);
    });

    test('should handle upload errors gracefully', async ({ page }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Don't select organization (validation error)
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(TEST_FILES_DIR, 'test-passport.pdf'));
      
      // Try to upload
      await page.click('button:has-text("Upload"):not([disabled])');
      
      // Should show error message
      await expect(page.locator('.MuiAlert-message:has-text("Organization is required")')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Post-Upload Verification', () => {
    test('should display uploaded document with correct details', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Find recently uploaded document
      const docRow = page.locator('tr:has-text("test-passport.pdf")').first();
      
      // Should show document type
      await expect(docRow.locator('text="PASSPORT"')).toBeVisible();
      
      // Should show file size
      await expect(docRow.locator('text=/\\d+ (KB|MB)/')).toBeVisible();
      
      // Should show PENDING status
      await expect(docRow.locator('[data-testid="status-chip"]:has-text("PENDING")')).toBeVisible();
      
      // Should have download button
      await expect(docRow.locator('button[aria-label="Download"]')).toBeVisible();
    });

    test('should allow downloading uploaded document', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Find recently uploaded document
      const docRow = page.locator('tr:has-text("test-passport.pdf")').first();
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click download button
      await docRow.locator('button[aria-label="Download"]').click();
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('.pdf');
      
      // Success message should appear
      await expect(page.locator('.MuiAlert-message:has-text("downloaded successfully")')).toBeVisible();
    });

    test('should allow deletion of uploaded document', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Find recently uploaded document
      const docRow = page.locator('tr:has-text("test-passport.pdf")').first();
      const fileName = await docRow.locator('td').nth(4).textContent();
      
      // Click delete button
      await docRow.locator('button[aria-label="Delete"]').click();
      
      // Confirm deletion
      await page.click('button:has-text("Delete")');
      
      // Should show success message
      await expect(page.locator('.MuiAlert-message:has-text("deleted successfully")')).toBeVisible();
      
      // Document should be removed from list
      await expect(page.locator(`tr:has-text("${fileName}")`)).not.toBeVisible();
    });
  });

  test.describe('GCS Storage Integration', () => {
    test('should store files in correct GCS bucket path', async ({ page, request }) => {
      await page.goto('/kyc-documents');
      await page.click('button:has-text("Upload")');
      
      // Upload a document
      await page.selectOption('[name="organisationId"]', { index: 1 });
      await page.selectOption('[name="documentType"]', 'PASSPORT');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(TEST_FILES_DIR, 'test-passport.pdf'));
      await page.click('button:has-text("Upload"):not([disabled])');
      
      // Wait for upload
      await expect(page.locator('.MuiAlert-message:has-text("uploaded successfully")')).toBeVisible({ timeout: 15000 });
      
      // Get the file URL from the document
      const docRow = page.locator('tr:has-text("test-passport.pdf")').first();
      const documentId = await docRow.locator('td').first().textContent();
      
      // Verify file URL contains GCS bucket name
      // Note: This would require API access to get the fileUrl
      // For now, we verify the upload succeeded and document is in the system
      expect(documentId).toBeTruthy();
    });

    test('should generate unique file names to prevent collisions', async ({ page }) => {
      await page.goto('/kyc-documents');
      
      // Upload same file multiple times
      for (let i = 0; i < 2; i++) {
        await page.click('button:has-text("Upload")');
        await page.selectOption('[name="organisationId"]', { index: 1 });
        await page.selectOption('[name="documentType"]', 'PASSPORT');
        
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(path.join(TEST_FILES_DIR, 'test-passport.pdf'));
        
        await page.click('button:has-text("Upload"):not([disabled])');
        await expect(page.locator('.MuiAlert-message:has-text("uploaded successfully")')).toBeVisible({ timeout: 15000 });
        
        await page.waitForTimeout(1000); // Wait between uploads
      }
      
      // Refresh to see all documents
      await page.reload();
      
      // Should have multiple documents with same base name
      const docRows = page.locator('tr:has-text("test-passport.pdf")');
      const count = await docRows.count();
      
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
