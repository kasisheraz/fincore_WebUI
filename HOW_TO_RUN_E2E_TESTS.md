# How to Run E2E Tests

## ⚠️ Important Prerequisites

E2E (End-to-End) tests require the application to be **running** before executing the tests. The tests use Playwright to open a real browser and interact with your application.

---

## 🚀 Running E2E Tests - The Right Way

### Option 1: Run with Development Server (Recommended for Development)

**Step 1: Start the Development Server**
```powershell
# Terminal 1 - Start dev server
npm start

# Wait for the message:
# "webpack compiled with 1 warning"
# "Compiled successfully!"
# Application runs at http://localhost:3000
```

**Step 2: Run E2E Tests (in a NEW terminal)**
```powershell
# Terminal 2 - Run tests while dev server is running
npm run test:e2e tests/e2e/crud-operations.spec.ts

# Or run all E2E tests
npm run test:e2e
```

---

### Option 2: Run with Production Build (Faster, Better for CI/CD)

**Step 1: Build the Application**
```powershell
npm run build

# Wait for:
# "The build folder is ready to be deployed."
```

**Step 2: Serve the Production Build**
```powershell
# Install 'serve' if you don't have it
npm install -g serve

# Serve the build folder
serve -s build -l 3000
```

**Step 3: Run E2E Tests (in a NEW terminal)**
```powershell
# Terminal 2
npm run test:e2e tests/e2e/crud-operations.spec.ts
```

---

### Option 3: Automated - Use npm Scripts (Coming Soon)

We can add a script to package.json to automate this:

```json
{
  "scripts": {
    "test:e2e:ci": "start-server-and-test start http://localhost:3000 'playwright test'",
    "test:e2e:build": "start-server-and-test 'serve -s build -l 3000' http://localhost:3000 'playwright test'"
  }
}
```

---

## 🐛 Why Did Tests Fail?

When you ran:
```powershell
npm run test:e2e tests/e2e/crud-operations.spec.ts
```

**Result:** ❌ All 32 tests failed with timeouts (11-15 seconds each)

**Reason:**
- Playwright opened a browser and tried to navigate to `http://localhost:3000/login`
- But there was **no server running** to serve the application
- The browser showed a "Cannot connect" or blank page
- Tests waited for elements that never appeared → timeout

**Fix:** Always start the dev server FIRST before running E2E tests.

---

## ✅ Expected Test Results (When Run Correctly)

When the application is running, you should see:

```
Running 39 tests using 4 workers

  ✓ [chromium] › crud-operations.spec.ts:18:7 › CRUD Operations - All Pages › Users CRUD Operations › should navigate to users page and verify buttons (2.5s)
  ✓ [chromium] › crud-operations.spec.ts:27:7 › CRUD Operations - All Pages › Users CRUD Operations › should create a new user (3.1s)
  ✓ [chromium] › crud-operations.spec.ts:47:7 › CRUD Operations - All Pages › Users CRUD Operations › should edit an existing user (2.8s)
  ... (36 more tests)

39 passed (1.5m)
```

---

## 📋 Test Coverage Verification Checklist

Once tests are running properly, verify these button actions work:

### Users Page
- [ ] Create User button opens form
- [ ] Edit User button opens dialog
- [ ] Delete User shows confirmation, then success message
- [ ] Refresh button reloads table

### Organizations Page
- [ ] Create Organization button opens form
- [ ] Edit Organization button opens dialog
- [ ] Delete Organization shows confirmation, then success message

### KYC Documents Page
- [ ] Upload Document button shows info message (placeholder)
- [ ] Approve button updates status
- [ ] Reject button updates status
- [ ] Delete button shows confirmation
- [ ] Refresh button reloads table

### KYC Verification Page
- [ ] New Verification button shows info message (placeholder)
- [ ] View Details button opens dialog
- [ ] Approve button updates status
- [ ] Reject button updates status

### Questionnaire Page
- [ ] Add Question button shows info message (placeholder)
- [ ] Edit button shows info message (placeholder)
- [ ] Activate button updates status
- [ ] Deactivate button updates status
- [ ] Delete button shows confirmation

### Customer Answers Page
- [ ] Submit Answer button shows info message (placeholder)
- [ ] Edit button shows info message (placeholder)
- [ ] Delete button shows confirmation

### Profile Page
- [ ] Edit Profile button opens dialog
- [ ] Save Changes button shows info snackbar

### Settings Page
- [ ] Save Settings button shows success snackbar
- [ ] Toggle switches update state
- [ ] Change Password button shows info snackbar
- [ ] Manage buttons in settings sections are clickable

---

## 🔍 Debugging Failed Tests

### If a specific test fails:

1. **Check the console output** - Look for specific error messages
2. **Run in headed mode** to see what's happening:
   ```powershell
   npx playwright test tests/e2e/crud-operations.spec.ts --headed
   ```
3. **Run with debug mode**:
   ```powershell
   npx playwright test tests/e2e/crud-operations.spec.ts --debug
   ```
4. **Run a single test**:
   ```powershell
   npx playwright test tests/e2e/crud-operations.spec.ts -g "should create a new user"
   ```

### Common Issues:

**Issue:** Test timeouts
- **Cause:** Application not running, or slow to load
- **Fix:** Ensure dev server is running, increase timeout in test

**Issue:** Element not found
- **Cause:** Button text doesn't match, or selector is wrong
- **Fix:** Check the actual button text in the UI, update test selector

**Issue:** Navigation fails
- **Cause:** Route doesn't exist, or auth redirect
- **Fix:** Check route in App.tsx, verify auth context

---

## 📊 Test Report

After tests complete, Playwright generates an HTML report:

```powershell
# View the report
npx playwright show-report
```

This opens a browser with:
- ✅ Test results (pass/fail)
- ⏱️ Execution times
- 📸 Screenshots (on failure)
- 🎥 Video recordings (if enabled)
- 📋 Detailed logs and traces

---

## 🎯 Quick Start Command Sequence

**For your first test run:**

```powershell
# Terminal 1 - Start dev server
npm start
# Wait for "Compiled successfully!"

# Terminal 2 - Run tests
npm run test:e2e tests/e2e/crud-operations.spec.ts

# View results
npx playwright show-report
```

---

## ⚡ Performance Tips

1. **Use headed mode only for debugging** - Headless is faster
2. **Run tests in parallel** - Playwright does this by default
3. **Use production build for CI/CD** - Faster than dev server
4. **Consider test sharding** for large test suites:
   ```powershell
   npx playwright test --shard=1/4
   ```

---

## 📝 Next Steps

Once all tests pass:

1. ✅ Verify manual testing in browser
2. ✅ Commit changes with test results
3. ✅ Set up CI/CD pipeline to run tests automatically
4. ✅ Add test reporting to pull requests
5. ✅ Implement remaining placeholder features

---

**Last Updated:** March 31, 2026  
**Test Suite:** crud-operations.spec.ts  
**Total Tests:** 39  
**Estimated Runtime:** 1-2 minutes (with server running)
