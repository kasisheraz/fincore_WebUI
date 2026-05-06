import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for UAT Smoke Tests
 * Lightweight tests that run after UAT deployment
 */
export default defineConfig({
  testDir: './tests/uat-smoke',
  
  // Shorter timeout for smoke tests
  timeout: 60 * 1000, // 60 seconds per test
  
  // Test execution configuration
  fullyParallel: false, // Run sequentially for smoke tests
  forbidOnly: true,
  retries: 2, // Retry flaky tests in UAT
  workers: 1, // Sequential execution for smoke tests
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'uat-smoke-report', open: 'never' }],
    ['json', { outputFile: 'uat-smoke-results/results.json' }],
    ['junit', { outputFile: 'uat-smoke-results/junit.xml' }],
    ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // UAT Environment URL
    baseURL: process.env.UAT_BASE_URL || 'https://fincore-webui-uat-994490239798.europe-west2.run.app',
    
    // API URL for direct API tests
    apiURL: process.env.UAT_API_URL || 'https://fincore-uat-api-994490239798.europe-west2.run.app',
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure only to save storage
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 15 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'uat-smoke-results/',
});
