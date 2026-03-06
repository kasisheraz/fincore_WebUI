/**
 * Application constants
 */

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Driver License', value: 'DRIVER_LICENSE' },
  { label: 'National ID', value: 'NATIONAL_ID' },
  { label: 'Other', value: 'OTHER' },
];

export const DOCUMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export const VERIFICATION_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export const ORGANIZATION_TYPE_OPTIONS = [
  { label: 'Corporation', value: 'CORPORATION' },
  { label: 'LLC', value: 'LLC' },
  { label: 'Partnership', value: 'PARTNERSHIP' },
  { label: 'Sole Proprietorship', value: 'SOLE_PROPRIETORSHIP' },
  { label: 'Non-Profit', value: 'NON_PROFIT' },
];

export const QUESTION_TYPE_OPTIONS = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
  { label: 'Yes/No', value: 'YES_NO' },
  { label: 'Date', value: 'DATE' },
  { label: 'Number', value: 'NUMBER' },
];

export const PAGINATION_OPTIONS = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 10;

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const MAX_FILE_SIZE_MB = 10;

export const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

export const STATUS_COLORS = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'warning',
  SUSPENDED: 'error',
  APPROVED: 'success',
  REJECTED: 'error',
  IN_REVIEW: 'info',
  VERIFIED: 'success',
} as const;
