/**
 * Utility functions for validation
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
};

/**
 * Validate OTP (6 digits)
 */
export const isValidOTP = (otp: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, length: number): boolean => {
  return value.length >= length;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, length: number): boolean => {
  return value.length <= length;
};

/**
 * Validate date of birth (must be 18 years or older)
 */
export const isValidAge = (dateOfBirth: string, minAge: number = 18): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate postal code (US format)
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{5}(-\d{4})?$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size (in MB)
 */
export const isValidFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
