/**
 * @trustvault/password-utils
 * 
 * Cryptographically secure password and passphrase generation utilities
 * with comprehensive strength analysis.
 * 
 * @packageDocumentation
 */

// Password Generator
export {
  generatePassword,
  generatePasswords,
  generatePronounceablePassword,
  getDefaultOptions,
  type PasswordGeneratorOptions,
  type GeneratedPassword,
} from './generators/password';

// Passphrase Generator
export {
  generatePassphrase,
  generateMemorablePassphrase,
  getDefaultPassphraseOptions,
  type PassphraseOptions,
} from './generators/passphrase';

// Strength Analysis
export {
  analyzePasswordStrength,
  type PasswordStrengthResult,
} from './analyzer/strength';

// Quick Check & Validation
export {
  quickStrengthCheck,
  meetsMinimumRequirements,
  type QuickStrengthResult,
  type MinimumRequirementsResult,
} from './analyzer/quick-check';

// Breach Checking
export {
  checkPasswordBreach,
  clearBreachCache,
  type BreachResult,
  type BreachCheckOptions,
} from './analyzer/breach';

// Utilities
export {
  formatTOTPCode,
} from './utils';
