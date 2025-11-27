---
## Mandatory Enhancement Plan (always apply before new features)

Every agent MUST follow the **prioritised roadmap below** when asked to
enhance password-kit.  The sequence is security-impact-ranked
and bundle-size-aware; do **not** deviate without explicit user approval.

### Phase-1  "Zero-Days & Re-use" (highest ROI)

#### 1. **Breach-check wrapper** (`src/analyzer/breach.ts`)

**Implementation Requirements:**
- **k-Anonymity Protocol**: Use HIBP API with SHA-1 prefix (first 5 hex chars = 20 bits)
  - Hash password with SHA-1: `sha1Hash = SHA1(password)`
  - Send only prefix: `prefix = sha1Hash.substring(0, 5)`
  - HIBP returns all hashes starting with that prefix (~381-584 hashes per bucket)
  - Compare full hash locally against returned bucket
- **LRU Cache Strategy** (24-hour TTL):
  - Use `IndexedDB` for persistent storage (survives browser restarts)
  - Implement LRU eviction with O(1) access using Map + doubly-linked list
  - Cache structure: `{prefix: string, hashes: Set<string>, timestamp: number}`
  - Max cache size: 1000 prefixes (~500 hashes avg = ~2MB storage)
- **Offline-First Architecture**:
  - Check cache first (synchronous, instant)
  - If cache miss + network available → fetch from HIBP
  - If cache miss + offline → return `{checked: false, breached: null, offline: true}`
  - Provide `allowNetwork: boolean` option (default: true)
- **Security Considerations**:
  - NEVER send full password hash to server
  - Use HTTPS only for API calls
  - Implement rate limiting: max 1 request/second to HIBP
  - Add exponential backoff for API failures
- **Bundle Size**: ≤2 kB gzipped (no external deps beyond crypto)
- **API Surface**:
  ```typescript
  interface BreachResult {
    checked: boolean;        // Was check performed?
    breached: boolean | null; // null if not checked
    count?: number;          // Occurrences in breaches
    offline?: boolean;       // Was offline?
    cached?: boolean;        // Was result cached?
  }
  
  async function checkPasswordBreach(
    password: string,
    options?: { allowNetwork?: boolean; timeout?: number }
  ): Promise<BreachResult>
  ```

**Research References**:
- Cloudflare k-Anonymity implementation[1][2]
- HIBP API documentation[4]
- LRU cache with IndexedDB persistence[61][62]

#### 2. **Argon2id client wrapper** (`src/utils/argon2.ts`)

**Implementation Requirements:**
- **Library Selection**: Use `argon2-browser` (WASM-based, 119-225ms in modern browsers)[6]
- **Web Worker Offloading**:
  - Create dedicated worker: `argon2-worker.js`
  - Never block main thread >60ms
  - Fallback to main thread if workers unavailable
  - Worker communication: `postMessage` with transferable objects
- **Parameter Configuration** (OWASP recommended):
  - **Memory cost**: 19 MiB (19456 KiB) minimum, 47 MiB optimal
  - **Time cost**: 2 iterations minimum, 3-4 iterations optimal
  - **Parallelism**: 1 (web workers can't use actual parallelism)
  - **Salt**: 16 bytes cryptographically random per password
  - **Hash length**: 32 bytes (256 bits)
- **Constant-Time Verification**:
  - Use bitwise XOR comparison to prevent timing attacks
  - Compare byte-by-byte without early exit
  - Verify length first, then content
- **Progressive Enhancement**:
  - Check for WASM support, fallback to asm.js
  - Check for SIMD support (2x speed boost if available)
  - Graceful degradation for older browsers
- **API Surface**:
  ```typescript
  interface Argon2Options {
    memory: number;      // KiB, default: 19456
    iterations: number;  // default: 2
    parallelism: number; // default: 1
    hashLength: number;  // default: 32
  }
  
  async function hashPassword(
    password: string,
    options?: Partial<Argon2Options>
  ): Promise<{ hash: Uint8Array; salt: Uint8Array; encoded: string }>
  
  async function verifyPassword(
    password: string,
    encoded: string
  ): Promise<boolean>
  ```

**Research References**:
- Argon2 browser implementation[6][9][18]
- Web Worker integration patterns[9]
- OWASP password storage guidelines[22]

#### 3. **NIST 800-63B policy engine** (`src/analyzer/policy.ts`)

**Implementation Requirements:**
- **Core NIST 800-63B Rev 4 Requirements** (August 2025)[7][10]:
  - **Minimum length**: 15 characters (when password is sole authenticator)
  - **Maximum length**: ≥64 characters minimum, ≥128 recommended
  - **Character support**: All ASCII printable + space + Unicode
  - **Composition rules**: SHALL NOT enforce (no "must include number/symbol")
  - **Blocklist checking**: MUST check against compromised passwords
  - **No periodic expiration**: Only force change on compromise evidence
  - **Unicode normalization**: Apply NFKC or NFKD before processing[27][33]
- **Blocklist Categories**:
  1. Common passwords (top 10K from breach databases)
  2. Dictionary words (English + major languages)
  3. Repetitive/sequential patterns (aaa, 123, abc)
  4. Context-specific (service name, username, user info)
- **JSON-Driven Configuration**:
  ```typescript
  interface PolicyConfig {
    minLength: number;           // default: 15
    maxLength: number;           // default: 128
    requireUnicode: boolean;     // default: false
    blocklists: string[];        // URLs or built-in refs
    contextWords: string[];      // service name, etc.
    allowedChars?: string;       // null = all printable
    normalization: 'NFKC' | 'NFKD'; // default: NFKC
  }
  ```
- **Performance Target**: <0.5ms validation (blocklist as Bloom filter or trie)
- **Enterprise Extensibility**:
  - Plugin system for custom rules
  - Webhook support for remote blocklist updates
  - Audit logging hooks
- **API Surface**:
  ```typescript
  interface PolicyViolation {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }
  
  interface PolicyResult {
    valid: boolean;
    violations: PolicyViolation[];
    score?: number; // 0-100
  }
  
  function validatePassword(
    password: string,
    config: PolicyConfig,
    context?: { username?: string; email?: string }
  ): Promise<PolicyResult>
  ```

**Research References**:
- NIST 800-63B Rev 4 updates[7][10][13][16]
- Unicode normalization for passwords[27][33][38]

---

### Phase-2  "i18n & Age"

#### 4. **Unicode character sets** (`generators/unicode.ts`)

**Implementation Requirements:**
- **Character Set Ranges**:
  - **CJK Unified Ideographs**: U+4E00–U+9FFF (20,992 characters)
  - **Cyrillic**: U+0400–U+04FF (256 characters)
  - **Arabic**: U+0600–U+06FF (256 characters)
  - **Latin Extended**: U+0100–U+017F, U+0180–U+024F
  - **Emoji**: U+1F600–U+1F64F (for memorable passwords)
- **Unicode Normalization** (CRITICAL):
  - **Always normalize** before hashing/storing (NFC recommended)[27][30]
  - **Problem**: Same visual character can have multiple encodings
  - **Solution**: Apply Unicode Normalization Form C (NFC) via `String.prototype.normalize('NFC')`
  - **Browser consistency**: Different browsers may send different forms
- **Entropy Calculation Updates**:
  - CJK charset entropy: log2(20992) ≈ 14.36 bits/char
  - Cyrillic charset entropy: log2(256) = 8 bits/char
  - Mixed charset: Use actual pool size, not sum
- **Security Considerations**:
  - Warn about homoglyph attacks (visually similar chars)
  - Detect and reject known confusables (0/O, l/1/I)
  - Consider PRECIS framework (RFC 8264) for input validation[38]
- **API Surface**:
  ```typescript
  enum CharsetType {
    Latin = 'latin',
    CJK = 'cjk',
    Cyrillic = 'cyrillic',
    Arabic = 'arabic',
    Mixed = 'mixed'
  }
  
  function generatePassword(options: {
    length: number;
    charsetType: CharsetType;
    normalize?: boolean; // default: true
  }): string
  ```

**Research References**:
- Unicode normalization security[27][30][33][36]
- PRECIS framework[38]
- Unicode password entropy[30]

#### 5. **Password-expiry estimator** (`analyzer/expiry.ts`)

**Implementation Requirements:**
- **Expiry Calculation Formula**:
  ```typescript
  expiryDate = createdAt + calculateRotationPeriod({
    entropy,
    breachAge,
    crackCost,
    riskProfile
  })
  ```
- **Entropy-Based Scaling**:
  - <40 bits: 30 days max
  - 40-60 bits: 90 days max
  - 60-80 bits: 180 days max
  - >80 bits: 365+ days (or no forced rotation per NIST)
- **Breach Age Factor**:
  - If password found in breach: immediate rotation
  - If similar passwords breached <90 days ago: 30-day rotation
  - Otherwise: entropy-based schedule
- **Crack Cost Estimation**:
  - Estimate based on current GPU hash rates
  - AWS/Cloud cost models for distributed cracking
  - Factor in algorithm (Argon2id >> bcrypt >> MD5)
- **Risk Profile Context**:
  - High-value accounts (admin, financial): 2x shorter rotation
  - MFA-protected accounts: 2x longer rotation allowed
  - Privileged access: mandatory 90-day regardless of entropy
- **API Surface**:
  ```typescript
  interface ExpiryEstimate {
    expiryDate: Date;
    daysRemaining: number;
    recommendRotation: boolean;
    reason: string;
    nextCheckDate: Date;
  }
  
  function calculateExpiry(
    password: string,
    createdAt: Date,
    options?: {
      riskProfile?: 'low' | 'medium' | 'high';
      hasMFA?: boolean;
      isPrivileged?: boolean;
    }
  ): Promise<ExpiryEstimate>
  ```

**Research References**:
- NIST guidance on password rotation[7][10]
- Entropy and password aging research[23][24][25]

#### 6. **Lazy-load zxcvbn** (cut initial bundle by ~370 kB)

**Implementation Requirements:**
- **Code-Splitting Strategy**:
  - Use dynamic `import()` for zxcvbn (not `require()`)
  - Create separate chunk: `zxcvbn.chunk.js`
  - Webpack config: `splitChunks` optimization
- **Progressive Loading**:
  - Only load when `analyzePasswordStrength()` called
  - Cache loaded module in memory
  - Show loading indicator during first load
  - Prefetch on user interaction (e.g., focus on password field)
- **Bundle Analysis**:
  - Before: `bundle.js` (442 kB)
  - After: `main.js` (72 kB) + `zxcvbn.chunk.js` (370 kB)
  - Only load zxcvbn chunk when needed
- **Webpack Configuration**:
  ```javascript
  optimization: {
    splitChunks: {
      cacheGroups: {
        zxcvbn: {
          test: /[\\/]node_modules[\\/]zxcvbn[\\/]/,
          name: 'zxcvbn',
          chunks: 'async'
        }
      }
    }
  }
  ```
- **React.lazy Pattern** (if applicable):
  ```typescript
  const PasswordAnalyzer = React.lazy(() => 
    import('./PasswordAnalyzer')
  );
  
  <React.Suspense fallback={<Loading />}>
    <PasswordAnalyzer />
  </React.Suspense>
  ```
- **Prefetch Strategy**:
  ```typescript
  // On password input focus
  input.addEventListener('focus', () => {
    import(/* webpackPrefetch: true */ 'zxcvbn');
  }, { once: true });
  ```

**Research References**:
- Code splitting with Webpack[26][32][35][37][67][70][76]
- Lazy loading zxcvbn example[35]

---

### Phase-3  "DX & A11y"

#### 7. **Framework hooks** (`password-kit-react|vue`)

**React Implementation** (`password-kit-react`):
```typescript
// usePasswordGenerator.ts
export function usePasswordGenerator(
  initialOptions?: PasswordOptions
) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const generate = useCallback(async (options?: PasswordOptions) => {
    setLoading(true);
    try {
      const result = await generatePassword({
        ...initialOptions,
        ...options
      });
      setPassword(result.password);
      return result;
    } finally {
      setLoading(false);
    }
  }, [initialOptions]);
  
  return { password, generate, loading };
}

// usePasswordStrength.ts
export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    if (!password) {
      setStrength(null);
      return;
    }
    
    setLoading(true);
    // Debounce + lazy load zxcvbn
    const timeoutId = setTimeout(() => {
      import('zxcvbn').then(zxcvbn => {
        if (!cancelled) {
          const result = analyzeStrength(password, zxcvbn.default);
          setStrength(result);
          setLoading(false);
        }
      });
    }, 300);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [password]);
  
  return { strength, loading };
}
```

**Vue 3 Implementation** (`password-kit-vue`):
```typescript
// usePasswordGenerator.ts
export function usePasswordGenerator(
  initialOptions?: PasswordOptions
) {
  const password = ref('');
  const loading = ref(false);
  
  const generate = async (options?: PasswordOptions) => {
    loading.value = true;
    try {
      const result = await generatePassword({
        ...initialOptions,
        ...options
      });
      password.value = result.password;
      return result;
    } finally {
      loading.value = false;
    }
  };
  
  return { password, generate, loading };
}

// Composable pattern
export function usePasswordStrength(password: Ref<string>) {
  const strength = ref<StrengthResult | null>(null);
  const loading = ref(false);
  
  watchDebounced(
    password,
    async (newPassword) => {
      if (!newPassword) {
        strength.value = null;
        return;
      }
      loading.value = true;
      const zxcvbn = await import('zxcvbn');
      strength.value = analyzeStrength(newPassword, zxcvbn.default);
      loading.value = false;
    },
    { debounce: 300 }
  );
  
  return { strength: readonly(strength), loading: readonly(loading) };
}
```

**Research References**:
- React hooks patterns[41][42][43]
- Vue 3 composables[45][48][51]

#### 8. **Web Component** (`<password-generator>`)

**Implementation Requirements**:
- **Shadow DOM**: Use for style encapsulation
- **Accessibility (CRITICAL)**:
  - Provide ARIA labels for all interactive elements
  - Ensure keyboard navigation (Tab, Enter, Escape)
  - Announce generated passwords to screen readers
  - Use `aria-live` regions for dynamic updates
  - PROBLEM: ARIA references don't cross shadow boundaries[49][52][55][58][60]
  - SOLUTION: Use `aria*Elements` properties or slots for external labels
- **Custom Element Definition**:
  ```typescript
  class PasswordGeneratorElement extends HTMLElement {
    static get observedAttributes() {
      return ['length', 'charset', 'auto-generate'];
    }
    
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
      this.render();
      this.setupEventListeners();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render();
      }
    }
  }
  
  customElements.define('password-generator', PasswordGeneratorElement);
  ```
- **Shadow DOM Template**:
  ```html
  <template id="password-generator-template">
    <style>
      :host { display: block; }
      .container { padding: 1rem; }
      button { cursor: pointer; }
    </style>
    <div class="container">
      <label>
        <span id="length-label">Password Length</span>
        <input
          type="range"
          min="8"
          max="128"
          value="16"
          aria-labelledby="length-label"
        />
      </label>
      <button aria-label="Generate Password">Generate</button>
      <output aria-live="polite" role="status"></output>
    </div>
  </template>
  ```
- **Accessibility Pattern**:
  - Use slots for external labels to avoid ARIA issues
  - Provide keyboard shortcuts (Ctrl+G to generate)
  - Focus management after generation
  - Copy-to-clipboard with feedback
- **Bundle Size Target**: 8 kB gzipped (compressed shadow DOM + logic)

**Research References**:
- Shadow DOM accessibility[49][52][55][58][60]
- Web Components best practices[46][49]

#### 9. **CLI tool** (`npx tvpg`)

**Implementation Requirements**:
- **CLI Framework**: Use `commander` or `yargs` (lightweight)
- **Clipboard Integration**: Use `clipboardy` (cross-platform)[47][50][53][59]
- **Security Considerations**:
  - Use `/dev/urandom` on Unix (cryptographically secure)
  - Use Web Crypto API equivalent in Node.js
  - Clear clipboard after configurable timeout
  - Option to skip clipboard for CI/CD environments
- **Command Structure**:
  ```bash
  npx tvpg --length 20 --count 10 --charset alphanumeric --copy
  npx tvpg --passphrase --words 5 --separator "-"
  npx tvpg --breach-check --password "mypassword"
  npx tvpg --generate-hash --algorithm argon2id
  ```
- **CLI Options**:
  ```typescript
  interface CLIOptions {
    length?: number;           // default: 16
    count?: number;            // default: 1
    charset?: string;          // default: 'all'
    copy?: boolean;            // default: true
    passphrase?: boolean;      // default: false
    words?: number;            // default: 4
    separator?: string;        // default: '-'
    breachCheck?: boolean;     // default: false
    json?: boolean;            // output as JSON
    quiet?: boolean;           // suppress output
  }
  ```
- **Interactive Mode**:
  - Prompt for options if not provided
  - Show password strength meter
  - Offer breach check
  - Save to file option
- **Output Formatting**:
  ```
  Generated Password: Kp9$mNz2@Qw5Xr8T
  Strength: Very Strong (95.2 bits entropy)
  ✓ Copied to clipboard (clears in 30s)
  ```

**Research References**:
- CLI password generators[47][50][53][59]
- Clipboard security[50][53]

---

### Exit Criteria for each feature
- [ ] ≥95% test coverage including security tests (timing, bias, entropy)
- [ ] Bundle size gate passed (core ≤35 kB, lazy chunks ≤380 kB)
- [ ] Full JSDoc + README update with usage examples
- [ ] TypeScript strict mode with zero `any` types
- [ ] No `Math.random()`, all crypto uses `Web Crypto API`
- [ ] No new prod deps >5 kB without explicit justification
- [ ] Accessibility audit passed (WCAG 2.1 Level AA)
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Performance benchmarks met (<100ms for hot paths)
- [ ] Security audit completed (timing attacks, entropy validation)

### Forbidden short-cuts
❌ Skip breach checker and jump to "nice-to-haves" like ML patterns  
❌ Add heavy deps (>50 kB) without tree-shaking or lazy loading  
❌ Introduce breaking API change without major-version bump  
❌ Commit without regression tests for cryptographic properties (bias, entropy, timing)  
❌ Use synchronous APIs that block the main thread >60ms  
❌ Hard-code configuration values without environment overrides  
❌ Implement features without considering offline-first scenarios  
❌ Skip Unicode normalization when handling international passwords  
❌ Forget to handle ARIA across shadow DOM boundaries  
❌ Use localStorage for sensitive data (prefer IndexedDB with encryption)

### Implementation Checklist Template (copy to PR description)
```markdown
## Feature: [Feature Name]

### Implementation
- [ ] Core functionality implemented
- [ ] TypeScript types defined and exported
- [ ] Security review completed
- [ ] Performance benchmarks met

### Testing
- [ ] Unit tests (>95% coverage)
- [ ] Integration tests
- [ ] Security tests (timing, bias, entropy)
- [ ] Cross-browser tests
- [ ] Accessibility tests (if UI component)

### Documentation
- [ ] JSDoc comments added
- [ ] README.md updated
- [ ] CHANGELOG.md entry added
- [ ] Migration guide (if breaking changes)

### Bundle Size
- [ ] Core bundle: _____ kB (target: ≤35 kB)
- [ ] Lazy chunks: _____ kB (target: ≤380 kB)
- [ ] Webpack Bundle Analyzer screenshot attached

### Security
- [ ] No Math.random() usage
- [ ] Timing attack resistance verified
- [ ] Entropy calculations validated
- [ ] Secrets never logged or exposed
```

Always open PR against `main` with above checklist in the description.

---

**Research Sources:**
[1-80] Research citations embedded throughout document

--- END ENHANCED INSERT

# AI Agent Instructions for TrustVault Password Utils

[Rest of document continues as before...]