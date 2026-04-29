# FinCore WebUI - E2E Testing Suite

This directory contains comprehensive end-to-end tests for the FinCore WebUI application using Playwright.

## ⚠️ Important Test Maintenance Guidelines

**CRITICAL**: When making UI changes, **ALWAYS update corresponding tests**. Tests must be updated alongside feature development to:
- Prevent CI/CD pipeline failures
- Maintain test coverage accuracy
- Ensure reliable deployments
- Document expected behavior

### Recent UI Changes Reflected in Tests:
- **Sidebar**: Now always visible (permanent drawer, no toggle)
- **Header**: Navigation dropdown added, hamburger menu removed
- **Layout**: Fixed sidebar width (220px), adjusted main content area

## 📁 Structure

```
tests/
├── e2e/
│   ├── fixtures/          # Test fixtures and authentication helpers
│   ├── helpers/           # Test utilities and data generators
│   ├── pages/             # Page Object Models
│   └── tests/             # Test specifications
│       ├── 01-auth.spec.ts
│       ├── 02-dashboard.spec.ts
│       ├── 03-organizations.spec.ts
│       ├── 04-users.spec.ts
│       ├── 05-kyc.spec.ts
│       ├── 06-questionnaire.spec.ts
│       ├── 07-applications.spec.ts
│       ├── 08-navigation.spec.ts
│       ├── 09-theme.spec.ts
│       └── 10-accessibility.spec.ts
└── README.md
```

## 🧪 Test Coverage

### 1. **Authentication Tests** (`01-auth.spec.ts`)
- Login page display
- Successful login flow
- OTP request and verification
- Phone number validation
- Logout functionality
- Protected route access
- Session persistence

### 2. **Dashboard Tests** (`02-dashboard.spec.ts`)
- Stats cards display
- Recent applications table
- Recent organizations table
- Navigation to other pages
- Progress indicators
- Trend indicators

### 3. **Organizations Tests** (`03-organizations.spec.ts`)
- Organizations list display
- Create new organization
- Edit existing organization
- Delete organization
- Search and filter
- Status management

### 4. **Users Tests** (`04-users.spec.ts`)
- Users list display
- Create new user
- Edit existing user
- Delete user
- Role management

### 5. **KYC Tests** (`05-kyc.spec.ts`)
- KYC documents list
- Upload documents
- Approve/reject documents
- Document verification flow

### 6. **Questionnaire Tests** (`06-questionnaire.spec.ts`)
- Question management
- Create/edit questions
- Question activation/deactivation

### 7. **Applications Tests** (`07-applications.spec.ts`)
- Application list display
- Create new application
- Application workflow
- Status transitions

### 8. **Navigation Tests** (`08-navigation.spec.ts`) ⚠️ **UPDATED**
- **Sidebar always visible (permanent drawer)**
- **Navigation dropdown menu in header**
- **All navigation paths work correctly**
- Active route highlighting
- User menu functionality
- **Note**: Removed sidebar toggle tests (feature removed)

### 9. **Theme Tests** (`09-theme.spec.ts`)
- Consistent UI theme
- Color scheme validation
- Loading states
- Toast notifications

### 10. **Accessibility Tests** (`10-accessibility.spec.ts`)
- Proper page titles
- Heading hierarchy
- Alt text for images
- ARIA labels on interactive elements

### 11. **API Endpoints Tests** (`11-api-endpoints.spec.ts`)
- API response validation
- Error handling
- Data integrity

### 12. **UI Visual Tests** (`12-ui-visual.spec.ts`) ⚠️ **UPDATED**
- **Consistent spacing with permanent sidebar**
- **Layout validation (220px sidebar + content)**
- Responsive design
- No horizontal overflow
- Mobile/tablet viewport testing

## 🔄 Recent Test Updates

### Sidebar Layout Changes (Latest)
**Date**: Current
**Changes Made**:
- ✅ Replaced sidebar toggle test with navigation dropdown tests
- ✅ Added tests for new Navigation dropdown menu in header
- ✅ Updated all navigation tests to work with always-visible sidebar
- ✅ Documented layout changes in affected test files
- ✅ Verified all navigation paths work with new structure

**Files Updated**:
- `tests/e2e/tests/08-navigation.spec.ts` - Major updates
- `tests/e2e/tests/12-ui-visual.spec.ts` - Layout notes added
- `tests/e2e/tests/11-api-endpoints.spec.ts` - Documentation updated
- `tests/e2e/smoke.spec.ts` - Notes added
- `tests/README.md` - Comprehensive documentation

**Tests Removed**: 
- Sidebar toggle functionality test (feature no longer exists)

**Tests Added**:
- Navigation dropdown menu visibility test
- Navigation via dropdown menu test
- Active page highlighting in dropdown test
- All menu items presence validation

## 📝 Test Development Guidelines

### ⚠️ CRITICAL: Keep Tests in Sync with Development

**ALWAYS update tests when making UI/feature changes!**

1. **Before Starting Development**:
   - Review existing tests for the feature you'll modify
   - Understand current test coverage
   - Plan test updates needed

2. **During Development**:
   - Update tests as you change functionality
   - Don't wait until the end to fix tests
   - Run tests locally before committing

3. **After Development**:
   - Verify all affected tests pass
   - Add new tests for new functionality
   - Update test documentation
   - Run full test suite before pushing

4. **Test Update Checklist**:
   - [ ] Update tests for removed features
   - [ ] Add tests for new features
   - [ ] Update selectors if UI changed
   - [ ] Update expected behaviors
   - [ ] Update test documentation
   - [ ] Run tests locally and verify they pass
   - [ ] Update this README if coverage changes

### Example: Recent Sidebar Changes

When we made the sidebar always visible:
- ✅ Removed sidebar toggle test (feature removed)
- ✅ Added navigation dropdown tests (new feature)
- ✅ Updated layout-dependent tests
- ✅ Documented changes in affected files
- ✅ Updated this README

### Best Practices for Test Maintenance

1. **Use Page Object Models** - Centralize selectors for easy updates
2. **Use Fixtures** - Reuse authentication and setup logic
3. **Generate Unique Data** - Avoid test data conflicts
4. **Wait Appropriately** - Use `waitFor` methods instead of fixed timeouts
5. **Test User Flows** - Test complete scenarios, not just individual actions
6. **Handle API Responses** - Mock or intercept as needed
7. **Clean Up** - Remove test data after tests
8. **Make Tests Independent** - Each test should run standalone
9. **Use Descriptive Names** - Test names should explain what they test
10. **Group Related Tests** - Use `test.describe` blocks
11. **Update Tests with Code** - Never bypass failing tests, fix them!
12. **Document Breaking Changes** - Add notes in test files about major changes

### 4. **Users Tests** (`04-users.spec.ts`)
- Users list display
- Create new user
- Edit existing user
- Delete user
- Search functionality
- Email validation
- Phone number validation
- Status chips display
- Pagination

### 5. **KYC Tests** (`05-kyc.spec.ts`)
- KYC documents management
- Document upload
- Document types
- Document status
- KYC verification requests
- Verification actions
- Filter and search

### 6. **Questionnaire Tests** (`06-questionnaire.spec.ts`)
- Questionnaire list
- Create questionnaire
- Edit questionnaire
- Question management
- Search and filter
- Status display

### 7. **Applications Tests** (`07-applications.spec.ts`)
- Applications list
- Create application
- Application details
- Status tracking
- Progress indicators
- Search and filter

### 8. **Navigation Tests** (`08-navigation.spec.ts`)
- Sidebar navigation
- Route navigation
- Active route highlighting
- Sidebar toggle
- Breadcrumbs
- User menu

### 9. **Theme Tests** (`09-theme.spec.ts`)
- Theme switcher
- Dark/Light mode toggle
- Loading spinners
- Toast notifications
- Responsive design
- Mobile viewport
- Tablet viewport

### 10. **Accessibility Tests** (`10-accessibility.spec.ts`)
- Page titles
- Heading hierarchy
- Alt text for images
- ARIA labels
- Form labels
- Keyboard navigation
- Proper roles
- Table structure

## 🚀 Running Tests

### Prerequisites
```bash
npm install
npx playwright install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/tests/01-auth.spec.ts
```

### Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests with UI
```bash
npx playwright test --ui
```

## 📊 Test Reports

### View HTML Report
```bash
npx playwright show-report test-results/html
```

### View Test Results
```bash
npx playwright show-report
```

## 🔧 Configuration

Test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 seconds per test
- **Retries**: 2 in CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Reports**: HTML, JSON, JUnit, Console

## 📝 Writing New Tests

### 1. Create a new test file
```typescript
import { test, expect } from '../fixtures/auth.fixture';

test.describe('Feature Tests', () => {
  test('should do something', async ({ authenticatedPage }) => {
    // Your test code
  });
});
```

### 2. Use Page Object Models
```typescript
import { MyPage } from '../pages/MyPage';

test('should use page object', async ({ authenticatedPage }) => {
  const myPage = new MyPage(authenticatedPage);
  await myPage.goto();
  await myPage.doSomething();
});
```

### 3. Use Test Data Generators
```typescript
import { generateUniqueId } from '../helpers/test-data';

const testData = {
  name: `Test ${generateUniqueId()}`
};
```

## 🎯 Best Practices

1. **Use Page Object Models** - Encapsulate page interactions
2. **Use Fixtures** - Reuse authentication and setup logic
3. **Generate Unique Data** - Avoid test data conflicts
4. **Wait Appropriately** - Use `waitFor` methods instead of fixed timeouts
5. **Test User Flows** - Test complete scenarios, not just individual actions
6. **Handle API Responses** - Mock or intercept as needed
7. **Clean Up** - Remove test data after tests
8. **Make Tests Independent** - Each test should run standalone
9. **Use Descriptive Names** - Test names should explain what they test
10. **Group Related Tests** - Use `test.describe` blocks

## 🐛 Debugging

### Run with Playwright Inspector
```bash
npx playwright test --debug
```

### Generate Code
```bash
npx playwright codegen http://localhost:3000
```

### Take Screenshots
```bash
npx playwright test --screenshot=on
```

### Record Video
```bash
npx playwright test --video=on
```

### Trace
```bash
npx playwright test --trace=on
```

## 🔗 CI/CD Integration

Tests are automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

See `.github/workflows/playwright.yml` for CI configuration.

## 📦 Dependencies

- `@playwright/test` - Testing framework
- `@types/node` - TypeScript Node.js types

## 🤝 Contributing

When adding new features:
1. Write tests for the new functionality
2. Update Page Object Models if UI changed
3. Add test data generators if needed
4. Update this README with new test coverage

## 📞 Support

For issues or questions:
- Check Playwright documentation: https://playwright.dev
- Review existing test patterns in this project
- Contact the development team
