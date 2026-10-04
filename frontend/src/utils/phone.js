/**
 * CoachKush Phone Number Normalization & Validation Utility
 *
 * Normalizes phone numbers to standard E.164 canonical format (+919876543210)
 * to ensure formatting differences never allow duplicate accounts.
 */

/**
 * Normalizes a raw phone string into canonical E.164 format.
 * Defaults to India (+91) if 10 digits are provided without a country code.
 *
 * @param {string} rawPhone - Raw user input (e.g. "+91 98765 43210", "9876543210", "09876543210")
 * @returns {string} Normalized phone (e.g. "+919876543210") or empty string if empty
 */
export const normalizePhoneNumber = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') return '';

  // Remove all whitespace, hyphens, dots, parentheses
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (!cleaned) return '';

  // Handle leading 0 (common domestic Indian notation e.g. 09876543210)
  if (/^0[0-9]{10}$/.test(cleaned)) {
    cleaned = '+91' + cleaned.substring(1);
  }
  // Exactly 10 digits (standard Indian mobile without country prefix)
  else if (/^[0-9]{10}$/.test(cleaned)) {
    cleaned = '+91' + cleaned;
  }
  // 12 digits starting with 91 but missing '+'
  else if (/^91[0-9]{10}$/.test(cleaned)) {
    cleaned = '+' + cleaned;
  }
  // International number missing '+'
  else if (!cleaned.startsWith('+') && cleaned.length >= 10) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};

/**
 * Validates whether the provided phone number is a valid canonical phone number.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhoneNumber = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  // Valid E.164 phone: starts with +, followed by 10 to 15 digits
  return /^\+[1-9]\d{9,14}$/.test(normalized);
};

/**
 * Formats a phone number for user-friendly display (e.g. "+91 98765 43210").
 *
 * @param {string} phone
 * @returns {string}
 */
export const formatPhoneDisplay = (phone) => {
  const norm = normalizePhoneNumber(phone);
  if (!norm) return '';

  // Indian standard format: +91 XXXXX XXXXX
  if (norm.startsWith('+91') && norm.length === 13) {
    return `${norm.slice(0, 3)} ${norm.slice(3, 8)} ${norm.slice(8)}`;
  }

  return norm;
};

export default {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneDisplay,
};
