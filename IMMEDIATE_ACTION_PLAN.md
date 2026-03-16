# Immediate Action Plan - Critical Test Fixes

**Priority:** 🔴 P0 - BLOCKING NPE DEPLOYMENT  
**Timeline:** 5-7 days  
**Goal:** Get tests passing and quality gates enforced before any NPE deployment

---

## Day 1-2: Backend Test Compilation Fixes

### Task 1.1: Fix Repository Method Calls
**Affected Files:** 42 test files  
**Primary Files:**
- `src/test/java/com/fincore/usermgmt/service/AmlScreeningServiceTest.java`
- `src/test/java/com/fincore/usermgmt/service/CustomerAnswerServiceTest.java`
- `src/test/java/com/fincore/usermgmt/service/KycVerificationServiceTest.java`

**Actions:**
```java
// FIND the actual repository methods
grep -r "interface.*Repository" src/main/java/com/fincore/usermgmt/repository/

// UPDATE test mocks to match
// Example: findByVerificationIdOrderByScreenedAtDesc → findByVerification_IdOrderByScreenedAt
```

**Checklist:**
- [ ] Identify all actual repository method names
- [ ] Update all 15+ repository mock calls in tests
- [ ] Verify test compilation
- [ ] Commit: "fix: Update repository method calls in tests"

### Task 1.2: Fix Service Method Signatures
**Affected Methods:**
- `triggerSanctionsScreening`
- `triggerPepScreening`
- `triggerAdverseMediaScreening`

**Actions:**
```java
// CHECK actual service signatures
grep -A5 "public.*triggerSanctionsScreening" src/main/java/

// UPDATE test calls
// From: service.triggerSanctionsScreening(verification, user, boolean, int)
// To: service.triggerSanctionsScreening(verification, user)
```

**Checklist:**
- [ ] Check actual service method signatures
- [ ] Update all test method calls
- [ ] Remove extra parameters from test calls
- [ ] Commit: "fix: Update service method signatures in tests"

### Task 1.3: Fix Entity Field References
**Affected Entities:**
- `CustomerKycVerification` (createdAt → created_at)
- `CustomerKycVerification` (reviewedBy → reviewed_by)

**Actions:**
```java
// CHECK entity field names
grep -A5 "@Builder" src/main/java/com/fincore/usermgmt/entity/

// UPDATE tests
// From: .createdAt(LocalDateTime.now())
// To: .created_at(LocalDateTime.now())
```

**Checklist:**
- [ ] Document all entity field names
- [ ] Update builder calls in tests
- [ ] Update setter calls in tests
- [ ] Commit: "fix: Update entity field names in tests"

### Task 1.4: Fix Enum Value References
**Affected Enum:** `QuestionCategory`  
**Missing Values:** OCCUPATION, INCOME

**Actions:**
```java
// CHECK actual enum values
cat src/main/java/com/fincore/usermgmt/entity/enums/QuestionCategory.java

// UPDATE or REMOVE tests using missing values
// Option 1: Add values back to enum if needed
// Option 2: Change tests to use valid enum values
```

**Checklist:**
- [ ] List all valid QuestionCategory enum values
- [ ] Update QuestionnaireServiceTest.java (10+ locations)
- [ ] Verify enum usage across all tests
- [ ] Commit: "fix: Update enum references in tests"

### Task 1.5: Verify All Tests Compile and Pass
**Actions:**
```bash
cd c:\Development\git\userManagementApi
$env:JAVA_HOME = "C:\Development\Tools\Java\jdk-17.0.17+10"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
mvn clean test
```

**Expected Result:** Build SUCCESS, all 42 test files passing

**Checklist:**
- [ ] All tests compile without errors
- [ ] All tests pass
- [ ] Generate test report: `mvn surefire-report:report`
- [ ] Commit: "test: All backend tests passing"

---

## Day 3: Frontend Authentication & E2E Fixes ✅ COMPLETE

### Task 2.1: Debug Authentication Flow ✅ COMPLETE
**Affected File:** `tests/e2e/fixtures/auth.fixture.ts`

**Previous Error:**
```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded
- waiting for locator('input[name="otp"]') to be visible
```

**Root Cause Identified:**
- E2E tests ran without `REACT_APP_MOCK_AUTH=true` environment variable
- Without mock auth, app tried to call real backend API (not running during tests)
- LoginForm error handler was triggered, preventing OTP input from appearing
- Playwright test timed out waiting for OTP input selector

**Solution Applied:**
1. ✅ Created `.env.test.local` with `REACT_APP_MOCK_AUTH=true`
2. ✅ Updated `playwright.config.ts` to pass env vars to webServer:
   ```typescript
   webServer: {
     command: 'npm start',
     url: 'http://localhost:3000',
     env: {
       REACT_APP_MOCK_AUTH: 'true',
       NODE_ENV: 'test',
     },
   }
   ```
3. ✅ Added `test:e2e:dev` script to package.json for manual testing
4. ✅ Verified authentication flow works with mock test users

**Checklist:**
- [x] Identified why OTP request fails
- [x] Fixed auth fixture configuration
- [x] Test login flow manually in browser
- [x] Verified mock setup works
- [x] Commit: "fix: Enable mock auth for E2E tests"

### Task 2.2: Fix API Connectivity ✅ COMPLETE
**Solution:**
- Mock authentication enabled via environment variable
- No backend API needed during E2E tests
- Test users defined in authService: 1234567890, 9876543210, 5555555555
- Mock OTP: "123456" for all test accounts

**Checklist:**
- [x] Mock responses work correctly
- [x] No CORS issues (using mock mode)
- [x] Configuration documented
- [x] Commit: "fix: E2E test authentication configuration"

### Task 2.3: Run All E2E Tests ✅ COMPLETE
**Result:** **136/136 tests PASSING** 🎉

**Execution:**
```bash
cd c:\Development\git\fincore_WebUI
npx playwright test

# Result: 136 passed (3.1m)
```

**Test Results:**
- ✅ Authentication tests pass (8/8)
- ✅ Dashboard tests pass (10/10)
- ✅ Organizations CRUD tests pass (15/15)
- ✅ Users CRUD tests pass (15/15)
- ✅ KYC tests pass (12/12)
- ✅ Questionnaire tests pass (12/12)
- ✅ Applications tests pass (10/10)
- ✅ Navigation tests pass (8/8)
- ✅ Theme & UI tests pass (10/10)
- ✅ Accessibility tests pass (8/8)
- ✅ API Integration tests pass (20/20)
- ✅ Visual regression tests pass (8/8)

**Checklist:**
- [x] All 12 test suites passing
- [x] 136 tests total - 100% pass rate
- [x] HTML report generated
- [x] Screenshots captured
- [x] Commit: "test: All E2E tests passing - 136/136"

---

## Day 4: CI/CD Quality Gates

### Task 3.1: Re-enable Backend Tests in Deployment
**File:** `.github/workflows/deploy-npe.yml`

**Change:**
```yaml
# FROM:
# - name: Run tests
#   run: mvn clean test
# Temporarily disabled - tests need fixing after field name changes

# TO:
- name: Run backend tests
  run: mvn clean test
  
- name: Validate test results
  if: success()
  run: echo "All tests passed"
  
- name: Block deployment on test failure
  if: failure()
  run: |
    echo "Tests failed - blocking deployment"
    exit 1
```

**Checklist:**
- [ ] Uncomment test step in deploy-npe.yml
- [ ] Add failure handling
- [ ] Test workflow locally with act (optional)
- [ ] Commit: "ci: Re-enable backend tests in NPE deployment"

### Task 3.2: Enhance Frontend Test Requirements
**File:** `.github/workflows/deploy-gcp.yml`

**Add Coverage Threshold:**
```yaml
- name: Run unit tests with coverage
  run: npm test -- --watchAll=false --coverage

- name: Check coverage threshold  
  run: |
    LINES=$(jq '.total.lines.pct' coverage/coverage-summary.json)
    if (( $(echo "$LINES < 60" | bc -l) )); then
      echo "Coverage $LINES% is below 60% threshold"
      exit 1
    fi
    echo "Coverage: $LINES%"
```

**Checklist:**
- [ ] Add coverage threshold check (start at 60%)
- [ ] Ensure E2E tests block deployment
- [ ] Test workflow changes
- [ ] Commit: "ci: Add coverage threshold to frontend tests"

### Task 3.3: Configure Branch Protection
**Repository Settings → Branches → Branch protection rules**

**Add rule for `main`:**
- ✅ Require status checks to pass before merging
  - ✅ test / unit-tests
  - ✅ test / e2e-tests  
  - ✅ test / api-tests
  - ✅ build / build
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging (1 approver)
- ✅ Do not allow bypassing the above settings

**Add rule for `develop` (or `npe`):**
- Same as main

**Checklist:**
- [ ] Configure branch protection for main
- [ ] Configure branch protection for develop/npe
- [ ] Test PR merge with failing tests (should block)
- [ ] Test PR merge with passing tests (should succeed)
- [ ] Document: "docs: Branch protection rules enforced"

---

## Day 5: CRUD Validation

### Task 4.1: Add Organization CRUD Integration Tests
**Create:** `src/test/java/com/fincore/usermgmt/integration/OrganizationIntegrationTest.java`

**Tests:**
```java
@Test
void testCreateOrganization() { }

@Test
void testReadOrganization() { }

@Test
void testUpdateOrganization() { }

@Test
void testDeleteOrganization() { }

@Test
void testListOrganizations() { }

@Test
void testSearchOrganizations() { }
```

**Checklist:**
- [ ] Create integration test class
- [ ] Test all CRUD operations
- [ ] Test pagination
- [ ] Test error cases
- [ ] Verify with actual database
- [ ] Commit: "test: Add organization CRUD integration tests"

### Task 4.2: Add User CRUD Integration Tests
**Create:** `src/test/java/com/fincore/usermgmt/integration/UserIntegrationTest.java`

**Checklist:**
- [ ] Test user creation
- [ ] Test user update
- [ ] Test user listing
- [ ] Test user search
- [ ] Test user roles
- [ ] Commit: "test: Add user CRUD integration tests"

### Task 4.3: Add KYC CRUD Integration Tests
**Create:** `src/test/java/com/fincore/usermgmt/integration/KycIntegrationTest.java`

**Checklist:**
- [ ] Test KYC verification creation
- [ ] Test KYC document upload
- [ ] Test KYC status transitions
- [ ] Test AML screening integration
- [ ] Commit: "test: Add KYC CRUD integration tests"

---

## Day 6-7: Frontend Test Expansion

### Task 5.1: Add Service Layer Tests
**Priority Services:**
- `organizationService.ts`
- `userService.ts`
- `authService.ts`
- `kycVerificationService.ts`

**Template:**
```typescript
// organizationService.test.ts
import { organizationService } from './organizationService';

describe('OrganizationService', () => {
  it('should create organization', async () => {});
  it('should get organization by id', async () => {});
  it('should update organization', async () => {});
  it('should delete organization', async () => {});
  it('should list organizations', async () => {});
});
```

**Checklist:**
- [ ] Add tests for organizationService
- [ ] Add tests for userService
- [ ] Add tests for authService
- [ ] Add tests for kycVerificationService
- [ ] Target 80%+ coverage for services
- [ ] Commit: "test: Add service layer unit tests"

### Task 5.2: Add Component Tests
**Priority Components:**
- `components/organizations/OrganizationForm.tsx`
- `components/users/UserForm.tsx`
- `components/auth/LoginForm.tsx`

**Checklist:**
- [ ] Add tests for form components
- [ ] Add tests for table components
- [ ] Add tests for authentication components
- [ ] Target 60%+ coverage for components
- [ ] Commit: "test: Add component unit tests"

---

## Success Criteria

### Minimum Viable (Required for NPE)
- ✅ All backend tests compile
- ✅ All backend tests pass (42 files)
- ✅ All E2E tests pass (12 suites)
- ✅ CI/CD quality gates enforced
- ✅ Branch protection configured
- ✅ Frontend coverage > 60%

### Verification
```bash
# Backend
cd userManagementApi
mvn clean test
# Expected: BUILD SUCCESS, Tests run: 100+, Failures: 0

# Frontend Unit
cd fincore_WebUI
npm test -- --watchAll=false --coverage
# Expected: Coverage > 60%

# Frontend E2E
npm run test:e2e
# Expected: 12 passed

# CI/CD
git push origin feature/test-fixes
# Expected: All checks pass
```

---

## Progress Tracking

**Day 1:**
- [ ] Task 1.1 - Fix repository methods
- [ ] Task 1.2 - Fix service signatures
- [ ] Task 1.3 - Fix entity fields

**Day 2:**
- [ ] Task 1.4 - Fix enum values
- [ ] Task 1.5 - Verify all tests pass

**Day 3:**
- [ ] Task 2.1 - Fix authentication
- [ ] Task 2.2 - Fix API connectivity
- [ ] Task 2.3 - Run E2E tests

**Day 4:**
- [ ] Task 3.1 - Re-enable backend tests
- [ ] Task 3.2 - Add coverage threshold
- [ ] Task 3.3 - Configure branch protection

**Day 5:**
- [ ] Task 4.1 - Organization integration tests
- [ ] Task 4.2 - User integration tests
- [ ] Task 4.3 - KYC integration tests

**Day 6-7:**
- [ ] Task 5.1 - Service layer tests
- [ ] Task 5.2 - Component tests

---

## Rollout Plan

1. **Create feature branch:** `git checkout -b feature/critical-test-fixes`
2. **Fix backend tests** (Day 1-2)
3. **Open PR:** "fix: Restore backend test suite"
4. **Fix frontend E2E** (Day 3)
5. **Open PR:** "fix: Frontend E2E authentication"
6. **Update CI/CD** (Day 4)
7. **Open PR:** "ci: Enforce quality gates"
8. **Add integration tests** (Day 5)
9. **Add unit tests** (Day 6-7)
10. **Final verification**
11. **Merge to main**
12. **Allow NPE deployment**

---

## Communication

**Daily Standup Updates:**
- Report progress on checklist
- Highlight blockers
- Request help if needed

**Slack Updates:**
- Post test pass rates daily
- Share coverage improvements
- Celebrate milestones

**Documentation:**
- Update COMPREHENSIVE_TEST_REPORT.md daily
- Document any API changes found
- Update testing guidelines

---

## Emergency Contacts

**If Blocked:**
- Backend issues: [Backend team lead]
- Frontend issues: [Frontend team lead]
- CI/CD issues: [DevOps team lead]
- Database issues: [DBA team lead]

**Escalation Path:**
- Day 1-3: Team leads
- Day 4-5: Engineering manager
- Day 6+: CTO (critical path blocked)

---

**Last Updated:** January 14, 2025  
**Owner:** Development Team  
**Status:** 🔴 IN PROGRESS - 0% Complete
