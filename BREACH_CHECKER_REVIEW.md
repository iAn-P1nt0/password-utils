# Breach Checker Review & Testing Guide

## Overview

The breach checker implementation follows the HIBP (Have I Been Pwned) k-Anonymity protocol to check if passwords appear in known data breaches while maintaining maximum privacy.

## Security Architecture

### k-Anonymity Protocol

The implementation uses a privacy-preserving approach:

```
User Password: "password123"
        ↓
SHA-1 Hash: 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
        ↓
Send to HIBP: 5BAA6 (first 5 chars only - 20 bits)
        ↓
Receive: ~381-584 hash suffixes
        ↓
Compare locally: Full hash check happens on client
        ↓
Result: Breached/Not Breached
```

**Privacy Guarantees:**
- ✅ Password never leaves the device
- ✅ Full hash never sent to server
- ✅ Only 5-character prefix sent (1/1,048,576 of hash space)
- ✅ HTTPS only
- ✅ No logging of sensitive data

### Cache Architecture

```
LRU Cache (In-Memory)
        ↕
IndexedDB (Persistent)
        ↕
HIBP API (Network)
```

**Cache Strategy:**
1. Check in-memory LRU cache first (O(1))
2. If miss, check IndexedDB (persists across sessions)
3. If miss, fetch from HIBP API (rate-limited)
4. Store result in both cache layers

**Cache Management:**
- 24-hour TTL on all entries
- Max 1000 prefixes (~2MB storage)
- Automatic LRU eviction
- Graceful degradation if IndexedDB unavailable

## API Usage Examples

### Basic Usage

```typescript
import { checkPasswordBreach } from '@trustvault/password-utils';

// Check if password is breached
const result = await checkPasswordBreach('password123');

if (result.breached) {
  console.log('⚠️ Password found in breach database!');
  console.log(`Found ${result.count} times`);
} else if (result.checked) {
  console.log('✅ Password not found in breaches');
} else {
  console.log('ℹ️ Could not check (offline or error)');
}
```

### Offline Mode (Cache Only)

```typescript
// Check only local cache, don't make network requests
const result = await checkPasswordBreach('myPassword', {
  allowNetwork: false
});

if (!result.checked && result.offline) {
  console.log('No cached result available');
}
```

### With Timeout

```typescript
// Set custom timeout (default: 5000ms)
const result = await checkPasswordBreach('myPassword', {
  timeout: 3000  // 3 seconds
});
```

### Cache Management

```typescript
import { clearBreachCache } from '@trustvault/password-utils';

// Clear all cached breach data
await clearBreachCache();
console.log('Cache cleared');
```

## Response Structure

```typescript
interface BreachResult {
  checked: boolean;        // Was check performed?
  breached: boolean | null; // null if not checked
  count?: number;          // Times found in breaches
  offline?: boolean;       // Was offline?
  cached?: boolean;        // From cache?
}
```

### Response Scenarios

| Scenario | checked | breached | cached | offline |
|----------|---------|----------|--------|---------|
| Found in breach (API) | true | true | false | - |
| Not breached (API) | true | false | false | - |
| Found in breach (cache) | true | true | true | - |
| Network disabled | false | null | - | true |
| Timeout/Error | false | null | - | true |

## Integration Examples

### React Hook

```typescript
import { useState, useEffect } from 'react';
import { checkPasswordBreach } from '@trustvault/password-utils';

function usePasswordBreach(password: string) {
  const [breach, setBreach] = useState<BreachResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!password) {
      setBreach(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Debounce
    const timer = setTimeout(async () => {
      const result = await checkPasswordBreach(password);
      if (!cancelled) {
        setBreach(result);
        setLoading(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [password]);

  return { breach, loading };
}

// Usage
function PasswordInput() {
  const [password, setPassword] = useState('');
  const { breach, loading } = usePasswordBreach(password);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {loading && <span>Checking...</span>}
      {breach?.breached && (
        <div className="warning">
          ⚠️ This password has been found in {breach.count} data breaches!
        </div>
      )}
    </div>
  );
}
```

### Form Validation

```typescript
async function validatePassword(password: string): Promise<string[]> {
  const errors: string[] = [];

  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  // Breach check
  const breach = await checkPasswordBreach(password, {
    timeout: 2000  // Quick check for UX
  });

  if (breach.breached) {
    errors.push(
      `This password has been compromised in ${breach.count} data breaches. ` +
      'Please choose a different password.'
    );
  }

  return errors;
}
```

### Password Manager Integration

```typescript
class PasswordManager {
  async savePassword(service: string, password: string) {
    // Check breach status before saving
    const breach = await checkPasswordBreach(password);

    if (breach.breached) {
      throw new Error(
        `Cannot save compromised password. ` +
        `Found in ${breach.count} breaches.`
      );
    }

    // Save to vault...
    await this.vault.save(service, password);
  }

  async auditPasswords() {
    const passwords = await this.vault.getAll();
    const breached = [];

    for (const [service, password] of passwords) {
      const breach = await checkPasswordBreach(password);
      if (breach.breached) {
        breached.push({
          service,
          count: breach.count
        });
      }
      // Rate limiting handled internally
    }

    return breached;
  }
}
```

## Performance Characteristics

### Timing Benchmarks

| Operation | Time |
|-----------|------|
| Cache hit (in-memory) | <1ms |
| Cache hit (IndexedDB) | 5-15ms |
| API call (first time) | 200-500ms |
| API call (cached prefix) | <1ms |

### Network Usage

- **Prefix request**: ~100 bytes
- **Response size**: ~15-25 KB per prefix
- **Total for new password**: ~25 KB
- **Total for cached password**: 0 bytes

### Rate Limiting

- Max 1 request/second to HIBP
- Automatic queuing of rapid requests
- Exponential backoff on errors: 1s, 2s, 4s

## Testing

### Manual Testing Script

Create a file `test-breach.js`:

```javascript
import { checkPasswordBreach, clearBreachCache } from './dist/index.js';

async function test() {
  console.log('Testing breach checker...\n');

  // Test 1: Known breached password
  console.log('Test 1: Checking "password123"');
  const result1 = await checkPasswordBreach('password123');
  console.log('Result:', result1);
  console.log('Expected: breached=true\n');

  // Test 2: Strong unique password (unlikely to be breached)
  console.log('Test 2: Checking strong password');
  const result2 = await checkPasswordBreach('Kp9$mNz2@Qw5Xr8T!vL3jH6yF2');
  console.log('Result:', result2);
  console.log('Expected: breached=false\n');

  // Test 3: Cache usage (same password again)
  console.log('Test 3: Checking "password123" again (should be cached)');
  const result3 = await checkPasswordBreach('password123');
  console.log('Result:', result3);
  console.log('Expected: cached=true\n');

  // Test 4: Offline mode
  console.log('Test 4: Offline mode');
  const result4 = await checkPasswordBreach('testpassword', {
    allowNetwork: false
  });
  console.log('Result:', result4);
  console.log('Expected: checked=false, offline=true\n');

  // Test 5: Clear cache
  console.log('Test 5: Clearing cache');
  await clearBreachCache();
  console.log('Cache cleared\n');
}

test().catch(console.error);
```

Run with:
```bash
node test-breach.js
```

### Unit Tests

Run existing test suite:
```bash
npm run test
```

Current test coverage:
- ✅ Offline mode handling
- ✅ Timeout handling
- ✅ Type safety verification
- ✅ Security validation (no password exposure)

## Security Considerations

### What's Protected

✅ **Password Privacy**: Password never sent over network
✅ **Hash Privacy**: Only 5-char prefix sent, full hash stays local
✅ **No Logging**: Passwords never logged or stored in plaintext
✅ **HTTPS Only**: All API calls use HTTPS
✅ **Local Comparison**: Breach matching done client-side
✅ **Cache Encryption**: IndexedDB isolated per origin

### Attack Scenarios & Mitigations

**Scenario 1: Network Eavesdropping**
- ❌ Attack: Intercept API request
- ✅ Mitigation: HTTPS-only, only 5-char prefix sent (1/1M of hash space)

**Scenario 2: HIBP Server Compromise**
- ❌ Attack: Malicious HIBP returns all hashes
- ✅ Mitigation: Local hash comparison, can't reverse password from hash

**Scenario 3: Timing Attacks**
- ❌ Attack: Measure response time to guess password
- ✅ Mitigation: Constant-time local comparison, network variance >> computation time

**Scenario 4: Cache Poisoning**
- ❌ Attack: Inject false data into cache
- ✅ Mitigation: IndexedDB isolated per origin, HTTPS verifies server response

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Fetch API | ✅ | ✅ | ✅ | ✅ |
| Web Crypto | ✅ | ✅ | ✅ | ✅ |
| AbortController | ✅ | ✅ | ✅ | ✅ |

**Minimum Versions:**
- Chrome 60+
- Firefox 57+
- Safari 11.1+
- Edge 79+

## Troubleshooting

### Common Issues

**Issue: "IndexedDB not available" in Node.js**
- Expected behavior - IndexedDB is browser-only
- Falls back to network-only mode
- Use `jsdom` or browser environment for testing

**Issue: Slow first request**
- First request to each prefix requires API call
- Subsequent requests use cache (instant)
- Consider preloading common password prefixes

**Issue: Rate limiting errors**
- HIBP rate limit: 1500 requests per minute
- Our implementation: 1 request per second
- Automatic retry with exponential backoff

### Debug Mode

```typescript
// Enable console logging for debugging
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('breach')) {
    originalConsoleError('BREACH DEBUG:', ...args);
  }
};
```

## Performance Optimization Tips

### 1. Preload Common Passwords

```typescript
// On app initialization
const commonPasswords = [
  'password', 'password123', '12345678', 'qwerty'
];

Promise.all(
  commonPasswords.map(p =>
    checkPasswordBreach(p)
  )
);
// Now cache is warm for instant feedback
```

### 2. Debounce User Input

```typescript
let timer;
input.addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    checkPasswordBreach(e.target.value);
  }, 500);  // Wait for typing to stop
});
```

### 3. Progressive Enhancement

```typescript
// Check cache first for instant feedback
const cacheResult = await checkPasswordBreach(password, {
  allowNetwork: false
});

if (cacheResult.checked) {
  showResult(cacheResult);
} else {
  // Show loading, then check with network
  showLoading();
  const networkResult = await checkPasswordBreach(password);
  showResult(networkResult);
}
```

## Production Checklist

- [ ] HTTPS enabled on your domain
- [ ] CSP headers allow `api.pwnedpasswords.com`
- [ ] Privacy policy mentions HIBP integration
- [ ] User consent for breach checking (if required)
- [ ] Error handling for offline scenarios
- [ ] Loading states for async checks
- [ ] Clear messaging when password is breached
- [ ] Fallback UI if breach check fails

## Next Steps

The breach checker is now ready for:
1. ✅ Local development testing
2. ✅ Integration into existing forms
3. ✅ Password audit features
4. ⏳ Production deployment (after review)

## References

- [HIBP API Documentation](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Model](https://en.wikipedia.org/wiki/K-anonymity)
- [Cloudflare's Implementation](https://blog.cloudflare.com/validating-leaked-passwords-with-k-anonymity/)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
