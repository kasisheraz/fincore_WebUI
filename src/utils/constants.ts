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
  { label: 'Government', value: 'GOVERNMENT' },
  { label: 'Private', value: 'PRIVATE' },
  { label: 'Non-Profit', value: 'NON_PROFIT' },
  { label: 'Public', value: 'PUBLIC' },
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
  IN_REVIEW: 'info',
  VERIFIED: 'success',
} as const;
