# E2E Testing Strategy

## Quick Reference

```bash
# Smoke tests (pre-push) - 8 tests, ~30 seconds
npm run test:e2e:smoke

# Full test suite - 177 tests, ~15-20 minutes
npm run test:e2e

# Debug mode with browser visible
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui
```

## Test Suites

### 🚀 Smoke Tests (`smoke.spec.ts`)
**Purpose:** Fast critical path validation before pushing code  
**Runs:** Pre-push hook, local development  
**Duration:** ~30 seconds  
**Coverage:**
- ✅ Login flow
- ✅ Dashboard navigation
- ✅ Users page (navigation + create dialog)
- ✅ Organizations page (navigation + create dialog)
- ✅ KYC Documents navigation
- ✅ Questionnaire navigation
- ✅ Logout flow

**Philosophy:** Catch breaking changes fast without blocking developers

### 🔬 Full CRUD Tests (`crud-operations.spec.ts`)
**Purpose:** Comprehensive end-to-end validation  
**Runs:** CI/CD pipeline, manual testing  
**Duration:** ~15-20 minutes (with 4 parallel workers)  
**Coverage:**
- ✅ Full CRUD operations for all entities
- ✅ Edge cases and error handling
- ✅ Data validation
- ✅ Complex workflows

**Philosophy:** Ensure production quality before deployment

## Configuration

### Local Development
- **Workers:** 4 parallel (fast execution)
- **Retries:** 0 (fail fast)
- **Max Failures:** 10 (stop early to save time)

### CI/CD Pipeline
- **Workers:** 1 (stable, sequenced)
- **Retries:** 2 (handle flaky tests)
- **Max Failures:** None (run all tests)

## Prerequisites

### Backend API Must Be Running
E2E tests require the backend API at `http://localhost:8080`

```powershell
# Start backend before running tests
cd ..\userManagementApi
$env:SPRING_PROFILES_ACTIVE="local-h2"
mvn spring-boot:run -DskipTests
```

### Frontend Dev Server
Tests run against `http://localhost:3000`

```bash
npm start
```

## Troubleshooting

### ❌ All tests timing out?
**Cause:** Backend API not running  
**Fix:** Start the backend first `mvn spring-boot:run -DskipTests`

### ❌ Tests fail on push?
**Cause:** Smoke tests failed (critical path broken)  
**Fix:** Run `npm run test:e2e:smoke` locally to debug

**Bypass** (emergency only): `git push --no-verify`

### ⏱️ Tests taking too long?
**Cause:** Running full suite instead of smoke tests  
**Fix:** Use `npm run test:e2e:smoke` for quick validation

## Best Practices

1. **Always run smoke tests** before pushing
2. **Run full suite** after major changes
3. **Use headed mode** (`--headed`) when debugging failures
4. **Check backend logs** if tests mysteriously fail

## CI/CD Integration

GitHub Actions runs the full suite automatically:
- ✅ On pull requests
- ✅ Before merging to main
- ✅ On deployment pipelines

See `.github/workflows/` for configuration.
