# password-kit-react

React hooks for [TrustVault Password Utils](https://github.com/iAn-P1nt0/password-kit).

[![npm version](https://img.shields.io/npm/v/password-kit-react.svg)](https://www.npmjs.com/package/password-kit-react)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/iAn-P1nt0/password-kit/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

## Features

✅ **usePasswordGenerator** - Stateful password generation with loading states  
✅ **usePasswordStrength** - Real-time strength analysis with debouncing  
✅ **usePassphraseGenerator** - Diceware passphrase generation  
✅ **useBreachCheck** - HIBP breach checking with k-Anonymity  
✅ **TypeScript First** - Full type definitions  
✅ **React 16.8+** - Compatible with modern React  
✅ **Tree Shakeable** - Import only what you need  

## Installation

```bash
npm install password-kit-react
```

```bash
yarn add password-kit-react
```

```bash
pnpm add password-kit-react
```

## Quick Start

### Password Generation

```tsx
import { usePasswordGenerator } from 'password-kit-react';

function PasswordForm() {
  const { password, generate, loading, clear } = usePasswordGenerator({
    length: 16,
    includeSymbols: true
  });

  return (
    <div>
      <button onClick={() => generate()} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Password'}
      </button>
      <input type="text" value={password} readOnly />
      <button onClick={clear}>Clear</button>
      
      {password && (
        <div>
          <p>Entropy: {result?.entropy} bits</p>
          <p>Strength: {result?.strength}</p>
        </div>
      )}
    </div>
  );
}
```

### Password Strength Analysis

```tsx
import { useState } from 'react';
import { usePasswordStrength } from 'password-kit-react';

function PasswordInput() {
  const [password, setPassword] = useState('');
  const { strength, loading } = usePasswordStrength(password, {
    debounce: 300
  });

  return (
    <div>
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      
      {loading && <p>Analyzing...</p>}
      
      {!loading && strength && (
        <div>
          <StrengthMeter score={strength.score} />
          <p>Strength: {strength.strength}</p>
          <p>Crack time: {strength.crackTime}</p>
          <p>Entropy: {strength.entropy} bits</p>
          
          {strength.feedback.warning && (
            <p>⚠️ {strength.feedback.warning}</p>
          )}
          
          {strength.feedback.suggestions.map((suggestion, i) => (
            <p key={i}>💡 {suggestion}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function StrengthMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score < 40) return 'red';
    if (score < 60) return 'orange';
    if (score < 80) return 'yellow';
    return 'green';
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '8px', 
      backgroundColor: '#eee' 
    }}>
      <div style={{ 
        width: `${score}%`, 
        height: '100%', 
        backgroundColor: getColor(),
        transition: 'all 0.3s ease'
      }} />
    </div>
  );
}
```

### Passphrase Generation

```tsx
import { usePassphraseGenerator } from 'password-kit-react';

function PassphraseForm() {
  const { passphrase, generate, loading } = usePassphraseGenerator({
    wordCount: 5,
    separator: 'dash',
    capitalization: 'first',
    includeNumber: true
  });

  return (
    <div>
      <button onClick={() => generate()} disabled={loading}>
        Generate Passphrase
      </button>
      <p>{passphrase}</p>
      {/* Example: Forest-Mountain-River-Sky-Ocean47 */}
    </div>
  );
}
```

### Breach Checking

```tsx
import { useState } from 'react';
import { useBreachCheck } from 'password-kit-react';

function SignupForm() {
  const [password, setPassword] = useState('');
  const { breached, loading, count, check } = useBreachCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await check(password);
    
    if (result.breached) {
      alert(`⚠️ This password has been found in ${result.count} breaches!`);
      return;
    }
    
    // Proceed with signup
    console.log('Password is safe to use');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Choose a password"
      />
      
      {breached && (
        <p style={{ color: 'red' }}>
          ⚠️ Password found in {count} breaches!
        </p>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Checking...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

## API Reference

### usePasswordGenerator

```tsx
const {
  password,      // string - Generated password
  loading,       // boolean - Generation in progress
  result,        // PasswordResult | null - Full result object
  generate,      // (options?) => Promise<PasswordResult>
  clear          // () => void - Clear password
} = usePasswordGenerator(options?);
```

**Options:**
```typescript
interface PasswordOptions {
  length?: number;              // 8-128, default: 16
  includeUppercase?: boolean;   // default: true
  includeLowercase?: boolean;   // default: true
  includeNumbers?: boolean;     // default: true
  includeSymbols?: boolean;     // default: true
}
```

### usePasswordStrength

```tsx
const {
  strength,      // PasswordStrengthResult | null
  loading,       // boolean - Analysis in progress
  error          // Error | null
} = usePasswordStrength(password, options?);
```

**Options:**
```typescript
interface UsePasswordStrengthOptions {
  debounce?: number;    // ms, default: 300
  enabled?: boolean;    // default: true
  preload?: boolean;    // preload zxcvbn, default: true
}
```

### usePassphraseGenerator

```tsx
const {
  passphrase,    // string - Generated passphrase
  loading,       // boolean
  result,        // PassphraseResult | null
  generate,      // (options?) => Promise<PassphraseResult>
  clear          // () => void
} = usePassphraseGenerator(options?);
```

**Options:**
```typescript
interface PassphraseOptions {
  wordCount?: number;                // 3-10, default: 4
  separator?: 'dash' | 'space' | 'none';  // default: 'dash'
  capitalization?: 'none' | 'first' | 'all';  // default: 'none'
  includeNumber?: boolean;           // default: false
}
```

### useBreachCheck

```tsx
const {
  result,        // BreachResult | null
  loading,       // boolean
  error,         // Error | null
  breached,      // boolean | null
  count,         // number | null - Occurrences in breaches
  check,         // (password) => Promise<BreachResult>
  clear          // () => void
} = useBreachCheck(options?);
```

**Options:**
```typescript
interface UseBreachCheckOptions {
  allowNetwork?: boolean;  // default: true
  timeout?: number;        // ms, default: 5000
}
```

## Advanced Examples

### Complete Password Form

```tsx
import { useState } from 'react';
import {
  usePasswordGenerator,
  usePasswordStrength,
  useBreachCheck
} from 'password-kit-react';

function CompletePasswordForm() {
  const [password, setPassword] = useState('');
  const { generate, loading: generating } = usePasswordGenerator();
  const { strength, loading: analyzing } = usePasswordStrength(password);
  const { breached, loading: checking, check } = useBreachCheck();

  const handleGenerate = async () => {
    const result = await generate({ length: 20 });
    setPassword(result.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await check(password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={handleGenerate} disabled={generating}>
          Generate
        </button>
      </div>

      {analyzing && <p>Analyzing strength...</p>}
      
      {strength && (
        <div>
          <StrengthMeter score={strength.score} />
          <p>Strength: {strength.strength} ({strength.entropy} bits)</p>
        </div>
      )}

      {breached && <p>⚠️ Password compromised!</p>}

      <button type="submit" disabled={checking}>
        {checking ? 'Checking...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Preload for Better Performance

```tsx
import { useEffect } from 'react';
import { preloadZxcvbn } from 'password-kit';

function App() {
  // Preload zxcvbn on app mount
  useEffect(() => {
    preloadZxcvbn();
  }, []);

  return <YourApp />;
}
```

## TypeScript Support

All hooks are fully typed with TypeScript:

```tsx
import type {
  UsePasswordGeneratorResult,
  UsePasswordStrengthResult,
  UsePassphraseGeneratorResult,
  UseBreachCheckResult,
  PasswordOptions,
  PassphraseOptions,
  PasswordStrengthResult,
  BreachResult
} from 'password-kit-react';
```

## Performance Tips

1. **Debounce strength analysis** - Use the `debounce` option (default 300ms)
2. **Preload zxcvbn** - Call `preloadZxcvbn()` early in your app
3. **Cache breach checks** - Results are automatically cached for 24h
4. **Conditional analysis** - Use `enabled` option to disable when not needed

## Browser Compatibility

- React 16.8+ (Hooks support)
- Modern browsers with Web Crypto API
- Chrome 60+, Firefox 57+, Safari 11.1+, Edge 79+

## License

Apache-2.0

## Related Packages

- [password-kit](https://www.npmjs.com/package/password-kit) - Core library
- [password-kit-vue](https://www.npmjs.com/package/password-kit-vue) - Vue 3 composables

## Contributing

See [CONTRIBUTING.md](https://github.com/iAn-P1nt0/password-kit/blob/main/CONTRIBUTING.md)

## Support

- 📖 [Documentation](https://github.com/iAn-P1nt0/password-kit)
- 🐛 [Issue Tracker](https://github.com/iAn-P1nt0/password-kit/issues)
- 💬 [Discussions](https://github.com/iAn-P1nt0/password-kit/discussions)
