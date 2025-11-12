# TrustVault Password Utils

## Project Overview

**@trustvault/password-utils** is a cryptographically secure password and passphrase generation library with comprehensive strength analysis capabilities. Built with TypeScript and leveraging the Web Crypto API, this package provides production-ready utilities for password management in web applications.

**Package Information:**
- **Name:** @trustvault/password-utils
- **Version:** 1.0.0
- **License:** Apache-2.0
- **Node:** >=20.0.0
- **Bundle Formats:** CommonJS + ESM

---

## Core Objectives

1. **Security First:** Provide cryptographically secure password generation using Web Crypto API with no predictable patterns
2. **Comprehensive Analysis:** Offer detailed password strength evaluation with actionable feedback
3. **Developer Experience:** TypeScript-first with full type definitions and intuitive APIs
4. **Performance:** Lightweight bundle with tree-shakeable exports and optimized algorithms
5. **Standards Compliance:** Follow OWASP guidelines and industry best practices
6. **Flexibility:** Configurable options for diverse security requirements

---

## Feature Set

### 1. Password Generation

**Primary Function:** `generatePassword(options?: PasswordGeneratorOptions): GeneratedPassword`

**Capabilities:**
- Cryptographically secure random generation using `crypto.getRandomValues()`
- Configurable length (8-128 characters)
- Character set customization:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Symbols (!@#$%^&*...)
- Ambiguous character exclusion (0, O, l, 1, I)
- Custom charset support
- Automatic entropy calculation
- Character diversity enforcement
- Rejection sampling to eliminate modulo bias

**Additional Functions:**
- `generatePasswords(count: number, options?: PasswordGeneratorOptions)` - Batch generation (1-100 passwords)
- `generatePronounceablePassword(length?: number)` - Alternating consonant-vowel patterns for memorability
- `getDefaultOptions()` - Returns secure default configuration

**Output Structure:**
```typescript
{
  password: string;        // Generated password
  entropy: number;         // Bits of entropy
  strength: string;        // weak | medium | strong | very-strong
}
```

**Security Features:**
- **Entropy-based strength classification:**
  - Weak: < 40 bits
  - Medium: 40-59 bits
  - Strong: 60-79 bits
  - Very Strong: ≥ 80 bits
- **Formula:** entropy = log₂(charset_size^length)

**Implementation:** `src/generators/password.ts`

---

### 2. Passphrase Generation

**Primary Function:** `generatePassphrase(options?: PassphraseOptions): GeneratedPassword`

**Capabilities:**
- Diceware-based word selection from EFF wordlist subset (384 words)
- Configurable word count (4-8 words)
- Multiple separator options:
  - Dash (correct-horse-battery-staple)
  - Space (correct horse battery staple)
  - Symbol (correct@horse#battery$staple)
  - None (correcthorsebatterystaple)
- Capitalization strategies:
  - None (all lowercase)
  - First (capitalize first letter of each word)
  - All (ALL CAPS)
  - Random (random capitalization per word)
- Optional number insertion at random positions
- Cryptographically secure word selection

**Additional Functions:**
- `generateMemorablePassphrase(length?: number)` - Pre-configured for memorability
- `getDefaultPassphraseOptions()` - Returns secure defaults

**Example Outputs:**
- `Correct-Horse-Battery-Staple-Monkey42`
- `jungle@wisdom#rocket$planet`
- `CRYSTAL MOUNTAIN SILVER THUNDER`

**Implementation:** `src/generators/passphrase.ts`

---

### 3. Password Strength Analysis

**Primary Function:** `analyzePasswordStrength(password: string): PasswordStrengthResult`

**Capabilities:**
- Powered by zxcvbn library for sophisticated pattern recognition
- Detects common patterns:
  - Dictionary words
  - Keyboard patterns (qwerty, asdf)
  - Repeated sequences (aaa, 123)
  - Date patterns (years)
- Character diversity checking
- Actual entropy calculation
- Crack time estimation with human-readable output
- Detailed feedback and actionable suggestions
- Weakness identification and categorization

**Output Structure:**
```typescript
{
  score: number;              // 0-100
  strength: string;           // weak | medium | strong | very-strong
  entropy: number;            // Bits of entropy
  crackTime: string;          // Human-readable (e.g., "centuries")
  warning: string | null;     // Primary warning message
  suggestions: string[];      // Array of improvement suggestions
  weaknesses: string[];       // List of detected issues
}
```

**Analysis Features:**
- Score calculation based on multiple factors
- Pattern recognition beyond simple length checks
- Context-aware suggestions
- Industry-standard crack time estimation

**Implementation:** `src/analyzer/strength.ts`

---

### 4. Quick Strength Check

**Primary Function:** `quickStrengthCheck(password: string): QuickStrengthResult`

**Capabilities:**
- Lightweight real-time validation (no zxcvbn overhead)
- Instant feedback suitable for input handlers
- Length-based scoring
- Character diversity checking
- Common pattern detection
- Basic weakness identification

**Additional Function:** `meetsMinimumRequirements(password: string): MinimumRequirementsResult`

**Use Cases:**
- Real-time password input validation
- Form validation
- Immediate user feedback during password creation
- Performance-critical validation scenarios

**Output Structure:**
```typescript
{
  score: number;              // 0-100
  strength: string;           // weak | medium | strong | very-strong
  feedback: string;           // User-friendly message
  weaknesses: string[];       // Detected issues
}
```

**Requirements Checking:**
```typescript
{
  meets: boolean;             // Overall pass/fail
  missingRequirements: string[]; // List of unmet requirements
}
```

**Implementation:** `src/analyzer/quick-check.ts`

---

### 5. Utility Functions

**Function:** `formatTOTPCode(code: string): string`

**Purpose:** Format 6-digit TOTP codes for improved readability

**Example:**
```typescript
formatTOTPCode("123456") // Returns: "123 456"
```

**Implementation:** `src/utils.ts`

---

## API Surface

### Exports (Main Entry Point: `src/index.ts`)

**Password Generation:**
- `generatePassword`
- `generatePasswords`
- `generatePronounceablePassword`
- `getDefaultOptions`

**Passphrase Generation:**
- `generatePassphrase`
- `generateMemorablePassphrase`
- `getDefaultPassphraseOptions`

**Strength Analysis:**
- `analyzePasswordStrength`
- `quickStrengthCheck`
- `meetsMinimumRequirements`

**Utilities:**
- `formatTOTPCode`

**TypeScript Types:**
- `PasswordGeneratorOptions`
- `GeneratedPassword`
- `PassphraseOptions`
- `PasswordStrengthResult`
- `QuickStrengthResult`
- `MinimumRequirementsResult`

---

## Technical Architecture

### Security Model

**Cryptographic Randomness:**
- Uses `crypto.getRandomValues()` from Web Crypto API
- Implements rejection sampling to avoid modulo bias
- No predictable patterns or pseudo-random number generators

**Entropy Calculation:**
- Mathematical formula: log₂(charset_size^length)
- Real-time calculation for every generated password
- Transparent strength classification

**Pattern Detection:**
- Integration with zxcvbn for advanced analysis
- Common password database checking
- Keyboard pattern recognition
- Date and sequence detection

### Dependencies

**Runtime:**
- `@noble/hashes@1.5.0` - Cryptographic hashing primitives
- `zxcvbn@4.4.2` - Password strength estimation

**Build Tools:**
- TypeScript for type safety
- tsup for dual-format bundling
- Vitest for testing

### Bundle Characteristics

**Size Optimization:**
- Subset wordlist (384 words) instead of full 7776-word diceware list
- Tree-shakeable exports for minimal bundle impact
- No unnecessary dependencies

**Module Formats:**
- CommonJS for Node.js compatibility
- ESM for modern bundlers
- Full TypeScript declarations

---

## Use Cases

### Primary Use Cases

1. **Web Applications**
   - User registration password generation
   - Password reset functionality
   - Account security settings

2. **Password Managers**
   - Built-in password generator
   - Strength analysis dashboard
   - Batch password creation

3. **Authentication Systems**
   - New user onboarding
   - Password policy enforcement
   - Security compliance validation

4. **Security Tools**
   - Password auditing
   - Security assessment tools
   - Penetration testing utilities

5. **Form Validation**
   - Real-time password strength indicators
   - Minimum requirements checking
   - User feedback during input

### Integration Examples

**Basic Password Generation:**
```typescript
import { generatePassword } from '@trustvault/password-utils';

const result = generatePassword({
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true
});

console.log(result.password);  // "Kp9$mNz2@Qw5Xr8T"
console.log(result.strength);  // "very-strong"
console.log(result.entropy);   // 95.2 bits
```

**Passphrase Generation:**
```typescript
import { generatePassphrase } from '@trustvault/password-utils';

const result = generatePassphrase({
  wordCount: 5,
  separator: 'dash',
  capitalization: 'first',
  includeNumber: true
});

console.log(result.password);  // "Forest-Mountain-River-Sky-Ocean47"
```

**Strength Analysis:**
```typescript
import { analyzePasswordStrength } from '@trustvault/password-utils';

const analysis = analyzePasswordStrength("password123");

console.log(analysis.score);        // 12
console.log(analysis.strength);     // "weak"
console.log(analysis.crackTime);    // "instant"
console.log(analysis.suggestions);  // ["Add more unique characters", ...]
console.log(analysis.weaknesses);   // ["Common password", "Predictable sequence"]
```

**Real-time Validation:**
```typescript
import { quickStrengthCheck } from '@trustvault/password-utils';

const check = quickStrengthCheck(userInput);

console.log(check.feedback);  // "Password is too short"
console.log(check.score);     // 25
console.log(check.strength);  // "weak"
```

---

## Quality Assurance

### Testing Strategy

**Test Coverage:**
- Security validation tests
- Integration tests
- Cryptographic function tests
- OWASP compliance validation
- Edge case handling
- Type safety verification

**Test Locations:**
- Unit tests alongside source files
- Integration tests in test directory
- Security-specific test suites

### Standards Compliance

**OWASP Guidelines:**
- Minimum entropy requirements
- Pattern detection
- Feedback mechanisms
- Secure random generation

**Industry Best Practices:**
- Web Crypto API usage
- Rejection sampling
- Entropy-based classification
- Human-readable feedback

---

## Related Projects

### TrustVault PWA

This package is extracted from the larger **TrustVault PWA** application, which includes:

- Offline-first credential manager
- Clean Architecture (presentation/domain/data/core layers)
- IndexedDB storage via Dexie
- AES-256-GCM encryption
- PBKDF2 key derivation (600,000 iterations)
- Scrypt password hashing
- TOTP support
- WebAuthn integration
- Auto-lock functionality
- Breach checking via Have I Been Pwned API
- Progressive Web App capabilities

The password utilities package extracts the core generation and analysis features for standalone use in other projects.

---

## Development

### Build Commands

```bash
npm run build          # Build both CJS and ESM formats
npm run test          # Run test suite
npm run type-check    # TypeScript validation
npm run lint          # Code quality checks
```

### File Structure

```
src/
├── generators/
│   ├── password.ts      # Password generation logic
│   └── passphrase.ts    # Passphrase generation logic
├── analyzer/
│   ├── strength.ts      # Comprehensive strength analysis
│   └── quick-check.ts   # Lightweight validation
├── utils.ts             # Utility functions
└── index.ts             # Main entry point with exports
```

### Key Technologies

- **TypeScript** - Type safety and developer experience
- **Web Crypto API** - Cryptographically secure randomness
- **zxcvbn** - Advanced password strength estimation
- **tsup** - Fast, zero-config bundler
- **Vitest** - Fast unit testing

---

## Future Enhancements

### Potential Features

1. **Password History Checking** - Prevent password reuse
2. **Custom Dictionary Support** - User-provided wordlists
3. **Breach Database Integration** - Check against known breaches
4. **Password Expiry Calculation** - Age-based recommendations
5. **Multi-language Support** - International character sets
6. **Password Policies** - Customizable rule enforcement
7. **Machine Learning** - Pattern detection improvements
8. **Accessibility Features** - Screen reader support for feedback

---

## Summary

**TrustVault Password Utils** provides a comprehensive, security-first solution for password and passphrase generation with detailed strength analysis. Built on cryptographically secure foundations and following industry best practices, this package enables developers to implement robust password management features without compromising on security or user experience.

**Key Strengths:**
- ✅ Cryptographically secure random generation
- ✅ Comprehensive strength analysis with actionable feedback
- ✅ Lightweight and performant
- ✅ Full TypeScript support
- ✅ Tree-shakeable exports
- ✅ OWASP compliant
- ✅ Production-ready with extensive testing
- ✅ Zero-compromise security model
