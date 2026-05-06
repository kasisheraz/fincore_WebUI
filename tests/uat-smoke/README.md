# UAT Smoke Tests

Lightweight automated tests that verify core functionality of the FinCore application in the UAT environment after each deployment.

## Purpose

These smoke tests are designed to:
- ✅ Verify UAT environment health after deployments
- ✅ Test critical user flows (login, navigation, basic operations)
- ✅ Catch deployment issues early
- ✅ Provide quick feedback (< 2 minutes)
- ✅ Run sequentially for reliability

## Test Structure

### 01-health.spec.ts
Health check tests that verify environment availability:
- Frontend accessibility
- API health endpoint
- API authentication endpoint
- Static assets loading

### 02-auth.spec.ts
Authentication flow tests:
- Login page rendering
- International phone number validation (8-15 digits)
- OTP request functionality
- OTP verification UI
- Mobile responsiveness

### 03-operations.spec.ts
Basic operational tests:
- Navigation and routing
- Protected route access control
- UI component rendering
- API integration
- Performance benchmarks
- Mobile compatibility

## Running the Tests

### Prerequisites
```bash
npm install
npx playwright install
```

### Run All Smoke Tests
```bash
npm run test:uat:smoke
```

### Run with Browser Visible (Headed Mode)
```bash
npm run test:uat:smoke:headed
```

### View Test Report
```bash
npm run test:uat:smoke:report
```

### Run Specific Test File
```bash
npx playwright test tests/uat-smoke/01-health.spec.ts --config=playwright.uat.config.ts
```

## Configuration

Tests are configured in `playwright.uat.config.ts`:
- **Base URL**: https://fincore-webui-uat-994490239798.europe-west2.run.app
- **API URL**: https://fincore-uat-api-994490239798.europe-west2.run.app
- **Timeout**: 60 seconds per test
- **Execution**: Sequential (workers: 1) for reliability
- **Retries**: 2 attempts per test
- **Reporters**: HTML, JSON, JUnit

## Test Credentials

**Test User (Admin)**:
- Phone: +447700900000 (UK format)
- OTP: Retrieved from backend logs during test

## Expected Test Duration

| Test Suite | Tests | Duration |
|------------|-------|----------|
| Health Checks | 4 | ~20 seconds |
| Authentication | 8 | ~40 seconds |
| Operations | 13 | ~60 seconds |
| **Total** | **25** | **~2 minutes** |

## CI/CD Integration

### GitHub Actions Workflow
Create `.github/workflows/uat-smoke-tests.yml`:

```yaml
name: UAT Smoke Tests

on:
  workflow_dispatch:
  deployment_status:

jobs:
  smoke-test:
    if: github.event.deployment_status.state == 'success' && github.event.deployment_status.environment == 'uat'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run UAT smoke tests
        run: npm run test:uat:smoke
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: uat-smoke-test-results
          path: |
            uat-smoke-report/
            test-results/
      
      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "❌ UAT Smoke Tests Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*UAT Smoke Tests Failed*\n\nDeployment may need to be rolled back."
                  }
                }
              ]
            }
```

### Cloud Build Integration
Add to your `cloudbuild.yaml`:

```yaml
steps:
  # ... existing build steps ...
  
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'fincore_WebUI'
  
  - name: 'mcr.microsoft.com/playwright:v1.40.0-jammy'
    entrypoint: 'npm'
    args: ['run', 'test:uat:smoke']
    dir: 'fincore_WebUI'
    env:
      - 'CI=true'
```

## Test Maintenance

### Adding New Tests
1. Create new spec file in `tests/uat-smoke/`
2. Use sequential numbering: `04-feature.spec.ts`
3. Keep tests lightweight (< 30 seconds each)
4. Focus on critical paths only

### Updating Test Data
If test credentials change, update:
- `UAT_CREDENTIALS` constant in `02-auth.spec.ts`
- `UAT_PHONE` constant in `03-operations.spec.ts`
- This README

### Handling Test Failures
1. **Check UAT Environment**: Verify services are running
2. **Review Logs**: Check Cloud Run logs for errors
3. **Run Locally**: Test with headed mode to see visual issues
4. **Check Recent Changes**: Review recent deployments
5. **Rollback if Needed**: Revert to previous working version

## Troubleshooting

### Tests Timeout
- **Cause**: UAT environment may be cold-starting
- **Solution**: Increase timeout in `playwright.uat.config.ts` or retry

### Login Tests Fail
- **Cause**: Test user account may be locked or phone validation changed
- **Solution**: Verify test account status in database

### API Tests Fail
- **Cause**: Backend service may be down or misconfigured
- **Solution**: Check Cloud Run service status and environment variables

### Network Errors
- **Cause**: Connectivity issues or Cloud Run authorization
- **Solution**: Verify service is publicly accessible and DNS is resolving

## Best Practices

✅ **DO:**
- Keep tests fast and focused
- Test critical user journeys only
- Use sequential execution for stability
- Include performance thresholds
- Document test credentials

❌ **DON'T:**
- Add slow or flaky tests
- Test every feature in detail (use E2E tests for that)
- Use production data
- Hard-code sensitive data
- Run tests in parallel (UAT environment may not handle it)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions Workflows](https://docs.github.com/en/actions)

## Support

For issues or questions about UAT smoke tests:
1. Check test output and logs
2. Review this documentation
3. Check Cloud Run service logs
4. Contact the DevOps team
