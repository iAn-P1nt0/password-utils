/**
 * Example 4: Quick Strength Validation
 *
 * Demonstrates lightweight, real-time password validation suitable
 * for form inputs and immediate user feedback.
 */

const {
  quickStrengthCheck,
  meetsMinimumRequirements
} = require('password-kit');

console.log('=== Quick Strength Validation ===\n');

// Simulate user typing a password progressively
const progressivePasswords = [
  'p',
  'pa',
  'pass',
  'passw',
  'passwor',
  'password',
  'Password',
  'Password1',
  'Password1!',
  'MyP@ssw0rd123'
];

console.log('Progressive Typing Simulation:');
console.log('(Shows real-time feedback as user types)\n');

progressivePasswords.forEach((password, index) => {
  const check = quickStrengthCheck(password);
  const requirements = meetsMinimumRequirements(password);

  const strength = check.strength.toUpperCase();
  const emoji = {
    'weak': '🔴',
    'medium': '🟡',
    'strong': '🟢',
    'very-strong': '💚'
  }[check.strength] || '⚪';

  console.log(`Step ${index + 1}: "${password}"`);
  console.log(`   ${emoji} Strength: ${strength} (${check.score}/100)`);
  console.log(`   Feedback: ${check.feedback}`);

  if (!requirements.meets) {
    console.log(`   ❌ Missing requirements:`);
    if (requirements.missingRequirements) {
      requirements.missingRequirements.forEach(req => {
        console.log(`      • ${req}`);
      });
    }
  } else {
    console.log(`   ✅ Meets minimum requirements`);
  }

  if (check.weaknesses && check.weaknesses.length > 0) {
    console.log(`   ⚠️  Weaknesses:`);
    check.weaknesses.forEach(weakness => {
      console.log(`      • ${weakness}`);
    });
  }

  console.log('');
});

// Form validation example
console.log('\n=== Form Validation Example ===\n');

function validatePasswordForForm(password) {
  const check = quickStrengthCheck(password);
  const requirements = meetsMinimumRequirements(password);

  console.log(`Password: "${password}"`);
  console.log(`Quick Check Score: ${check.score}/100`);
  console.log(`Strength: ${check.strength.toUpperCase()}`);
  console.log(`Meets Requirements: ${requirements.meets ? '✅ Yes' : '❌ No'}`);

  if (!requirements.meets) {
    console.log('\nValidation Failed:');
    requirements.missingRequirements.forEach(req => {
      console.log(`  • ${req}`);
    });
    return false;
  }

  if (check.score < 50) {
    console.log('\nValidation Warning:');
    console.log(`  Password is weak. ${check.feedback}`);
    return false;
  }

  console.log('\n✅ Password accepted!');
  return true;
}

console.log('Test 1:');
validatePasswordForForm('abc');
console.log('\n' + '─'.repeat(50) + '\n');

console.log('Test 2:');
validatePasswordForForm('password123');
console.log('\n' + '─'.repeat(50) + '\n');

console.log('Test 3:');
validatePasswordForForm('MySecure@Pass123');
console.log('');

// Performance comparison
console.log('\n=== Performance Comparison ===\n');

const { analyzePasswordStrength } = require('password-kit');

const testPassword = 'TestPassword123!';

console.log('Testing password:', testPassword);
console.log('');

// Quick check (fast, no zxcvbn)
console.time('Quick Check');
const quickResult = quickStrengthCheck(testPassword);
console.timeEnd('Quick Check');
console.log(`Result: ${quickResult.strength} (${quickResult.score}/100)`);
console.log('');

// Full analysis (slower, with zxcvbn)
console.time('Full Analysis');
const fullResult = analyzePasswordStrength(testPassword);
console.timeEnd('Full Analysis');
console.log(`Result: ${fullResult.strength} (${fullResult.score}/100)`);
console.log('');

console.log('Use quickStrengthCheck() for:');
console.log('  • Real-time input validation');
console.log('  • Form field feedback');
console.log('  • Performance-critical scenarios');
console.log('');

console.log('Use analyzePasswordStrength() for:');
console.log('  • Detailed password analysis');
console.log('  • After password creation');
console.log('  • Security audits');
console.log('');
