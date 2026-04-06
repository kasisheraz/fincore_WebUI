/**
 * Mock data for development and fallback when backend is unavailable
 */

import { KYCDocument } from '../types/kycDocument.types';
import { Question } from '../types/questionnaire.types';
import { PaginatedResponse } from '../types/common.types';

// Mock KYC Documents
export const MOCK_KYC_DOCUMENTS: KYCDocument[] = [
  {
    id: 1,
    userId: 1,
    documentType: 'PASSPORT',
    documentNumber: 'P12345678',
    fileName: 'passport_john_doe.pdf',
    fileUrl: '/documents/passport_john_doe.pdf',
    fileSize: 2048000,
    mimeType: 'application/pdf',
    uploadedAt: '2026-04-01T10:00:00Z',
    status: 'PENDING',
    expiryDate: '2030-01-15',
    notes: 'Passport document for verification',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-01T10:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    documentType: 'NATIONAL_ID',
    documentNumber: 'N87654321',
    fileName: 'national_id_jane_smith.pdf',
    fileUrl: '/documents/national_id_jane_smith.pdf',
    fileSize: 1536000,
    mimeType: 'application/pdf',
    uploadedAt: '2026-04-02T14:30:00Z',
    status: 'VERIFIED',
    verifiedBy: 3,
    verifiedAt: '2026-04-03T09:00:00Z',
    expiryDate: '2031-06-20',
    createdAt: '2026-04-02T14:30:00Z',
    updatedAt: '2026-04-03T09:00:00Z'
  },
  {
    id: 3,
    userId: 1,
    documentType: 'DRIVERS_LICENSE',
    documentNumber: 'DL9876543',
    fileName: 'drivers_license_john_doe.pdf',
    fileUrl: '/documents/drivers_license_john_doe.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    uploadedAt: '2026-04-03T16:45:00Z',
    status: 'REJECTED',
    rejectionReason: 'Document has expired',
    expiryDate: '2026-03-10',
    createdAt: '2026-04-03T16:45:00Z',
    updatedAt: '2026-04-04T11:00:00Z'
  }
];

// Mock Questionnaires
export const MOCK_QUESTIONNAIRES: Question[] = [
  {
    id: 1,
    questionText: 'What is your annual income range?',
    questionType: 'MULTIPLE_CHOICE',
    category: 'FINANCIAL',
    orderIndex: 1,
    isRequired: true,
    status: 'ACTIVE',
    options: ['Less than $50,000', '$50,000 - $100,000', '$100,000 - $200,000', 'More than $200,000'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 2,
    questionText: 'What is your primary source of funds?',
    questionType: 'MULTIPLE_CHOICE',
    category: 'FINANCIAL',
    orderIndex: 2,
    isRequired: true,
    status: 'ACTIVE',
    options: ['Employment', 'Business Income', 'Investments', 'Inheritance', 'Other'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 3,
    questionText: 'What is your investment experience?',
    questionType: 'MULTIPLE_CHOICE',
    category: 'RISK_ASSESSMENT',
    orderIndex: 3,
    isRequired: true,
    status: 'ACTIVE',
    options: ['None', 'Limited (less than 2 years)', 'Moderate (2-5 years)', 'Extensive (more than 5 years)'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 4,
    questionText: 'Are you a politically exposed person (PEP)?',
    questionType: 'YES_NO',
    category: 'COMPLIANCE',
    orderIndex: 4,
    isRequired: true,
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 5,
    questionText: 'Describe your financial goals',
    questionType: 'TEXT',
    category: 'GENERAL',
    orderIndex: 5,
    isRequired: false,
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  }
];

// Mock Customer Answers
export const MOCK_CUSTOMER_ANSWERS = [
  {
    id: 1,
    userId: 1,
    questionId: 1,
    answerText: '$100,000 - $200,000',
    answeredAt: '2026-04-01T10:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    questionId: 2,
    answerText: 'Employment',
    answeredAt: '2026-04-01T10:01:00Z'
  },
  {
    id: 3,
    userId: 1,
    questionId: 3,
    answerText: 'Moderate (2-5 years)',
    answeredAt: '2026-04-01T10:02:00Z'
  },
  {
    id: 4,
    userId: 1,
    questionId: 4,
    answerText: 'No',
    answeredAt: '2026-04-01T10:03:00Z'
  },
  {
    id: 5,
    userId: 2,
    questionId: 1,
    answerText: '$50,000 - $100,000',
    answeredAt: '2026-04-02T14:00:00Z'
  },
  {
    id: 6,
    userId: 2,
    questionId: 2,
    answerText: 'Business Income',
    answeredAt: '2026-04-02T14:01:00Z'
  }
];

// Mock KYC Verifications
export const MOCK_KYC_VERIFICATIONS = [
  {
    id: 1,
    userId: 1,
    organisationId: 1,
    verificationType: 'IDENTITY',
    status: 'VERIFIED',
    verifiedBy: 3,
    verifiedAt: '2026-04-03T09:00:00Z',
    notes: 'Identity verified successfully',
    createdDatetime: '2026-04-01T10:00:00Z',
    lastModifiedDatetime: '2026-04-03T09:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    organisationId: 1,
    verificationType: 'ADDRESS',
    status: 'PENDING',
    notes: 'Awaiting utility bill verification',
    createdDatetime: '2026-04-02T14:30:00Z',
    lastModifiedDatetime: '2026-04-02T14:30:00Z'
  },
  {
    id: 3,
    userId: 1,
    organisationId: 1,
    verificationType: 'FINANCIAL',
    status: 'REJECTED',
    rejectionReason:' Insufficient documentation provided',
    rejectedBy: 3,
    rejectedAt: '2026-04-04T11:00:00Z',
    createdDatetime: '2026-04-03T16:45:00Z',
    lastModifiedDatetime: '2026-04-04T11:00:00Z'
  }
];

/**
 * Helper function to create paginated response from mock data
 */
export function createMockPaginatedResponse<T>(
  data: T[],
  page: number = 0,
  size: number = 10
): PaginatedResponse<T> {
  const start = page * size;
  const end = start + size;
  const content = data.slice(start, end);

  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { sorted: false, empty: true, unsorted: true },
      offset: start,
      paged: true,
      unpaged: false
    },
    totalElements: data.length,
    totalPages: Math.ceil(data.length / size),
    size,
    number: page,
    sort: { sorted: false, empty: true, unsorted: true },
    numberOfElements: content.length,
    first: page === 0,
    last: end >= data.length,
    empty: content.length === 0
  };
}
