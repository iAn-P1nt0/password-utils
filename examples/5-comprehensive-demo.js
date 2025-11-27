/**
 * Example 5: Comprehensive Demo
 *
 * A complete demonstration showcasing all features of the password-kit library
 * in a realistic password manager scenario.
 */

const {
  generatePassword,
  generatePasswords,
  generatePronounceablePassword,
  generatePassphrase,
  getDefaultOptions,
  analyzePasswordStrength,
  quickStrengthCheck,
  meetsMinimumRequirements,
  formatTOTPCode
} = require('password-kit');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Password Utils - Comprehensive Feature Demo           ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Feature 1: Batch Password Generation
console.log('📦 Feature 1: Batch Password Generation');
console.log('─'.repeat(60));
console.log('Generate multiple passwords at once for different accounts:\n');

const batchPasswords = generatePasswords(3, {
  length: 16,
  includeSymbols: true
});

batchPasswords.forEach((pwd, index) => {
  console.log(`Password ${index + 1}: ${pwd.password}`);
  console.log(`  Strength: ${pwd.strength} | Entropy: ${pwd.entropy.toFixed(2)} bits\n`);
});

// Feature 2: Pronounceable Passwords
console.log('🗣️  Feature 2: Pronounceable Passwords');
console.log('─'.repeat(60));
console.log('Easier to remember but still secure:\n');

const pronounceable = generatePronounceablePassword(16);
console.log(`Password: ${pronounceable.password}`);
console.log(`Strength: ${pronounceable.strength}`);
console.log(`Entropy: ${pronounceable.entropy.toFixed(2)} bits\n`);

// Feature 3: Passphrases for High Security
console.log('🔐 Feature 3: Diceware Passphrases');
console.log('─'.repeat(60));
console.log('Memorable and highly secure:\n');

const passphrase = generatePassphrase({
  wordCount: 6,
  separator: 'dash',
  capitalization: 'first',
  includeNumber: true
});

console.log(`Passphrase: ${passphrase.password}`);
console.log(`Strength: ${passphrase.strength}`);
console.log(`Entropy: ${passphrase.entropy.toFixed(2)} bits\n`);

// Feature 4: Password Strength Comparison
console.log('📊 Feature 4: Security Comparison');
console.log('─'.repeat(60));
console.log('Comparing different password types:\n');

const comparisons = [
  { type: 'Common', pwd: 'password123' },
  { type: '8-char random', pwd: generatePassword({ ...getDefaultOptions(), length: 8 }).password },
  { type: '16-char random', pwd: generatePassword(getDefaultOptions()).password },
  { type: '5-word passphrase', pwd: generatePassphrase({ wordCount: 5 }).password }
];

comparisons.forEach(test => {
  const analysis = analyzePasswordStrength(test.pwd);
  console.log(`${test.type}:`);
  console.log(`  Password: ${test.pwd}`);
  console.log(`  Score: ${analysis.score}/100 | Strength: ${analysis.strength}`);
  console.log(`  Crack Time: ${analysis.crackTime}\n`);
});

// Feature 5: Real-time Validation Simulation
console.log('⚡ Feature 5: Real-time Input Validation');
console.log('─'.repeat(60));
console.log('Simulating user typing in a form:\n');

const typingSequence = ['P', 'Pa', 'Pass', 'Pass1', 'Pass1!', 'MyPass1!'];

typingSequence.forEach((input, index) => {
  const quick = quickStrengthCheck(input);
  const emoji = quick.score < 30 ? '🔴' : quick.score < 60 ? '🟡' : '🟢';

  console.log(`Input ${index + 1}: "${input}" ${emoji} ${quick.strength} - ${quick.feedback}`);
});
console.log('');

// Feature 6: Minimum Requirements Checking
console.log('✅ Feature 6: Requirement Validation');
console.log('─'.repeat(60));
console.log('Check if passwords meet security requirements:\n');

const testCases = [
  'short',
  'nouppercase123',
  'NOLOWERCASE123',
  'NoNumbers!',
  'ValidPass123!'
];

testCases.forEach(pwd => {
  const check = meetsMinimumRequirements(pwd);
  const status = check.meets ? '✅' : '❌';

  console.log(`${status} "${pwd}"`);
  if (!check.meets && check.missingRequirements) {
    check.missingRequirements.forEach(req => {
      console.log(`     • ${req}`);
    });
  }
  console.log('');
});

// Feature 7: TOTP Code Formatting
console.log('🔢 Feature 7: TOTP Code Formatting');
console.log('─'.repeat(60));
console.log('Format 2FA codes for better readability:\n');

const totpCodes = ['123456', '789012', '345678'];
totpCodes.forEach(code => {
  console.log(`Raw: ${code} → Formatted: ${formatTOTPCode(code)}`);
});
console.log('');

// Feature 8: Security Recommendations
console.log('💡 Feature 8: Security Recommendations');
console.log('─'.repeat(60));

const weakPassword = 'qwerty123';
const analysis = analyzePasswordStrength(weakPassword);

console.log(`Analyzing weak password: "${weakPassword}"\n`);
console.log(`Score: ${analysis.score}/100`);
console.log(`Strength: ${analysis.strength}`);
console.log('');

if (analysis.warning) {
  console.log(`⚠️  ${analysis.warning}\n`);
}

if (analysis.suggestions && analysis.suggestions.length > 0) {
  console.log('Suggestions:');
  analysis.suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`);
  });
} else {
  console.log('Suggestions: None - password meets standards');
}
console.log('');

if (analysis.weaknesses && analysis.weaknesses.length > 0) {
  console.log('Detected weaknesses:');
  analysis.weaknesses.forEach((weakness, index) => {
    console.log(`  ${index + 1}. ${weakness}`);
  });
} else {
  console.log('Detected weaknesses: None');
}
console.log('');

// Final Summary
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                     Best Practices                         ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('✓ Use passwords with at least 16 characters');
console.log('✓ Include uppercase, lowercase, numbers, and symbols');
console.log('✓ Consider passphrases for high-security accounts');
console.log('✓ Never reuse passwords across different services');
console.log('✓ Use this library to generate cryptographically secure passwords');
console.log('✓ Enable 2FA whenever possible');
console.log('');
