# FinCore WebUI - E2E Testing Guide

## ✅ Recommendation: **Keep Tests in Same Project**

After analyzing your project, I recommend **integrating Playwright tests into this repository** rather than creating a separate project.

### Why Keep Tests in Same Repo?

✅ **Single Source of Truth** - Tests live with the code  
✅ **Easier Maintenance** - Update tests when you update features  
✅ **Shared Config** - Use same TypeScript, env vars, dependencies  
✅ **Simpler CI/CD** - One pipeline for build + test  
✅ **Better Developer Experience** - Run tests locally without switching repos  
✅ **Version Synchronization** - Tests always match app version  

---

## 🎯 What's Been Created

### 1. **Complete Test Suite** - 10 Test Categories
- ✅ Authentication (8 tests)
- ✅ Dashboard (7 tests)
- ✅ Organizations (11 tests)
- ✅ Users (10 tests)
- ✅ KYC Documents & Verification (7 tests)
- ✅ Questionnaire (9 tests)
- ✅ Applications (10 tests)
- ✅ Navigation (9 tests)
- ✅ Theme & UI (9 tests)
- ✅ Accessibility (10 tests)

**Total: 90+ comprehensive E2E tests**

### 2. **Test Infrastructure**
- ✅ Playwright configuration for multiple browsers
- ✅ Page Object Models for maintainability
- ✅ Test fixtures for authentication
- ✅ Test data generators
- ✅ Helper utilities
- ✅ GitHub Actions CI/CD workflow

### 3. **Documentation**
- ✅ Complete README with usage instructions
- ✅ Test structure documentation
- ✅ Best practices guide
- ✅ Debugging tips

---

## 🚀 Quick Start

### 1. **Run All Tests**
```bash
npm run test:e2e
```

### 2. **Run Tests with UI** (Recommended for Development)
```bash
npm run test:e2e:ui
```

### 3. **Run Tests in Headed Mode**
```bash
npm run test:e2e:headed
```

### 4. **Debug Tests**
```bash
npm run test:e2e:debug
```

### 5. **View Test Report**
```bash
npm run test:e2e:report
```

### 6. **Generate Test Code**
```bash
npm run test:e2e:codegen
```

---

## 📁 Project Structure

```
fincore_WebUI/
├── tests/
│   ├── e2e/
│   │   ├── fixtures/          # Auth fixtures & helpers
│   │   ├── helpers/           # Test data generators
│   │   ├── pages/             # Page Object Models
│   │   └── tests/             # Test specifications
│   └── README.md
├── playwright.config.ts       # Playwright configuration
├── .github/
│   └── workflows/
│       └── playwright.yml     # CI/CD pipeline
└── package.json               # Updated with test scripts
```

---

## 🧪 Test Coverage

### Authentication Tests
- Login/Logout flow
- OTP verification
- Form validation
- Protected routes
- Session persistence

### Dashboard Tests
- Stats cards display
- Recent items tables
- Navigation
- Progress indicators

### CRUD Operations
- Organizations management
- Users management
- Full CRUD operations
- Search & filter
- Pagination
- Sorting

### KYC Tests
- Document upload
- Document verification
- Status tracking

### Questionnaire Tests
- Question management
- Form builder
- Status management

### Applications Tests
- Application workflow
- Status tracking
- Progress monitoring

### Navigation Tests
- Sidebar navigation
- Route switching
- Active states
- Breadcrumbs

### Theme Tests
- Dark/Light mode
- Responsive design
- Mobile/Tablet views
- Loading states

### Accessibility Tests
- ARIA labels
- Keyboard navigation
- Semantic HTML
- Form labels
- Screen reader support

---

## 🎨 Page Object Model Pattern

Tests use the **Page Object Model** for better maintainability:

```typescript
import { LoginPage } from '../pages/LoginPage';

test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(phoneNumber, otp);
  await loginPage.waitForDashboard();
});
```

Benefits:
- ✅ Reusable code
- ✅ Easy maintenance
- ✅ Clear test intentions
- ✅ Single point of change

---

## 🔧 Configuration

**Browsers Tested:**
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari
- ✅ Microsoft Edge
- ✅ Google Chrome

**Features:**
- ✅ Parallel execution
- ✅ Automatic retries (2x in CI)
- ✅ Screenshots on failure
- ✅ Video recording on failure
- ✅ Trace collection
- ✅ Multiple report formats (HTML, JSON, JUnit)

---

## 🤖 CI/CD Integration

Tests automatically run on:
- ✅ Push to `main` or `develop`
- ✅ Pull requests
- ✅ Multiple Node.js versions (18.x, 20.x)

Reports are uploaded as artifacts for review.

---

## 📊 Running Specific Tests

### Run single file:
```bash
npx playwright test tests/e2e/tests/01-auth.spec.ts
```

### Run by test name:
```bash
npx playwright test -g "should login"
```

### Run in specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run only failed tests:
```bash
npx playwright test --last-failed
```

---

## 🐛 Debugging

### Visual Debugging
```bash
npm run test:e2e:ui
```
Opens Playwright UI where you can:
- See all tests
- Run individual tests
- Watch tests execute
- Inspect locators
- View trace

### Step-by-Step Debugging
```bash
npm run test:e2e:debug
```

### Generate New Tests
```bash
npm run test:e2e:codegen
```
Opens your app and records your actions as test code!

---

## 📝 Writing New Tests

### 1. Create test file in `tests/e2e/tests/`

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test.describe('My Feature Tests', () => {
  test('should do something', async ({ authenticatedPage }) => {
    // authenticatedPage is already logged in
    await authenticatedPage.goto('/my-page');
    
    // Your test assertions
    await expect(authenticatedPage.locator('h1')).toHaveText('My Page');
  });
});
```

### 2. Create Page Object (if needed) in `tests/e2e/pages/`

```typescript
import { Page, Locator } from '@playwright/test';

export class MyPage {
  readonly page: Page;
  readonly title: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
  }
  
  async goto() {
    await this.page.goto('/my-page');
  }
}
```

---

## 🎯 Best Practices

1. ✅ **Use Page Objects** - Encapsulate page interactions
2. ✅ **Use Fixtures** - Reuse auth and setup logic
3. ✅ **Generate Unique Data** - Avoid conflicts with `generateUniqueId()`
4. ✅ **Wait Properly** - Use `waitFor` instead of `setTimeout`
5. ✅ **Make Tests Independent** - Each test should run standalone
6. ✅ **Use Descriptive Names** - Clear test descriptions
7. ✅ **Group Related Tests** - Use `test.describe` blocks
8. ✅ **Clean Up** - Remove test data after tests
9. ✅ **Handle Async** - Always await async operations
10. ✅ **Use Proper Selectors** - Prefer data-testid or aria-labels

---

## 📈 Next Steps

### 1. **Start the Dev Server**
```bash
npm start
```

### 2. **Run Your First Test**
```bash
npm run test:e2e:ui
```

### 3. **Review Test Results**
```bash
npm run test:e2e:report
```

### 4. **Integrate into CI/CD**
The GitHub Actions workflow is already configured!

### 5. **Add More Tests**
Extend tests as you add new features to your application.

---

## 🆘 Troubleshooting

### Tests fail with timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Check network speed

### Element not found
- Check selector
- Wait for element to be visible
- Check if page loaded correctly

### Tests pass locally but fail in CI
- Check environment variables
- Check CI timeout settings
- Review CI logs and screenshots

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Test README](tests/README.md)
- [Page Object Models](tests/e2e/pages/)
- [Test Examples](tests/e2e/tests/)

---

## ✨ Summary

You now have:
- ✅ **90+ comprehensive E2E tests**
- ✅ **Page Object Models for maintainability**
- ✅ **Multi-browser testing**
- ✅ **CI/CD integration**
- ✅ **Complete documentation**
- ✅ **Debug & development tools**

**All integrated into your existing project! 🎉**

Start testing with: `npm run test:e2e:ui`
