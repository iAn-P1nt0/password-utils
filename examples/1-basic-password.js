/**
 * Example 1: Basic Password Generation
 *
 * Demonstrates how to generate cryptographically secure passwords
 * with various configurations.
 */

const { generatePassword, getDefaultOptions } = require('password-kit');

console.log('=== Basic Password Generation ===\n');

// Example 1.1: Generate with default options
console.log('1. Default password (16 characters):');
const defaultPassword = generatePassword(getDefaultOptions());
console.log(`   Password: ${defaultPassword.password}`);
console.log(`   Strength: ${defaultPassword.strength}`);
console.log(`   Entropy: ${defaultPassword.entropy.toFixed(2)} bits\n`);

// Example 1.2: Custom length
console.log('2. Longer password (24 characters):');
const longPassword = generatePassword({
  ...getDefaultOptions(),
  length: 24
});
console.log(`   Password: ${longPassword.password}`);
console.log(`   Strength: ${longPassword.strength}`);
console.log(`   Entropy: ${longPassword.entropy.toFixed(2)} bits\n`);

// Example 1.3: Only letters and numbers (no symbols)
console.log('3. Alphanumeric only (no symbols):');
const alphanumericPassword = generatePassword({
  ...getDefaultOptions(),
  length: 16,
  includeSymbols: false
});
console.log(`   Password: ${alphanumericPassword.password}`);
console.log(`   Strength: ${alphanumericPassword.strength}\n`);

// Example 1.4: Exclude ambiguous characters
console.log('4. No ambiguous characters (0, O, l, 1, I):');
const clearPassword = generatePassword({
  ...getDefaultOptions(),
  length: 16,
  excludeAmbiguous: true
});
console.log(`   Password: ${clearPassword.password}`);
console.log(`   Strength: ${clearPassword.strength}\n`);

// Example 1.5: Numbers only (PIN-like)
console.log('5. Numbers only (8 digits):');
const pin = generatePassword({
  ...getDefaultOptions(),
  length: 8,
  includeUppercase: false,
  includeLowercase: false,
  includeSymbols: false,
  includeNumbers: true
});
console.log(`   PIN: ${pin.password}`);
console.log(`   Strength: ${pin.strength}\n`);

// Example 1.6: Maximum security
console.log('6. Maximum security (32 characters, all types):');
const maxSecurityPassword = generatePassword({
  ...getDefaultOptions(),
  length: 32,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
});
console.log(`   Password: ${maxSecurityPassword.password}`);
console.log(`   Strength: ${maxSecurityPassword.strength}`);
console.log(`   Entropy: ${maxSecurityPassword.entropy.toFixed(2)} bits\n`);
