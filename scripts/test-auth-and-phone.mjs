import fs from 'fs';
import path from 'path';
import { normalizePhoneNumber, isValidPhoneNumber } from '../frontend/src/utils/phone.js';
import { mapAuthError } from '../frontend/src/services/authService.js';

console.log('=== RUNNING COMPREHENSIVE COACHKUSH AUTH & SECURITY AUDIT ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// ==========================================
// TEST SUITE 1: PHONE NORMALIZATION
// ==========================================
console.log('--- Test Suite 1: Phone Normalization & Validation ---');

const testCases = [
  { input: '+91 98765 43210', expected: '+919876543210' },
  { input: '+919876543210', expected: '+919876543210' },
  { input: '+91-9876543210', expected: '+919876543210' },
  { input: '9876543210', expected: '+919876543210' },
  { input: '09876543210', expected: '+919876543210' },
  { input: '+91 98 7654 3210', expected: '+919876543210' },
  { input: '919876543210', expected: '+919876543210' },
  { input: '+1 415 555 2671', expected: '+14155552671' },
];

for (const tc of testCases) {
  const norm = normalizePhoneNumber(tc.input);
  assert(norm === tc.expected, `Normalize "${tc.input}" -> "${norm}" (expected: "${tc.expected}")`);
  assert(isValidPhoneNumber(tc.input), `Validation passed for valid phone "${tc.input}"`);
}

assert(!isValidPhoneNumber('12345'), 'Validation correctly rejects short invalid phone "12345"');
assert(!isValidPhoneNumber('abcdef'), 'Validation correctly rejects alphabetic string "abcdef"');

// ==========================================
// TEST SUITE 2: ERROR MAPPING (DUPLICATE PROTECTION)
// ==========================================
console.log('\n--- Test Suite 2: Error Mapping & Duplicate Protection ---');

const duplicateEmailErrors = [
  { message: 'User already registered' },
  { message: 'email address already registered' },
  { message: 'Email already in use' },
  { message: 'duplicate key value violates unique constraint "auth_users_email_key"' },
];

for (const err of duplicateEmailErrors) {
  const mapped = mapAuthError(err);
  assert(
    mapped.message === 'An account with this email already exists.',
    `Mapped email error "${err.message}" -> "${mapped.message}"`
  );
}

const duplicatePhoneErrors = [
  { message: 'PHONE_ALREADY_EXISTS: An account with this phone number already exists.' },
  { message: 'duplicate key value violates unique constraint "profiles_phone_key"' },
  { message: 'duplicate key value violates unique constraint "idx_profiles_normalized_phone"' },
  { message: 'duplicate key value violates unique constraint on phone' },
];

for (const err of duplicatePhoneErrors) {
  const mapped = mapAuthError(err);
  assert(
    mapped.message === 'An account with this phone number already exists.',
    `Mapped phone error "${err.message}" -> "${mapped.message}"`
  );
}

const networkError = { message: 'Failed to fetch' };
assert(
  mapAuthError(networkError).message === 'Unable to connect to authentication server. Please check your network connection.',
  'Network error cleanly mapped without technical details'
);

const rateLimitError = { message: 'Email rate limit exceeded' };
assert(
  mapAuthError(rateLimitError).message === 'Email rate limit reached on auth server. Please wait a few minutes before trying again.',
  'Rate limit error cleanly mapped'
);

const rawDbError = { message: 'syntax error at or near SELECT in postgresql' };
assert(
  mapAuthError(rawDbError).message === 'Unable to create your account right now. Please try again.',
  'Raw DB error sanitized to user-friendly generic message'
);

// ==========================================
// TEST SUITE 3: FRONTEND BUNDLE SECRETS AUDIT
// ==========================================
console.log('\n--- Test Suite 3: Frontend Bundle Secrets & URL Audit ---');

const distAssets = fs.readdirSync('dist/assets');
const jsFiles = distAssets.filter((f) => f.endsWith('.js'));

assert(jsFiles.length > 0, `Found ${jsFiles.length} JavaScript asset bundle(s)`);

const forbiddenTerms = [
  'kush-frontend.vercel.app',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'SMTP_PASSWORD',
];

for (const jsFile of jsFiles) {
  const content = fs.readFileSync(path.join('dist/assets', jsFile), 'utf-8');
  for (const term of forbiddenTerms) {
    const hasTerm = content.includes(term);
    assert(!hasTerm, `Bundle "${jsFile}" does not contain forbidden string "${term}"`);
  }
}

// ==========================================
// TEST SUITE 4: SUMMARY
// ==========================================
console.log(`\n==========================================`);
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} tests passed`);
console.log(`==========================================`);

if (passedTests === totalTests) {
  console.log('ALL AUDIT CHECKS PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error('SOME CHECKS FAILED!\n');
  process.exit(1);
}
