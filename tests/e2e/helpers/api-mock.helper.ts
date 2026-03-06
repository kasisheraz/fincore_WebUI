import { Page } from '@playwright/test';

/**
 * Helper to mock API responses for testing without backend
 */
export class ApiMockHelper {
  constructor(private page: Page) {}

  /**
   * Mock authentication endpoints
   */
  async mockAuthEndpoints() {
    // Mock OTP request
    await this.page.route('**/api/auth/request-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'OTP sent successfully',
          devOtp: '123456' // Return dev OTP for testing
        })
      });
    });

    // Mock OTP verification
    await this.page.route('**/api/auth/verify-otp', async (route) => {
      const postData = route.request().postDataJSON();
      
      // Accept test OTP
      if (postData.otp === '123456') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-jwt-token-for-testing',
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@fincore.com',
              phoneNumber: postData.phoneNumber,
              dateOfBirth: '1990-01-01',
              gender: 'MALE',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid OTP. Please try again.'
          })
        });
      }
    });

    // Mock user info endpoint
    await this.page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@fincore.com',
          phoneNumber: '1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
    });
  }

  /**
   * Mock dashboard statistics endpoint
   */
  async mockDashboardEndpoints() {
    await this.page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalOrganizations: 45,
          totalUsers: 1250,
          pendingApplications: 23,
          completedKYC: 890,
          recentActivity: []
        })
      });
    });
  }

  /**
   * Mock organizations endpoints
   */
  async mockOrganizationsEndpoints() {
    // Use multiple patterns to ensure we match the actual API URL
    const organizationsHandler = async (route: any) => {
      const method = route.request().method();
      const url = route.request().url();
      console.log(`[MOCK] Organizations request: ${method} ${url}`);
      
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [
              {
                id: 1,
                name: 'Test Organization',
                type: 'GOVERNMENT',
                registrationNumber: 'REG-001',
                taxId: 'TAX-001',
                email: 'org@test.com',
                phoneNumber: '+1234567890',
                website: 'https://test.com',
                description: 'A test organization',
                status: 'ACTIVE',
                addresses: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: false
          })
        });
      } else if (method === 'POST') {
        let postData: any = {};
        try { postData = route.request().postDataJSON() || {}; } catch (e) { /* no body */ }
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: Date.now(),
            ...postData,
            addresses: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        });
      } else {
        await route.continue();
      }
    };
    
    await this.page.route('**/api/organizations**', organizationsHandler);
    await this.page.route('http://localhost:8080/api/organizations**', organizationsHandler);
  }

  /**
   * Mock users endpoints
   */
  async mockUsersEndpoints() {
    await this.page.route('**/api/users**', async (route) => {
      const method = route.request().method();
      
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [
              {
                id: 1,
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                phoneNumber: '+1234567890',
                gender: 'MALE',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: false
          })
        });
      } else if (method === 'POST') {
        let postData: any = {};
        try { postData = route.request().postDataJSON() || {}; } catch (e) { /* no body */ }
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: Date.now(),
            ...postData,
            createdAt: new Date().toISOString()
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Mock all common endpoints
   */
  async mockAllEndpoints() {
    await this.mockAuthEndpoints();
    await this.mockDashboardEndpoints();
    await this.mockOrganizationsEndpoints();
    await this.mockUsersEndpoints();
    await this.mockKYCEndpoints();
    await this.mockQuestionnaireEndpoints();
    await this.mockCustomerAnswersEndpoints();
  }

  /**
   * Mock KYC endpoints
   */
  async mockKYCEndpoints() {
    await this.page.route('**/api/kyc-documents**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: true
          })
        });
      } else {
        await route.continue();
      }
    });

    await this.page.route('**/api/kyc-verifications**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: true
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Mock questionnaire endpoints
   */
  async mockQuestionnaireEndpoints() {
    await this.page.route('**/api/questions**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: true
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Mock customer answers endpoints
   */
  async mockCustomerAnswersEndpoints() {
    await this.page.route('**/api/customer-answers**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: true
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Enable API mocking with fallback to real API
   */
  async enableMockingWithFallback() {
    // This allows tests to work with either real API or mocked API
    // If real API responds, use it; otherwise, use mock
    
    this.page.on('requestfailed', async (request) => {
      if (request.url().includes('/api/')) {
        console.log(`API request failed: ${request.url()}, falling back to mock`);
      }
    });
  }
}
