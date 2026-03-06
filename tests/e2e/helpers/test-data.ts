/**
 * Test data generators for E2E tests
 */

export const generateUniqueId = () => `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

export const testOrganization = {
  name: `Test Organization ${generateUniqueId()}`,
  organizationType: 'CORPORATION',
  registrationNumber: 'REG123456',
  taxId: 'TAX987654',
  email: 'test@organization.com',
  phoneNumber: '+1234567890',
  website: 'https://test-org.com',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'USA'
  }
};

export const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test.user.${generateUniqueId()}@example.com`,
  phoneNumber: '+1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'MALE',
  address: {
    street: '456 User Avenue',
    city: 'User City',
    state: 'UC',
    zipCode: '54321',
    country: 'USA'
  }
};

export const testQuestionnaire = {
  title: `Test Questionnaire ${generateUniqueId()}`,
  description: 'This is a test questionnaire',
  questions: [
    {
      questionText: 'What is your annual income?',
      questionType: 'TEXT',
      required: true,
      options: []
    },
    {
      questionText: 'Are you employed?',
      questionType: 'BOOLEAN',
      required: true,
      options: []
    },
    {
      questionText: 'Select your employment type',
      questionType: 'SINGLE_CHOICE',
      required: true,
      options: ['Full-time', 'Part-time', 'Self-employed', 'Unemployed']
    }
  ]
};

export const testKYCDocument = {
  documentType: 'PASSPORT',
  documentNumber: 'P12345678',
  issueDate: '2020-01-01',
  expiryDate: '2030-01-01',
  issuingCountry: 'USA'
};

export const waitForApiResponse = async (page: any, url: string) => {
  return page.waitForResponse((response: any) => 
    response.url().includes(url) && response.status() === 200
  );
};
