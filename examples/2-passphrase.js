/**
 * Example 2: Passphrase Generation
 *
 * Demonstrates how to generate memorable passphrases using
 * the Diceware method with various customization options.
 */

const { generatePassphrase, generateMemorablePassphrase, getDefaultPassphraseOptions } = require('password-kit');

console.log('=== Passphrase Generation ===\n');

// Example 2.1: Default passphrase
console.log('1. Default passphrase (5 words, dash separator):');
const defaultPassphrase = generatePassphrase(getDefaultPassphraseOptions());
console.log(`   Passphrase: ${defaultPassphrase.password}`);
console.log(`   Strength: ${defaultPassphrase.strength}`);
console.log(`   Entropy: ${defaultPassphrase.entropy.toFixed(2)} bits\n`);

// Example 2.2: Space-separated for easier typing
console.log('2. Space-separated (easier to type):');
const spacePassphrase = generatePassphrase({
  wordCount: 5,
  separator: 'space',
  capitalization: 'none'
});
console.log(`   Passphrase: ${spacePassphrase.password}`);
console.log(`   Strength: ${spacePassphrase.strength}\n`);

// Example 2.3: Capitalized first letter of each word
console.log('3. First letter capitalized:');
const capitalizedPassphrase = generatePassphrase({
  wordCount: 5,
  separator: 'dash',
  capitalization: 'first'
});
console.log(`   Passphrase: ${capitalizedPassphrase.password}`);
console.log(`   Strength: ${capitalizedPassphrase.strength}\n`);

// Example 2.4: With number for extra security
console.log('4. With random number:');
const passphraseWithNumber = generatePassphrase({
  wordCount: 5,
  separator: 'dash',
  capitalization: 'first',
  includeNumber: true
});
console.log(`   Passphrase: ${passphraseWithNumber.password}`);
console.log(`   Strength: ${passphraseWithNumber.strength}`);
console.log(`   Entropy: ${passphraseWithNumber.entropy.toFixed(2)} bits\n`);

// Example 2.5: Symbol-separated
console.log('5. Symbol-separated:');
const symbolPassphrase = generatePassphrase({
  wordCount: 4,
  separator: 'symbol',
  capitalization: 'random'
});
console.log(`   Passphrase: ${symbolPassphrase.password}`);
console.log(`   Strength: ${symbolPassphrase.strength}\n`);

// Example 2.6: No separator (one word)
console.log('6. No separator (concatenated):');
const noSeparatorPassphrase = generatePassphrase({
  wordCount: 4,
  separator: 'none',
  capitalization: 'first'
});
console.log(`   Passphrase: ${noSeparatorPassphrase.password}`);
console.log(`   Strength: ${noSeparatorPassphrase.strength}\n`);

// Example 2.7: All uppercase for maximum visibility
console.log('7. All uppercase:');
const upperPassphrase = generatePassphrase({
  wordCount: 4,
  separator: 'dash',
  capitalization: 'all'
});
console.log(`   Passphrase: ${upperPassphrase.password}`);
console.log(`   Strength: ${upperPassphrase.strength}\n`);

// Example 2.8: Pre-configured memorable passphrase
console.log('8. Memorable passphrase (pre-configured):');
const memorable = generateMemorablePassphrase();
console.log(`   Passphrase: ${memorable.password}`);
console.log(`   Strength: ${memorable.strength}`);
console.log(`   Entropy: ${memorable.entropy.toFixed(2)} bits\n`);

// Example 2.9: Extra secure (8 words)
console.log('9. Extra secure (8 words):');
const extraSecure = generatePassphrase({
  wordCount: 8,
  separator: 'dash',
  capitalization: 'first',
  includeNumber: true
});
console.log(`   Passphrase: ${extraSecure.password}`);
console.log(`   Strength: ${extraSecure.strength}`);
console.log(`   Entropy: ${extraSecure.entropy.toFixed(2)} bits\n`);
