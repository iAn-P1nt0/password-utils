/**
 * Example 3: Password Strength Analysis
 *
 * Demonstrates comprehensive password strength analysis using zxcvbn,
 * including pattern detection and actionable feedback.
 */

const { analyzePasswordStrength } = require('@ian-p1nt0/password-utils');

console.log('=== Password Strength Analysis ===\n');

// Example passwords from weakest to strongest
const testPasswords = [
  { label: 'Very Weak', password: 'password' },
  { label: 'Weak', password: 'password123' },
  { label: 'Common Pattern', password: 'qwerty123' },
  { label: 'Personal Info', password: 'john1980' },
  { label: 'Date Pattern', password: 'July2024!' },
  { label: 'Medium', password: 'P@ssw0rd!' },
  { label: 'Good', password: 'Tr0ub4dor&3' },
  { label: 'Strong', password: 'correct-horse-battery-staple' },
  { label: 'Very Strong', password: 'Kp9$mNz2@Qw5Xr8T' }
];

testPasswords.forEach((test, index) => {
  console.log(`${index + 1}. ${test.label}: "${test.password}"`);
  console.log('   ' + '─'.repeat(50));

  const analysis = analyzePasswordStrength(test.password);

  console.log(`   Score: ${analysis.score}/100`);
  console.log(`   Strength: ${analysis.strength.toUpperCase()}`);
  console.log(`   Entropy: ${analysis.entropy.toFixed(2)} bits`);
  console.log(`   Crack Time: ${analysis.crackTime}`);

  if (analysis.warning) {
    console.log(`   ⚠️  Warning: ${analysis.warning}`);
  }

  if (analysis.weaknesses && analysis.weaknesses.length > 0) {
    console.log(`   🔍 Weaknesses detected:`);
    analysis.weaknesses.forEach(weakness => {
      console.log(`      • ${weakness}`);
    });
  }

  if (analysis.suggestions && analysis.suggestions.length > 0) {
    console.log(`   💡 Suggestions:`);
    analysis.suggestions.forEach(suggestion => {
      console.log(`      • ${suggestion}`);
    });
  }

  console.log('');
});

// Demonstrate analyzing a generated password
console.log('\n=== Analyzing a Generated Password ===\n');

const { generatePassword } = require('@ian-p1nt0/password-utils');

const generated = generatePassword({ length: 20 });
console.log(`Generated Password: ${generated.password}`);
console.log('');

const generatedAnalysis = analyzePasswordStrength(generated.password);
console.log(`Score: ${generatedAnalysis.score}/100`);
console.log(`Strength: ${generatedAnalysis.strength.toUpperCase()}`);
console.log(`Entropy: ${generatedAnalysis.entropy.toFixed(2)} bits`);
console.log(`Crack Time: ${generatedAnalysis.crackTime}`);
console.log('');

if (!generatedAnalysis.suggestions || generatedAnalysis.suggestions.length === 0) {
  console.log('✅ No improvements needed - this is an excellent password!\n');
}
