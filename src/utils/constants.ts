/**
 * Application constants
 */

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

export const ORGANIZATION_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Articles of Association', value: 'ARTICLES_OF_ASSOCIATION' },
  { label: 'Certificate of Incorporation', value: 'CERTIFICATE_OF_INCORPORATION' },
  { label: 'Proof of Address', value: 'PROOF_OF_ADDRESS' },
  { label: 'Director ID', value: 'DIRECTOR_ID' },
  { label: 'Shareholder Register', value: 'SHAREHOLDER_REGISTER' },
  { label: 'Bank Statement', value: 'BANK_STATEMENT' },
  { label: 'Tax Registration', value: 'TAX_REGISTRATION' },
  { label: 'Other', value: 'OTHER' },
];

export const DOCUMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export const VERIFICATION_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export const VERIFICATION_LEVEL_OPTIONS = [
  { label: 'Basic', value: 'BASIC' },
  { label: 'Enhanced', value: 'ENHANCED' },
  { label: 'Full', value: 'FULL' },
];

export const RISK_LEVEL_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

export const ORGANIZATION_TYPE_OPTIONS = [
  { label: 'Limited Company (LTD)', value: 'LTD' },
  { label: 'Public Limited Company (PLC)', value: 'PLC' },
  { label: 'Sole Trader', value: 'SOLE_TRADER' },
  { label: 'Partnership', value: 'PARTNERSHIP' },
  { label: 'Limited Liability Partnership (LLP)', value: 'LLP' },
  { label: 'Charity', value: 'CHARITY' },
  { label: 'Community Interest Company (CIC)', value: 'CIC' },
];

export const QUESTION_CATEGORY_OPTIONS = [
  { label: 'Personal Info', value: 'PERSONAL_INFO' },
  { label: 'Financial', value: 'FINANCIAL' },
  { label: 'Employment', value: 'EMPLOYMENT' },
  { label: 'Identification', value: 'IDENTIFICATION' },
  { label: 'Risk Assessment', value: 'RISK_ASSESSMENT' },
  { label: 'Compliance', value: 'COMPLIANCE' },
];

export const QUESTION_STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export const PAGINATION_OPTIONS = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 10;

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * User Roles - Hierarchy from lowest to highest privileges
 */
export const USER_ROLES = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SYSTEM_ADMINISTRATOR: 'SYSTEM_ADMINISTRATOR',
} as const;

/**
 * Roles that should be hidden from regular user management
 * These roles can only be managed through special admin endpoints
 */
export const PROTECTED_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

/**
 * Roles available for user creation in the UI
 * Only non-admin roles can be created through the standard UI
 */
export const CREATABLE_ROLES = [
  { label: 'User', value: USER_ROLES.USER },
  { label: 'Manager', value: USER_ROLES.MANAGER },
];

/**
 * Check if a role is protected (admin-level)
 */
export const isProtectedRole = (role?: string): boolean => {
  if (!role) return false;
  return PROTECTED_ROLES.includes(role as any);
};

/**
 * Check if current user can manage other users
 */
export const canManageUsers = (userRole?: string): boolean => {
  if (!userRole) return false;
  return [
    USER_ROLES.MANAGER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.SYSTEM_ADMINISTRATOR,
  ].includes(userRole as any);
};

/**
 * Check if current user can delete users
 */
export const canDeleteUsers = (userRole?: string): boolean => {
  if (!userRole) return false;
  return [
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.SYSTEM_ADMINISTRATOR,
  ].includes(userRole as any);
};

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
  EXPIRED: 'default',
  VERIFIED: 'success',
  ARCHIVED: 'default',
} as const;
