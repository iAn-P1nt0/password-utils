# AI Agent Instructions for TrustVault Password Utils

## Repository Context

This repository contains **@trustvault/password-utils**, a cryptographically secure password and passphrase generation library with comprehensive strength analysis. The codebase prioritizes security, type safety, and developer experience.

**Primary Language:** TypeScript
**Target Environment:** Browser (Web Crypto API)
**Package Type:** Dual-format library (CommonJS + ESM)
**Security Level:** Critical - handles password generation and authentication

---

## Core Principles

### 1. Security First - Non-Negotiable

**CRITICAL SECURITY REQUIREMENTS:**

- ✅ **ALWAYS** use `crypto.getRandomValues()` for random generation
- ✅ **ALWAYS** implement rejection sampling to avoid modulo bias
- ✅ **NEVER** use `Math.random()` or other non-cryptographic sources
- ✅ **NEVER** introduce timing attacks or side-channel vulnerabilities
- ✅ **NEVER** log, store, or transmit passwords insecurely
- ✅ **ALWAYS** validate entropy calculations match actual implementation
- ✅ **ALWAYS** maintain zero-knowledge architecture (no password storage)

**Security Review Checklist:**
```typescript
// ✅ CORRECT - Cryptographically secure
const array = new Uint32Array(1);
crypto.getRandomValues(array);
const value = array[0];

// ❌ WRONG - Predictable and insecure
const value = Math.random();
```

**Rejection Sampling Pattern:**
```typescript
// ✅ CORRECT - Eliminates modulo bias
function getRandomInt(max: number): number {
  const range = max;
  const limit = Math.floor(0xFFFFFFFF / range) * range;

  let value: number;
  do {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);

  return value % range;
}

// ❌ WRONG - Modulo bias vulnerability
function getRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max; // Biased distribution
}
```

### 2. Type Safety - Mandatory

**TypeScript Requirements:**

- ✅ **ALWAYS** define explicit types for all function parameters and return values
- ✅ **ALWAYS** use interfaces for complex objects
- ✅ **NEVER** use `any` type (use `unknown` if needed)
- ✅ **ALWAYS** enable strict mode compilation
- ✅ **ALWAYS** export types alongside functions

**Example:**
```typescript
// ✅ CORRECT - Full type safety
interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

interface GeneratedPassword {
  password: string;
  entropy: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export function generatePassword(options: PasswordOptions): GeneratedPassword {
  // Implementation
}

// ❌ WRONG - No type safety
export function generatePassword(options: any): any {
  // Implementation
}
```

### 3. Performance - Critical Path Optimization

**Performance Guidelines:**

- ✅ **OPTIMIZE** hot paths (password generation, quick checks)
- ✅ **LAZY LOAD** expensive dependencies (zxcvbn only when needed)
- ✅ **MEMOIZE** entropy calculations where appropriate
- ✅ **MINIMIZE** bundle size through tree-shaking
- ✅ **AVOID** unnecessary allocations in generation loops

**Bundle Size Awareness:**
```typescript
// ✅ CORRECT - Subset wordlist (384 words)
const WORDLIST = ['apple', 'banana', ...]; // Curated subset

// ❌ WRONG - Full wordlist (7776 words)
import { wordlist } from 'eff-diceware-full'; // 100KB+ overhead
```

### 4. Testing - Comprehensive Coverage

**Testing Requirements:**

- ✅ **ALWAYS** write tests for new features
- ✅ **ALWAYS** test security properties (randomness, bias, entropy)
- ✅ **ALWAYS** test edge cases (min/max lengths, empty inputs, special characters)
- ✅ **ALWAYS** validate OWASP compliance
- ✅ **NEVER** commit code without passing tests

**Test Categories:**
1. **Security Tests** - Cryptographic properties, bias detection
2. **Functional Tests** - Feature correctness
3. **Integration Tests** - End-to-end workflows
4. **Edge Case Tests** - Boundary conditions
5. **Type Tests** - TypeScript compilation

---

## Codebase Structure

### Directory Layout

```
src/
├── generators/
│   ├── password.ts          # Password generation (PRIMARY)
│   └── passphrase.ts        # Passphrase generation (PRIMARY)
├── analyzer/
│   ├── strength.ts          # Full strength analysis (zxcvbn)
│   └── quick-check.ts       # Lightweight validation
├── utils.ts                 # Utility functions (TOTP formatting)
└── index.ts                 # Public API exports
```

### Key Files and Their Responsibilities

#### `src/generators/password.ts`
**Purpose:** Cryptographically secure password generation
**Key Functions:**
- `generatePassword()` - Main generation function
- `generatePasswords()` - Batch generation
- `generatePronounceablePassword()` - Memorable passwords
- `getDefaultOptions()` - Secure defaults

**When to modify:**
- Adding new character sets
- Implementing new generation algorithms
- Enhancing entropy calculation
- Improving character diversity enforcement

**Critical constraints:**
- MUST use `crypto.getRandomValues()`
- MUST implement rejection sampling
- MUST calculate entropy accurately
- MUST enforce minimum strength requirements

#### `src/generators/passphrase.ts`
**Purpose:** Diceware-based passphrase generation
**Key Functions:**
- `generatePassphrase()` - Main passphrase function
- `generateMemorablePassphrase()` - Pre-configured memorable
- `getDefaultPassphraseOptions()` - Secure defaults

**When to modify:**
- Updating wordlist
- Adding capitalization strategies
- Implementing new separator options
- Enhancing memorability features

**Critical constraints:**
- MUST use cryptographically secure word selection
- MUST maintain wordlist integrity
- MUST calculate passphrase entropy correctly
- Wordlist MUST remain subset (384 words max) for bundle size

#### `src/analyzer/strength.ts`
**Purpose:** Comprehensive password strength analysis
**Key Functions:**
- `analyzePasswordStrength()` - Full analysis with zxcvbn

**When to modify:**
- Enhancing feedback messages
- Adding new pattern detection
- Improving crack time estimation
- Customizing scoring algorithms

**Critical constraints:**
- MUST use zxcvbn for pattern detection
- MUST provide actionable feedback
- MUST detect common weaknesses
- MUST calculate accurate entropy

#### `src/analyzer/quick-check.ts`
**Purpose:** Lightweight real-time validation
**Key Functions:**
- `quickStrengthCheck()` - Fast validation
- `meetsMinimumRequirements()` - Requirements checking

**When to modify:**
- Adding real-time validation rules
- Implementing new requirements
- Enhancing immediate feedback

**Critical constraints:**
- MUST be fast (no heavy dependencies)
- MUST NOT use zxcvbn (performance)
- MUST provide instant feedback
- MUST align with full analysis when possible

#### `src/index.ts`
**Purpose:** Public API surface and exports
**Exports:**
- All generator functions
- All analyzer functions
- All TypeScript types
- Utility functions

**When to modify:**
- Adding new public APIs
- Deprecating old functions
- Reorganizing exports

**Critical constraints:**
- MUST maintain backward compatibility
- MUST export TypeScript types
- MUST follow semantic versioning
- MUST document breaking changes

---

## Feature Development Roadmap

### Current Version: 1.0.0

**Implemented Features:**
- ✅ Password generation with configurable options
- ✅ Passphrase generation (Diceware)
- ✅ Comprehensive strength analysis
- ✅ Quick strength checking
- ✅ Entropy calculation
- ✅ Pattern detection
- ✅ TOTP formatting

### Roadmap Priorities

#### Phase 1: Enhanced Security (v1.1.0)

**1.1 Password History Checking**
- **Goal:** Prevent password reuse
- **Implementation:**
  - Add `checkPasswordHistory(password: string, history: string[]): boolean`
  - Use constant-time comparison to prevent timing attacks
  - Hash passwords before comparison (use @noble/hashes)
- **Files to modify:** Create `src/analyzer/history.ts`
- **Tests required:** Timing attack resistance, hash collision handling
- **Breaking changes:** None (new feature)

**1.2 Breach Database Integration**
- **Goal:** Check passwords against known breaches (HIBP)
- **Implementation:**
  - Add `checkPasswordBreach(password: string): Promise<BreachResult>`
  - Use k-anonymity model (SHA-1 prefix matching)
  - Implement rate limiting and caching
- **Files to modify:** Create `src/analyzer/breach.ts`
- **Dependencies to add:** Node fetch polyfill for browser
- **Tests required:** API mocking, k-anonymity validation, rate limiting
- **Breaking changes:** None (optional feature)

**1.3 Secure Password Storage Utilities**
- **Goal:** Provide utilities for secure password hashing
- **Implementation:**
  - Add `hashPassword(password: string): Promise<string>`
  - Add `verifyPassword(password: string, hash: string): Promise<boolean>`
  - Use Argon2id or scrypt from @noble/hashes
- **Files to modify:** Create `src/utils/hashing.ts`
- **Tests required:** Hash verification, timing attack resistance
- **Breaking changes:** None (new feature)

#### Phase 2: Enhanced Usability (v1.2.0)

**2.1 Custom Dictionary Support**
- **Goal:** Allow user-provided wordlists
- **Implementation:**
  - Add `generatePassphraseWithDictionary(words: string[], options: PassphraseOptions)`
  - Validate wordlist entropy and diversity
  - Warn on weak dictionaries
- **Files to modify:** `src/generators/passphrase.ts`
- **Tests required:** Custom wordlist validation, entropy calculation
- **Breaking changes:** None (new function)

**2.2 Password Policy Engine**
- **Goal:** Customizable password requirements
- **Implementation:**
  - Add `PolicyValidator` class
  - Support custom rules (min length, required chars, forbidden patterns)
  - Provide policy-based feedback
- **Files to modify:** Create `src/analyzer/policy.ts`
- **Tests required:** Complex policy combinations, edge cases
- **Breaking changes:** None (new feature)

**2.3 Multi-language Character Sets**
- **Goal:** Support international characters
- **Implementation:**
  - Add Unicode character ranges
  - Support CJK, Cyrillic, Arabic character sets
  - Update entropy calculation for extended charsets
- **Files to modify:** `src/generators/password.ts`, `src/analyzer/strength.ts`
- **Tests required:** Unicode normalization, entropy validation
- **Breaking changes:** Minor (new options)

#### Phase 3: Advanced Features (v1.3.0)

**3.1 Password Expiry Calculation**
- **Goal:** Age-based recommendations
- **Implementation:**
  - Add `calculateExpiry(password: string, createdAt: Date): ExpiryResult`
  - Consider password strength in expiry calculation
  - Provide renewal recommendations
- **Files to modify:** Create `src/analyzer/expiry.ts`
- **Tests required:** Time calculations, edge cases
- **Breaking changes:** None (new feature)

**3.2 Machine Learning Pattern Detection**
- **Goal:** Enhanced pattern recognition
- **Implementation:**
  - Train lightweight ML model for pattern detection
  - Detect personal information patterns
  - Identify context-based weaknesses
- **Files to modify:** `src/analyzer/strength.ts`, create `src/analyzer/ml-patterns.ts`
- **Dependencies to add:** TensorFlow.js Lite or ONNX Runtime
- **Tests required:** Model accuracy, performance benchmarks
- **Breaking changes:** None (enhancement to existing)

**3.3 Accessibility Enhancements**
- **Goal:** Screen reader and assistive technology support
- **Implementation:**
  - Add ARIA-compatible feedback formatting
  - Provide audio-friendly strength descriptions
  - Implement keyboard-navigable suggestions
- **Files to modify:** All analyzer files
- **Tests required:** Screen reader testing, ARIA validation
- **Breaking changes:** None (enhancement to existing)

#### Phase 4: Developer Experience (v1.4.0)

**4.1 React/Vue/Angular Hooks**
- **Goal:** Framework-specific utilities
- **Implementation:**
  - Create `@trustvault/password-utils-react` package
  - Provide `usePasswordGenerator()` hook
  - Provide `usePasswordStrength()` hook
- **Files to modify:** New package structure
- **Tests required:** Hook testing, framework integration
- **Breaking changes:** None (separate package)

**4.2 Web Component**
- **Goal:** Framework-agnostic UI component
- **Implementation:**
  - Create `<password-generator>` web component
  - Provide customizable styling
  - Include built-in strength indicator
- **Files to modify:** Create `src/components/` directory
- **Tests required:** Web component API, cross-browser
- **Breaking changes:** None (new feature)

**4.3 CLI Tool**
- **Goal:** Command-line password generation
- **Implementation:**
  - Create `@trustvault/password-cli` package
  - Support all library features via CLI
  - Add clipboard integration
- **Files to modify:** New package structure
- **Tests required:** CLI integration tests
- **Breaking changes:** None (separate package)

---

## Agent Guidelines by Task Type

### When Adding a New Feature

**Step-by-step process:**

1. **Research Phase**
   - Review existing codebase structure
   - Check roadmap alignment (this document)
   - Identify affected files
   - Review security implications

2. **Design Phase**
   - Design TypeScript interfaces
   - Plan security measures
   - Estimate bundle size impact
   - Write API documentation

3. **Implementation Phase**
   - Write implementation with security in mind
   - Add comprehensive TypeScript types
   - Include inline documentation
   - Follow existing code style

4. **Testing Phase**
   - Write unit tests
   - Write integration tests
   - Write security tests
   - Validate edge cases

5. **Documentation Phase**
   - Update README.md
   - Update CLAUDE.md
   - Update this AGENTS.md
   - Add JSDoc comments

6. **Review Phase**
   - Run full test suite
   - Check TypeScript compilation
   - Validate bundle size
   - Verify backward compatibility

### When Fixing a Bug

**Priority levels:**
- 🔴 **CRITICAL** - Security vulnerability or data loss
- 🟡 **HIGH** - Feature broken or incorrect behavior
- 🟢 **MEDIUM** - Minor issue or cosmetic problem
- 🔵 **LOW** - Enhancement or optimization

**Bug fix process:**

1. **Reproduce** - Write failing test first
2. **Diagnose** - Identify root cause
3. **Fix** - Implement minimal fix
4. **Test** - Verify fix and add regression tests
5. **Document** - Update comments and changelog

**Security bug process:**
- DO NOT publicly disclose until patched
- Create private security advisory
- Patch immediately
- Increment patch version
- Release emergency update
- Disclose responsibly after fix deployed

### When Refactoring

**Allowed refactoring:**
- ✅ Code organization improvements
- ✅ Performance optimizations (with benchmarks)
- ✅ Type safety enhancements
- ✅ Test coverage improvements
- ✅ Documentation updates

**Prohibited changes:**
- ❌ Breaking API changes without major version bump
- ❌ Removing features without deprecation cycle
- ❌ Changing security-critical code without thorough review
- ❌ Adding dependencies without justification

**Refactoring checklist:**
- [ ] All tests pass
- [ ] No breaking changes (or version bumped)
- [ ] Performance maintained or improved
- [ ] Bundle size not increased
- [ ] Documentation updated
- [ ] Backward compatibility verified

### When Writing Tests

**Test structure:**
```typescript
// ✅ CORRECT - Descriptive, comprehensive
describe('generatePassword', () => {
  describe('security properties', () => {
    it('should use cryptographically secure randomness', () => {
      // Test cryptographic quality
    });

    it('should have no modulo bias', () => {
      // Test distribution uniformity
    });
  });

  describe('functional behavior', () => {
    it('should generate password with specified length', () => {
      // Test length
    });

    it('should include requested character sets', () => {
      // Test charset inclusion
    });
  });

  describe('edge cases', () => {
    it('should handle minimum length', () => {
      // Test boundary
    });

    it('should handle maximum length', () => {
      // Test boundary
    });
  });
});
```

**Required test coverage:**
- Security properties (randomness, bias, entropy)
- Functional correctness
- Edge cases and boundaries
- Error handling
- Type safety
- Integration scenarios

### When Updating Dependencies

**Dependency update process:**

1. **Check for breaking changes** - Review changelog
2. **Update package.json** - Increment version
3. **Run tests** - Ensure compatibility
4. **Check bundle size** - Verify no bloat
5. **Security audit** - Run `npm audit`
6. **Update lockfile** - Commit package-lock.json

**Dependency criteria:**
- ✅ Well-maintained (recent commits)
- ✅ Security track record
- ✅ Small bundle size
- ✅ TypeScript support
- ✅ Permissive license (Apache-2.0 compatible)

**Red flags:**
- ❌ No recent updates (>1 year)
- ❌ Known vulnerabilities
- ❌ Large bundle size (>100KB)
- ❌ No TypeScript types
- ❌ GPL/AGPL license

---

## Code Style and Conventions

### TypeScript Style

```typescript
// ✅ CORRECT - Clear, typed, documented
/**
 * Generates a cryptographically secure password.
 *
 * @param options - Configuration options for password generation
 * @returns Generated password with entropy and strength analysis
 * @throws {Error} If options are invalid
 *
 * @example
 * ```typescript
 * const result = generatePassword({ length: 16, includeSymbols: true });
 * console.log(result.password); // "Kp9$mNz2@Qw5Xr8T"
 * ```
 */
export function generatePassword(
  options: PasswordGeneratorOptions
): GeneratedPassword {
  validateOptions(options);

  const charset = buildCharset(options);
  const password = generateSecureString(charset, options.length);
  const entropy = calculateEntropy(charset.length, options.length);
  const strength = classifyStrength(entropy);

  return { password, entropy, strength };
}

// ❌ WRONG - No types, no docs, unclear
export function gen(opts: any): any {
  let c = '';
  if (opts.up) c += 'ABC...';
  // ...
  return Math.random().toString(); // SECURITY ISSUE!
}
```

### Naming Conventions

- **Functions:** `camelCase` (e.g., `generatePassword`)
- **Classes:** `PascalCase` (e.g., `PasswordGenerator`)
- **Interfaces:** `PascalCase` (e.g., `PasswordOptions`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_PASSWORD_LENGTH`)
- **Private:** Prefix with `_` (e.g., `_internalHelper`)

### File Organization

```typescript
// 1. Imports
import { crypto } from 'node:crypto';
import type { PasswordOptions } from './types';

// 2. Constants
const MAX_LENGTH = 128;
const MIN_LENGTH = 8;

// 3. Types
interface InternalState {
  // ...
}

// 4. Helper functions (private)
function _validateLength(length: number): void {
  // ...
}

// 5. Exported functions
export function generatePassword(options: PasswordOptions): string {
  // ...
}

// 6. Exports
export type { PasswordOptions };
```

### Documentation Standards

**JSDoc requirements:**
- ✅ All exported functions MUST have JSDoc
- ✅ Include `@param` for all parameters
- ✅ Include `@returns` for return value
- ✅ Include `@throws` for exceptions
- ✅ Include `@example` with usage example
- ✅ Include `@see` for related functions

**Example:**
```typescript
/**
 * Analyzes password strength using multiple factors.
 *
 * This function performs comprehensive analysis including:
 * - Pattern detection (keyboard patterns, repeated chars)
 * - Dictionary word detection
 * - Entropy calculation
 * - Crack time estimation
 *
 * @param password - The password to analyze
 * @returns Detailed strength analysis with score, feedback, and suggestions
 *
 * @throws {Error} If password is empty or undefined
 *
 * @example
 * ```typescript
 * const result = analyzePasswordStrength("Tr0ub4dor&3");
 * console.log(result.score); // 75
 * console.log(result.strength); // "strong"
 * console.log(result.suggestions); // ["Add more unique characters"]
 * ```
 *
 * @see quickStrengthCheck For lightweight validation
 * @see meetsMinimumRequirements For requirements checking
 */
export function analyzePasswordStrength(
  password: string
): PasswordStrengthResult {
  // Implementation
}
```

---

## Security Best Practices

### Cryptographic Requirements

**Random Number Generation:**
```typescript
// ✅ CORRECT - Web Crypto API
function getSecureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

// ❌ WRONG - Math.random() is NOT cryptographically secure
function getInsecureRandom(): number {
  return Math.random() * 0xFFFFFFFF;
}
```

**Avoiding Modulo Bias:**
```typescript
// ✅ CORRECT - Rejection sampling eliminates bias
function getRandomIndex(arrayLength: number): number {
  const range = arrayLength;
  const limit = Math.floor(0xFFFFFFFF / range) * range;

  let value: number;
  do {
    value = getSecureRandom();
  } while (value >= limit);

  return value % range;
}

// ❌ WRONG - Modulo bias creates non-uniform distribution
function getBiasedIndex(arrayLength: number): number {
  return getSecureRandom() % arrayLength;
}
```

### Timing Attack Prevention

```typescript
// ✅ CORRECT - Constant-time comparison
function comparePasswords(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ❌ WRONG - Timing attack vulnerable (early exit)
function vulnerableCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false; // Early exit leaks info
  }

  return true;
}
```

### Input Validation

```typescript
// ✅ CORRECT - Comprehensive validation
function validatePasswordOptions(options: PasswordGeneratorOptions): void {
  if (!options) {
    throw new Error('Options cannot be null or undefined');
  }

  if (typeof options.length !== 'number') {
    throw new Error('Length must be a number');
  }

  if (options.length < MIN_LENGTH || options.length > MAX_LENGTH) {
    throw new Error(`Length must be between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }

  if (!Number.isInteger(options.length)) {
    throw new Error('Length must be an integer');
  }

  // Validate at least one character set is enabled
  const hasCharset =
    options.includeUppercase ||
    options.includeLowercase ||
    options.includeNumbers ||
    options.includeSymbols;

  if (!hasCharset) {
    throw new Error('At least one character set must be enabled');
  }
}
```

---

## Performance Guidelines

### Bundle Size Optimization

**Current bundle sizes (targets):**
- Core library: <30KB gzipped
- With zxcvbn: <400KB gzipped
- Types: <5KB

**Optimization strategies:**
```typescript
// ✅ CORRECT - Tree-shakeable exports
export { generatePassword } from './generators/password';
export { generatePassphrase } from './generators/passphrase';
export { analyzePasswordStrength } from './analyzer/strength';

// ❌ WRONG - Barrel exports prevent tree-shaking
export * from './generators';
export * from './analyzer';
```

**Lazy loading expensive dependencies:**
```typescript
// ✅ CORRECT - Load zxcvbn only when needed
export async function analyzePasswordStrength(
  password: string
): Promise<PasswordStrengthResult> {
  const zxcvbn = await import('zxcvbn');
  const result = zxcvbn.default(password);
  // Process result
}

// ❌ WRONG - Always loads zxcvbn even if not used
import zxcvbn from 'zxcvbn';

export function analyzePasswordStrength(
  password: string
): PasswordStrengthResult {
  const result = zxcvbn(password);
  // Process result
}
```

### Algorithmic Optimization

**Hot path optimization:**
```typescript
// ✅ CORRECT - Pre-allocate and reuse
function generatePassword(options: PasswordGeneratorOptions): string {
  const charset = buildCharset(options); // Build once
  const result = new Array(options.length); // Pre-allocate

  for (let i = 0; i < options.length; i++) {
    const index = getRandomIndex(charset.length);
    result[i] = charset[index];
  }

  return result.join('');
}

// ❌ WRONG - Repeated allocations and concatenation
function generatePasswordSlow(options: PasswordGeneratorOptions): string {
  let password = '';

  for (let i = 0; i < options.length; i++) {
    const charset = buildCharset(options); // Rebuild every iteration!
    const index = getRandomIndex(charset.length);
    password += charset[index]; // String concatenation is slow
  }

  return password;
}
```

---

## Testing Strategy

### Test Categories

**1. Security Tests**
```typescript
describe('Security Properties', () => {
  it('should use cryptographically secure randomness', () => {
    // Statistical tests for randomness quality
    const samples = Array.from({ length: 10000 }, () =>
      generatePassword({ length: 16 })
    );

    // Check for duplicates (should be extremely rare)
    const unique = new Set(samples);
    expect(unique.size).toBeGreaterThan(9990);
  });

  it('should have no modulo bias', () => {
    // Chi-square test for uniform distribution
    const distribution = new Map<string, number>();
    const charset = 'abcdefghij'; // 10 characters

    for (let i = 0; i < 10000; i++) {
      const char = generateRandomChar(charset);
      distribution.set(char, (distribution.get(char) || 0) + 1);
    }

    // Each character should appear ~1000 times (±5%)
    for (const count of distribution.values()) {
      expect(count).toBeGreaterThan(950);
      expect(count).toBeLessThan(1050);
    }
  });
});
```

**2. Functional Tests**
```typescript
describe('Password Generation', () => {
  it('should generate password with correct length', () => {
    const result = generatePassword({ length: 20 });
    expect(result.password).toHaveLength(20);
  });

  it('should include requested character sets', () => {
    const result = generatePassword({
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false
    });

    expect(result.password).toMatch(/[A-Z]/);
    expect(result.password).toMatch(/[a-z]/);
    expect(result.password).toMatch(/[0-9]/);
    expect(result.password).not.toMatch(/[!@#$%^&*]/);
  });
});
```

**3. Integration Tests**
```typescript
describe('End-to-End Workflows', () => {
  it('should generate and analyze password strength', () => {
    const generated = generatePassword({ length: 16 });
    const analysis = analyzePasswordStrength(generated.password);

    expect(analysis.strength).toBe('very-strong');
    expect(analysis.entropy).toBeGreaterThan(80);
  });
});
```

### Code Coverage Requirements

**Minimum coverage:**
- Overall: 90%
- Security-critical code: 100%
- Edge cases: 100%

**Coverage command:**
```bash
npm run test:coverage
```

---

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Using Math.random()

**Problem:**
```typescript
// ❌ INSECURE
const randomChar = charset[Math.floor(Math.random() * charset.length)];
```

**Solution:**
```typescript
// ✅ SECURE
const randomChar = charset[getSecureRandomIndex(charset.length)];
```

### Pitfall 2: Modulo Bias

**Problem:**
```typescript
// ❌ BIASED
const value = crypto.getRandomValues(new Uint32Array(1))[0];
const index = value % charset.length;
```

**Solution:**
```typescript
// ✅ UNBIASED - Rejection sampling
function getSecureRandomIndex(max: number): number {
  const range = max;
  const limit = Math.floor(0xFFFFFFFF / range) * range;

  let value: number;
  do {
    value = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (value >= limit);

  return value % range;
}
```

### Pitfall 3: Incorrect Entropy Calculation

**Problem:**
```typescript
// ❌ WRONG - Doesn't account for charset size
const entropy = password.length * 8; // Assumes 256 possibilities per char
```

**Solution:**
```typescript
// ✅ CORRECT - Uses actual charset size
function calculateEntropy(charsetSize: number, length: number): number {
  return Math.log2(Math.pow(charsetSize, length));
}
```

### Pitfall 4: Type Safety Violations

**Problem:**
```typescript
// ❌ UNSAFE
export function generatePassword(options?: any): any {
  return { password: '...' };
}
```

**Solution:**
```typescript
// ✅ TYPE-SAFE
export function generatePassword(
  options: PasswordGeneratorOptions
): GeneratedPassword {
  return { password: '...', entropy: 95.2, strength: 'very-strong' };
}
```

### Pitfall 5: Bundle Size Bloat

**Problem:**
```typescript
// ❌ BLOAT - Imports entire library
import _ from 'lodash';
const shuffled = _.shuffle(array);
```

**Solution:**
```typescript
// ✅ MINIMAL - Use native or implement locally
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomIndex(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

---

## Version Control and Release Process

### Commit Message Format

**Use conventional commits:**

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `security` - Security fix (CRITICAL)
- `perf` - Performance improvement
- `refactor` - Code refactoring
- `test` - Test updates
- `docs` - Documentation updates
- `chore` - Build/tooling changes

**Examples:**
```
feat(generator): add custom charset support

Allows users to provide custom character sets for password generation.

Closes #42
```

```
security(crypto): fix modulo bias in random generation

Implements rejection sampling to eliminate modulo bias in random
index selection. This ensures truly uniform distribution.

BREAKING CHANGE: getRandomIndex() now requires max parameter
```

### Semantic Versioning

**Version format:** `MAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

**Examples:**
- `1.0.0 → 1.0.1` - Bug fix (no breaking changes)
- `1.0.1 → 1.1.0` - New feature (backward compatible)
- `1.1.0 → 2.0.0` - Breaking change

### Release Checklist

**Pre-release:**
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Bundle builds successfully (`npm run build`)
- [ ] Bundle size checked (not increased significantly)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Documentation updated

**Release:**
- [ ] Create git tag (`git tag v1.0.0`)
- [ ] Push tag (`git push origin v1.0.0`)
- [ ] Publish to npm (`npm publish`)
- [ ] Create GitHub release
- [ ] Announce on relevant channels

**Post-release:**
- [ ] Verify package on npm
- [ ] Test installation (`npm install @trustvault/password-utils`)
- [ ] Monitor for issues
- [ ] Update documentation site

---

## Emergency Response

### Security Vulnerability Response

**If you discover a security vulnerability:**

1. **DO NOT** create a public GitHub issue
2. **DO** create a private security advisory
3. **DO** notify maintainers immediately
4. **DO** prepare a patch immediately
5. **DO** test the patch thoroughly
6. **DO** release emergency update ASAP
7. **DO** disclose responsibly after fix is deployed

**Severity levels:**
- 🔴 **CRITICAL** - Remote code execution, cryptographic failure
- 🟠 **HIGH** - Authentication bypass, data leak
- 🟡 **MEDIUM** - Denial of service, minor info disclosure
- 🟢 **LOW** - Low-impact issues

### Breaking Build Response

**If CI/CD fails:**

1. **Identify** - Check build logs
2. **Assess** - Determine impact
3. **Fix** - Implement hotfix
4. **Test** - Verify fix locally
5. **Deploy** - Push fix immediately
6. **Monitor** - Watch for additional issues

---

## Agent Success Criteria

**You are doing well if:**

✅ All code is cryptographically secure
✅ All code has comprehensive type safety
✅ All features have tests with >90% coverage
✅ All changes maintain backward compatibility
✅ Bundle size remains optimized
✅ Documentation is thorough and accurate
✅ Security best practices are followed
✅ Performance is maintained or improved

**Red flags to avoid:**

❌ Using `Math.random()` anywhere
❌ Using `any` type
❌ Committing untested code
❌ Breaking API without version bump
❌ Ignoring security warnings
❌ Increasing bundle size significantly
❌ Missing or incomplete documentation
❌ Skipping security review

---

## Additional Resources

### Documentation
- `README.md` - User-facing documentation
- `CLAUDE.md` - Project overview and features
- `AGENTS.md` - This file (agent instructions)

### External References
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [zxcvbn Documentation](https://github.com/dropbox/zxcvbn)
- [EFF Diceware Wordlist](https://www.eff.org/dice)
- [Semantic Versioning](https://semver.org/)

### Internal Tools
- `npm run build` - Build production bundle
- `npm run test` - Run test suite
- `npm run test:coverage` - Generate coverage report
- `npm run type-check` - TypeScript validation
- `npm run lint` - Code quality checks

---

## Conclusion

This document provides comprehensive guidance for AI agents working on the TrustVault Password Utils repository. By following these instructions, agents can contribute effectively while maintaining the project's high standards for security, performance, and code quality.

**Key Takeaways:**

1. **Security is paramount** - Never compromise cryptographic integrity
2. **Types are mandatory** - Full TypeScript coverage required
3. **Tests are essential** - Comprehensive coverage, especially for security
4. **Performance matters** - Optimize hot paths, minimize bundle size
5. **Documentation is critical** - Keep all docs updated and accurate

When in doubt, prioritize security over convenience, and always ask for clarification before making potentially breaking changes.

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-12
**Maintained By:** TrustVault Team
