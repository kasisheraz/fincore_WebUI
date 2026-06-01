/**
 * Application constants - UI Passthrough Mode
 * 
 * ⚠️ IMPORTANT: All dropdown values are now fetched dynamically from the backend.
 * DO NOT add hardcoded dropdown options here. Use enumService.ts instead.
 * 
 * Migration from hardcoded to dynamic:
 * - Roles: roleService.getAllRoles()
 * - User Status: enumService.getUserStatus()
 * - Organization Status: enumService.getOrganizationStatus()
 * - Organization Type: enumService.getOrganizationType()
 * - Document Type: enumService.getDocumentType()
 * - Document Status: enumService.getDocumentStatus()
 * - Verification Status: enumService.getVerificationStatus()
 * - Address Type: enumService.getAddressType()
 * - Verification Level: enumService.getVerificationLevel()
 * - Screening Type: enumService.getScreeningType()
 * - Risk Level: enumService.getRiskLevel()
 * - Question Category: enumService.getQuestionCategory()
 * 
 * This file only contains:
 * - UI configuration constants (pagination, date formats)
 * - Protected role identifiers for security checks
 * - Helper functions for role validation
 */

/**
 * Gender options - not yet migrated to backend enum
 * TODO: Create Gender enum in backend and migrate to enumService
 */
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

/**
 * Question type options - not yet migrated to backend enum
 * TODO: Create QuestionType enum in backend and migrate to enumService
 */
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
 * NOTE: Roles are now fetched dynamically from the backend API.
 * These constants are kept only for backwards compatibility and helper functions.
 * The actual available roles come from the database via /api/roles endpoint.
 */

/**
 * Legacy role constants - DO NOT USE for dropdown options
 * Use roleService.getAllRoles() instead
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SYSTEM_ADMINISTRATOR: 'SYSTEM_ADMINISTRATOR',
} as const;

/**
 * Roles that should be hidden from regular user management
 * These roles can only be managed through special admin endpoints
 */
export const PROTECTED_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
];

/**
 * Check if a role is protected (admin-level)
 * @param role - Role name to check
 * @returns true if the role is protected (SUPER_ADMIN or SYSTEM_ADMINISTRATOR)
 */
export const isProtectedRole = (role?: string): boolean => {
  if (!role) return false;
  return PROTECTED_ROLES.includes(role as any);
};

/**
 * Check if current user can manage other users
 * @param userRole - Current user's role
 * @returns true if user has permission to manage users
 */
export const canManageUsers = (userRole?: string): boolean => {
  if (!userRole) return false;
  // Admin, Operational, and system roles can manage users
  return [
    'Admin',
    'Operational',
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.SYSTEM_ADMINISTRATOR,
  ].includes(userRole as any);
};

/**
 * Check if current user can delete users
 * @param userRole - Current user's role
 * @returns true if user has permission to delete users
 */
export const canDeleteUsers = (userRole?: string): boolean => {
  if (!userRole) return false;
  // Only Admin and system roles can delete users
  return [
    'Admin',
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
  UNDER_REVIEW: 'info',
  VERIFIED: 'success',
} as const;
