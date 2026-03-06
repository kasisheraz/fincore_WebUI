# FinCore WebUI - Testing Strategy & Plan

## 📋 Executive Summary

This document outlines a comprehensive testing strategy for the FinCore WebUI application, covering unit tests, integration tests, end-to-end tests, and CI/CD integration. The strategy follows industry best practices and ensures high-quality, maintainable code.

---

## 🎯 Testing Philosophy

### Testing Pyramid
```
                    /\
                   /  \
                  / E2E \          ← 10-15% (Slow, Expensive)
                 /______\
                /        \
               / Integration \     ← 20-30% (Medium Speed)
              /______________\
             /                \
            /   Unit Tests     \   ← 55-70% (Fast, Cheap)
           /____________________\
```

### Coverage Goals
- **Overall Code Coverage**: 80% minimum
- **Critical Paths Coverage**: 95%+ (authentication, payments, KYC)
- **Unit Test Coverage**: 85%
- **Integration Test Coverage**: 75%
- **E2E Test Coverage**: Key user journeys

---

## 🏗️ Testing Architecture

### Recommended Approach: **Monorepo with Separate Test Directory**

**Structure**:
```
fincore_WebUI/
├── src/                          # Application code
├── tests/                        # All tests (recommended)
│   ├── unit/                     # Unit tests
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── hooks/
│   ├── integration/              # Integration tests
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   └── e2e/                      # E2E tests (Playwright)
│       ├── auth/
│       ├── users/
│       ├── organizations/
│       ├── kyc/
│       ├── questionnaire/
│       └── fixtures/
├── playwright.config.ts          # Playwright configuration
├── jest.config.js                # Jest configuration
└── package.json
```

**Why Monorepo?**
✅ **Pros**:
- Single source of truth
- Easier to run all tests together
- Simpler CI/CD configuration
- Shared utilities and fixtures
- No version sync issues between repos

❌ **Alternative: Separate Repo (Not Recommended)**
- More complex setup
- Version sync challenges
- Duplicate configuration
- Harder to maintain

---

## 🧪 Testing Layers

### 1. Unit Tests (Jest + React Testing Library)

#### Technology Stack
- **Test Runner**: Jest
- **Testing Library**: React Testing Library
- **Assertion Library**: Jest (built-in)
- **Mocking**: Jest mocks + MSW (Mock Service Worker) for API

#### What to Test
✅ **Components**:
- Props rendering correctly
- Event handlers (click, submit, change)
- Conditional rendering
- Component state changes
- Error boundaries

✅ **Services**:
- API calls with correct parameters
- Error handling
- Response parsing
- Token management

✅ **Utilities**:
- Formatters (date, currency, phone)
- Validators (email, phone, etc.)
- Helpers

✅ **Hooks**:
- Custom hook state management
- Side effects
- Return values

#### Example: Component Unit Test
```typescript
// tests/unit/components/users/UserList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from '@/components/users/UserList';
import { userService } from '@/services/userService';

jest.mock('@/services/userService');

describe('UserList Component', () => {
  const mockUsers = [
    { id: 1, fullName: 'John Doe', email: 'john@example.com', role: 'USER', status: 'ACTIVE' },
    { id: 2, fullName: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', status: 'ACTIVE' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render users list', async () => {
    (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call onUserClick when user row is clicked', async () => {
    const onUserClick = jest.fn();
    (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(<UserList onUserClick={onUserClick} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('John Doe'));
    });

    expect(onUserClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should display error message when API fails', async () => {
    (userService.getAllUsers as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading users/i)).toBeInTheDocument();
    });
  });
});
```

#### Example: Service Unit Test
```typescript
// tests/unit/services/userService.test.ts
import { userService } from '@/services/userService';
import apiService from '@/services/apiService';

jest.mock('@/services/apiService');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      const mockUsers = [
        { id: 1, fullName: 'John Doe', email: 'john@example.com' },
      ];
      (apiService.get as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(apiService.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(userService.getAllUsers()).rejects.toThrow('Network error');
    });
  });

  describe('createUser', () => {
    it('should create user with correct data', async () => {
      const userData = { fullName: 'John Doe', email: 'john@example.com', phoneNumber: '+1234567890', role: 'USER' };
      const createdUser = { id: 1, ...userData };
      (apiService.post as jest.Mock).mockResolvedValue(createdUser);

      const result = await userService.createUser(userData);

      expect(apiService.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(createdUser);
    });
  });
});
```

#### Example: Utility Unit Test
```typescript
// tests/unit/utils/formatters.test.ts
import { formatPhoneNumber, formatDate, formatCurrency } from '@/utils/formatters';

describe('Formatters', () => {
  describe('formatPhoneNumber', () => {
    it('should format phone number correctly', () => {
      expect(formatPhoneNumber('+1234567890')).toBe('+1 (234) 567-890');
    });

    it('should return empty string for invalid input', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber(null)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date to DD/MM/YYYY', () => {
      expect(formatDate('2026-03-03T10:00:00Z')).toBe('03/03/2026');
    });
  });

  describe('formatCurrency', () => {
    it('should format amount with currency symbol', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    });
  });
});
```

---

### 2. Integration Tests (React Testing Library + MSW)

#### What to Test
✅ **Component Integration**:
- Multiple components working together
- Data flow between components
- Context providers with components
- Router integration

✅ **API Integration**:
- Real API responses (mocked with MSW)
- Error handling flows
- Loading states
- Pagination

✅ **Form Flows**:
- Multi-step forms
- Validation integration
- Form submission with API
- Success/error messages

#### Example: Page Integration Test
```typescript
// tests/integration/pages/UsersPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import UsersPage from '@/pages/users/UsersPage';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, fullName: 'John Doe', email: 'john@example.com', role: 'USER', status: 'ACTIVE' },
    ]));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UsersPage Integration', () => {
  it('should load and display users from API', async () => {
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should open create user dialog', async () => {
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(/add user/i));
    });

    expect(screen.getByText(/create user/i)).toBeInTheDocument();
  });

  it('should create user and refresh list', async () => {
    server.use(
      rest.post('/api/users', (req, res, ctx) => {
        return res(ctx.json({ id: 2, fullName: 'New User', email: 'new@example.com' }));
      })
    );

    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(/add user/i));
    });

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(screen.getByText('User created successfully')).toBeInTheDocument();
    });
  });
});
```

---

### 3. End-to-End Tests (Playwright)

#### Technology Stack
- **Framework**: Playwright
- **Language**: TypeScript
- **Browsers**: Chromium, Firefox, WebKit
- **Parallelization**: Yes (4-8 workers)

#### Why Playwright?
✅ **Advantages**:
- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-wait for elements
- Network interception
- Mobile emulation
- Screenshot/video recording
- Powerful selector engine
- Parallel execution
- Great documentation

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 8,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Structure
```
tests/e2e/
├── fixtures/                    # Reusable fixtures and setup
│   ├── auth.fixture.ts         # Authentication setup
│   ├── test-data.ts            # Test data
│   └── api-mocks.ts            # API mock helpers
├── pages/                       # Page Object Model (POM)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── UsersPage.ts
│   ├── OrganizationsPage.ts
│   └── KycPage.ts
├── auth/                        # Auth flow tests
│   ├── login.spec.ts
│   └── logout.spec.ts
├── users/                       # User management tests
│   ├── user-crud.spec.ts
│   ├── user-search.spec.ts
│   └── user-filters.spec.ts
├── organizations/               # Organization tests
│   ├── org-crud.spec.ts
│   ├── org-multi-step-form.spec.ts
│   └── org-status-management.spec.ts
├── kyc/                         # KYC tests
│   ├── document-upload.spec.ts
│   ├── document-verification.spec.ts
│   └── verification-workflow.spec.ts
├── questionnaire/               # Questionnaire tests
│   ├── question-management.spec.ts
│   └── answer-submission.spec.ts
└── smoke/                       # Smoke tests
    └── critical-paths.spec.ts
```

#### Example: Page Object Model
```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly phoneInput: Locator;
  readonly requestOtpButton: Locator;
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.phoneInput = page.locator('input[name="phoneNumber"]');
    this.requestOtpButton = page.locator('button:has-text("Request OTP")');
    this.otpInput = page.locator('input[name="otp"]');
    this.verifyOtpButton = page.locator('button:has-text("Verify OTP")');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(phoneNumber: string, otp: string) {
    await this.phoneInput.fill(phoneNumber);
    await this.requestOtpButton.click();
    
    // Wait for OTP input to appear
    await this.otpInput.waitFor({ state: 'visible' });
    await this.otpInput.fill(otp);
    await this.verifyOtpButton.click();
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('/dashboard');
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

```typescript
// tests/e2e/pages/UsersPage.ts
import { Page, Locator } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  readonly addUserButton: Locator;
  readonly searchInput: Locator;
  readonly userTable: Locator;
  readonly createUserDialog: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addUserButton = page.locator('button:has-text("Add User")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.userTable = page.locator('table');
    this.createUserDialog = page.locator('[role="dialog"]');
    this.fullNameInput = page.locator('input[name="fullName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneNumberInput = page.locator('input[name="phoneNumber"]');
    this.roleSelect = page.locator('select[name="role"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.successMessage = page.locator('.success-message');
  }

  async goto() {
    await this.page.goto('/users');
  }

  async createUser(userData: { fullName: string; email: string; phoneNumber: string; role: string }) {
    await this.addUserButton.click();
    await this.createUserDialog.waitFor({ state: 'visible' });
    
    await this.fullNameInput.fill(userData.fullName);
    await this.emailInput.fill(userData.email);
    await this.phoneNumberInput.fill(userData.phoneNumber);
    await this.roleSelect.selectOption(userData.role);
    
    await this.submitButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async searchUser(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async getUserRowByName(name: string) {
    return this.page.locator(`tr:has-text("${name}")`);
  }

  async deleteUser(name: string) {
    const row = await this.getUserRowByName(name);
    await row.locator('button[aria-label="Delete"]').click();
    
    // Confirm deletion
    await this.page.locator('button:has-text("Confirm")').click();
    await this.successMessage.waitFor({ state: 'visible' });
  }
}
```

#### Example: E2E Test
```typescript
// tests/e2e/users/user-crud.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UsersPage } from '../pages/UsersPage';
import { authenticateUser } from '../fixtures/auth.fixture';

test.describe('User Management CRUD', () => {
  let loginPage: LoginPage;
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);
    
    // Authenticate before each test
    await authenticateUser(page);
    await usersPage.goto();
  });

  test('should create a new user', async ({ page }) => {
    const userData = {
      fullName: 'Test User',
      email: 'test.user@example.com',
      phoneNumber: '+1234567890',
      role: 'USER',
    };

    await usersPage.createUser(userData);

    // Verify user appears in list
    const userRow = await usersPage.getUserRowByName(userData.fullName);
    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText(userData.email);
  });

  test('should edit an existing user', async ({ page }) => {
    // First create a user
    await usersPage.createUser({
      fullName: 'Edit Test User',
      email: 'edit@example.com',
      phoneNumber: '+1111111111',
      role: 'USER',
    });

    // Click edit button
    const userRow = await usersPage.getUserRowByName('Edit Test User');
    await userRow.locator('button[aria-label="Edit"]').click();

    // Update user data
    await page.locator('input[name="fullName"]').fill('Updated User');
    await page.locator('button[type="submit"]').click();

    // Verify update
    await expect(page.locator('tr:has-text("Updated User")')).toBeVisible();
  });

  test('should delete a user', async ({ page }) => {
    // First create a user
    await usersPage.createUser({
      fullName: 'Delete Test User',
      email: 'delete@example.com',
      phoneNumber: '+2222222222',
      role: 'USER',
    });

    // Delete user
    await usersPage.deleteUser('Delete Test User');

    // Verify user is removed
    await expect(page.locator('tr:has-text("Delete Test User")')).not.toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await usersPage.searchUser('John');

    // Verify filtered results
    const table = usersPage.userTable;
    await expect(table.locator('tr:has-text("John")')).toBeVisible();
  });

  test('should filter users by role', async ({ page }) => {
    await page.locator('select[name="roleFilter"]').selectOption('ADMIN');

    // Verify only admins are shown
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('ADMIN');
    }
  });
});
```

#### Example: Multi-Step Form Test
```typescript
// tests/e2e/organizations/org-multi-step-form.spec.ts
import { test, expect } from '@playwright/test';
import { authenticateUser } from '../fixtures/auth.fixture';

test.describe('Organization Multi-Step Form', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    await page.goto('/organizations');
    await page.locator('button:has-text("Add Organization")').click();
  });

  test('should complete all steps and create organization', async ({ page }) => {
    // Step 1: Basic Information
    await expect(page.locator('text=Step 1: Basic Information')).toBeVisible();
    await page.locator('input[name="legalName"]').fill('Test Organization Ltd');
    await page.locator('input[name="registrationNumber"]').fill('12345678');
    await page.locator('select[name="organisationType"]').selectOption('LTD');
    await page.locator('input[name="incorporationDate"]').fill('2020-01-01');
    await page.locator('input[name="countryOfIncorporation"]').fill('United Kingdom');
    await page.locator('button:has-text("Next")').click();

    // Step 2: Business Details
    await expect(page.locator('text=Step 2: Business Details')).toBeVisible();
    await page.locator('textarea[name="businessDescription"]').fill('Test business description');
    await page.locator('input[name="websiteAddress"]').fill('https://example.com');
    await page.locator('input[name="fcaNumber"]').fill('FRN123456');
    await page.locator('button:has-text("Next")').click();

    // Step 3: Addresses
    await expect(page.locator('text=Step 3: Addresses')).toBeVisible();
    
    // Registered Address
    await page.locator('input[name="registeredAddress.addressLine1"]').fill('123 Business Street');
    await page.locator('input[name="registeredAddress.city"]').fill('London');
    await page.locator('input[name="registeredAddress.postalCode"]').fill('SW1A 1AA');
    await page.locator('input[name="registeredAddress.country"]').fill('United Kingdom');
    
    // Submit
    await page.locator('button:has-text("Submit")').click();

    // Verify success
    await expect(page.locator('text=Organization created successfully')).toBeVisible();
    await expect(page.locator('tr:has-text("Test Organization Ltd")')).toBeVisible();
  });

  test('should validate required fields in each step', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.locator('button:has-text("Next")').click();

    // Should see validation errors
    await expect(page.locator('text=Legal name is required')).toBeVisible();
    await expect(page.locator('text=Registration number is required')).toBeVisible();
  });

  test('should allow navigation back to previous steps', async ({ page }) => {
    // Fill step 1 and go to step 2
    await page.locator('input[name="legalName"]').fill('Test Org');
    await page.locator('input[name="registrationNumber"]').fill('12345678');
    await page.locator('select[name="organisationType"]').selectOption('LTD');
    await page.locator('input[name="incorporationDate"]').fill('2020-01-01');
    await page.locator('input[name="countryOfIncorporation"]').fill('UK');
    await page.locator('button:has-text("Next")').click();

    // Go back to step 1
    await page.locator('button:has-text("Back")').click();

    // Verify data is preserved
    await expect(page.locator('input[name="legalName"]')).toHaveValue('Test Org');
  });
});
```

#### Example: Authentication Fixture
```typescript
// tests/e2e/fixtures/auth.fixture.ts
import { Page } from '@playwright/test';

export async function authenticateUser(page: Page, role: 'admin' | 'user' = 'admin') {
  // Navigate to login page
  await page.goto('/login');

  // Get credentials based on role
  const credentials = getCredentials(role);

  // Request OTP
  await page.locator('input[name="phoneNumber"]').fill(credentials.phoneNumber);
  await page.locator('button:has-text("Request OTP")').click();

  // Wait for OTP input
  await page.locator('input[name="otp"]').waitFor({ state: 'visible' });

  // Enter OTP (in test environment, use fixed OTP)
  await page.locator('input[name="otp"]').fill('123456');
  await page.locator('button:has-text("Verify OTP")').click();

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');

  // Store auth state for reuse
  await page.context().storageState({ path: `tests/e2e/.auth/${role}.json` });
}

function getCredentials(role: 'admin' | 'user') {
  const credentials = {
    admin: { phoneNumber: '+1234567890' },
    user: { phoneNumber: '+1234567891' },
  };
  return credentials[role];
}
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test & Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript check
        run: npm run type-check

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unit
      
      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: integration

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Start backend mock server
        run: |
          npm run mock-api &
          npx wait-on http://localhost:8080/api/health
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          BASE_URL: http://localhost:3000
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.browser }}
          path: test-results/
          retention-days: 30

  visual-regression:
    name: Visual Regression Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run visual regression tests
        run: npm run test:visual
      
      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: tests/e2e/__screenshots__/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --production
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  quality-gate:
    name: Quality Gate
    needs: [lint, unit-tests, integration-tests, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - name: Check all tests passed
        run: echo "All quality checks passed!"
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "jest --config jest.config.unit.js",
    "test:integration": "jest --config jest.config.integration.js",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:visual": "playwright test --grep @visual",
    
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "npm run lint && npm run type-check && npm run test:coverage",
    
    "playwright:install": "playwright install --with-deps",
    "playwright:report": "playwright show-report",
    "playwright:codegen": "playwright codegen http://localhost:3000",
    
    "mock-api": "json-server --watch tests/fixtures/db.json --port 8080"
  }
}
```

---

## 📊 Test Coverage & Quality Metrics

### Coverage Targets

| Test Type | Coverage Target | Priority |
|-----------|----------------|----------|
| Unit Tests | 85% | High |
| Integration Tests | 75% | Medium |
| E2E Critical Paths | 100% | Critical |
| Overall Code Coverage | 80% | High |

### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Execution Time | < 10 min | CI/CD pipeline |
| Unit Test Speed | < 30 sec | Jest |
| E2E Test Speed | < 5 min | Playwright |
| Flaky Test Rate | < 2% | Test reports |
| Code Coverage | > 80% | Codecov |
| Bug Detection Rate | > 90% | Post-release bugs |

---

## 🔄 SDLC Integration

### Development Workflow

```
1. Developer creates feature branch
   ↓
2. Write unit tests (TDD approach)
   ↓
3. Implement feature
   ↓
4. Write integration tests
   ↓
5. Run local tests (npm run test)
   ↓
6. Commit & push (pre-commit hooks run)
   ↓
7. Create Pull Request
   ↓
8. CI runs all tests automatically
   ↓
9. Code review with test coverage check
   ↓
10. Merge to main (if all checks pass)
   ↓
11. E2E tests run on staging
   ↓
12. Deploy to production
```

### Pre-commit Hooks (Husky)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 🧪 Test Data Management

### Test Data Strategy

1. **Fixtures**: Static test data in JSON files
2. **Factories**: Dynamic test data generation
3. **Database Seeds**: Initial data for integration tests
4. **API Mocks**: MSW handlers for API responses

#### Example: Test Data Factory
```typescript
// tests/fixtures/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createMockUser = (overrides = {}) => ({
  id: faker.number.int(),
  fullName: faker.person.fullName(),
  email: faker.internet.email(),
  phoneNumber: faker.phone.number('+1##########'),
  role: faker.helpers.arrayElement(['USER', 'ADMIN', 'COMPLIANCE_OFFICER']),
  status: 'ACTIVE',
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

export const createMockUsers = (count: number) => {
  return Array.from({ length: count }, () => createMockUser());
};
```

---

## 📈 Test Reporting

### Playwright HTML Report
- Automatically generated after each test run
- Shows test results, screenshots, videos
- Trace viewer for debugging
- Access with: `npx playwright show-report`

### Jest Coverage Report
- Generated with `--coverage` flag
- Shows line, branch, function, statement coverage
- HTML report in `coverage/lcov-report/index.html`

### CI/CD Dashboard
- Test results visible in GitHub Actions
- Coverage trends in Codecov
- Quality gates in pull requests

---

## 🎯 Testing Best Practices

### General
✅ **Do**:
- Write tests before or alongside code (TDD)
- Keep tests simple and focused
- Use descriptive test names
- Test one thing per test
- Use AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Clean up after tests

❌ **Don't**:
- Write tests that depend on other tests
- Use hard-coded test data
- Test implementation details
- Ignore flaky tests
- Skip writing tests for "simple" code

### Playwright Specific
✅ **Do**:
- Use Page Object Model
- Wait for elements properly (auto-wait)
- Use data-testid for selectors
- Take screenshots on failure
- Record videos for debugging
- Run tests in parallel

❌ **Don't**:
- Use fixed timeouts (`page.waitForTimeout`)
- Use fragile CSS selectors
- Share state between tests
- Test too much in one test

---

## 🔧 Recommended Tools & Libraries

### Testing
- **Jest**: Unit test runner
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking
- **@faker-js/faker**: Test data generation

### Quality
- **ESLint**: Linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks
- **Codecov**: Coverage reporting

### CI/CD
- **GitHub Actions**: CI/CD pipeline
- **Docker**: Containerization
- **Snyk**: Security scanning

---

## 📋 Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Install Jest and React Testing Library
- [ ] Configure Jest
- [ ] Install Playwright
- [ ] Configure Playwright
- [ ] Set up MSW for API mocking
- [ ] Create test directory structure
- [ ] Install faker for test data
- [ ] Set up pre-commit hooks (Husky)

### Phase 2: Unit Tests (Week 2-3)
- [ ] Write unit tests for utilities
- [ ] Write unit tests for services
- [ ] Write unit tests for hooks
- [ ] Write unit tests for components
- [ ] Achieve 85% coverage

### Phase 3: Integration Tests (Week 4)
- [ ] Set up MSW handlers
- [ ] Write integration tests for pages
- [ ] Write integration tests for forms
- [ ] Write integration tests for API flows

### Phase 4: E2E Tests (Week 5-6)
- [ ] Create Page Object Models
- [ ] Write authentication tests
- [ ] Write user management tests
- [ ] Write organization tests
- [ ] Write KYC tests
- [ ] Write questionnaire tests
- [ ] Create smoke test suite

### Phase 5: CI/CD Integration (Week 7)
- [ ] Create GitHub Actions workflow
- [ ] Set up test reporting
- [ ] Configure coverage reporting
- [ ] Set up quality gates
- [ ] Configure notifications

### Phase 6: Documentation (Week 8)
- [ ] Document testing strategy
- [ ] Create test writing guidelines
- [ ] Document CI/CD setup
- [ ] Create troubleshooting guide

---

## 🎓 Training & Resources

### For Team Members
1. **Testing Workshop**: 2-hour session on testing best practices
2. **Playwright Tutorial**: Hands-on tutorial for E2E testing
3. **Documentation**: Testing guidelines and examples
4. **Code Reviews**: Focus on test quality

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing JavaScript Course](https://testingjavascript.com/)

---

## 📞 Support & Questions

If you have questions about the testing strategy:
1. Check this documentation
2. Review example tests in the repository
3. Ask in the team chat
4. Schedule a pairing session

---

**Document Version**: 1.0  
**Last Updated**: March 3, 2026  
**Next Review**: [Set review date]

---

## Summary & Recommendation

### ✅ Recommended Approach

**Monorepo with Separate Test Directory** in the main `fincore_WebUI` project:
- Tests alongside application code
- Single CI/CD pipeline
- Easier maintenance
- Better developer experience

### 🎯 Testing Pyramid Distribution
- **70%** Unit Tests (Fast, Cheap)
- **20%** Integration Tests (Medium)
- **10%** E2E Tests (Slow, Expensive)

### 🚀 Priority Order
1. **Critical Path E2E Tests** (Authentication, KYC, Payments)
2. **Unit Tests for Business Logic**
3. **Integration Tests for Complex Flows**
4. **Additional E2E Tests**

### 📊 Success Metrics
- 80%+ code coverage
- All critical paths covered by E2E
- < 10 min CI/CD pipeline
- < 2% flaky tests

**Ready to implement? Let me know if you'd like me to start setting up the testing infrastructure!**
