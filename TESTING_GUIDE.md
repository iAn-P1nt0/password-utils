# Testing Guide: Breach Checker

## Quick Start Testing

### Option 1: Browser Demo (Recommended)

The easiest way to test the breach checker is using the interactive browser demo:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start a local server:**
   ```bash
   # Option A: Using Python
   python3 -m http.server 8000

   # Option B: Using npx
   npx serve .

   # Option C: Using Node.js http-server
   npx http-server -p 8000
   ```

3. **Open the demo:**
   - Navigate to: `http://localhost:8000/demo-breach-checker.html`
   - Try the quick test passwords
   - Enter your own passwords to check

**What to test:**
- ✅ Try "password" - should be breached
- ✅ Try "123456" - should be breached
- ✅ Try "qwerty" - should be breached
- ✅ Try a strong random password - should be safe
- ✅ Check the same password twice - second time should be instant (cached)
- ✅ Click "Clear Cache" and recheck - should hit API again

### Option 2: Node.js CLI Demo

For command-line testing with detailed output:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Run the demo:**
   ```bash
   node demo-breach-checker.js
   ```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║     TrustVault Password Breach Checker Demo           ║
║     Using HIBP API with k-Anonymity Protocol          ║
╚════════════════════════════════════════════════════════╝

============================================================
  Test 1: Known Breached Password
============================================================
This password is in the top 10 most common passwords

Testing: Common password
Password: "password"
Result: Checked: true, Breached: true, Count: 9545824, Cached: false
Duration: 487ms
⚠️  BREACH DETECTED! Found 9545824 times

[... more tests ...]
```

### Option 3: Unit Tests

Run the automated test suite:

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch
```

**Expected output:**
```
✓ tests/breach.test.ts (4 tests) 1005ms
  ✓ checkPasswordBreach
    ✓ should handle offline mode gracefully
    ✓ should handle timeout correctly
    ✓ should export correct types
  ✓ Security validation
    ✓ should not expose password in error messages

Test Files  5 passed (5)
     Tests  63 passed (63)
```

## Manual Integration Testing

### Test 1: Basic API Usage

Create a file `test-basic.js`:

```javascript
import { checkPasswordBreach } from './dist/index.js';

async function test() {
  console.log('Testing basic breach check...\n');

  const password = 'password123';
  console.log(`Checking: "${password}"`);

  const result = await checkPasswordBreach(password);

  console.log('Result:', JSON.stringify(result, null, 2));

  if (result.breached) {
    console.log(`\n⚠️  WARNING: Password found in ${result.count} breaches!`);
  } else {
    console.log('\n✅ Password not found in breaches');
  }
}

test();
```

Run: `node test-basic.js`

### Test 2: Cache Behavior

Create a file `test-cache.js`:

```javascript
import { checkPasswordBreach, clearBreachCache } from './dist/index.js';

async function test() {
  const password = 'password';

  // First check (should hit API)
  console.log('First check (API):');
  const t1 = Date.now();
  const result1 = await checkPasswordBreach(password);
  console.log(`Time: ${Date.now() - t1}ms`);
  console.log(`Cached: ${result1.cached}`);
  console.log();

  // Second check (should use cache)
  console.log('Second check (Cache):');
  const t2 = Date.now();
  const result2 = await checkPasswordBreach(password);
  console.log(`Time: ${Date.now() - t2}ms`);
  console.log(`Cached: ${result2.cached}`);
  console.log();

  // Clear cache
  console.log('Clearing cache...');
  await clearBreachCache();
  console.log();

  // Third check (should hit API again)
  console.log('Third check (After cache clear):');
  const t3 = Date.now();
  const result3 = await checkPasswordBreach(password);
  console.log(`Time: ${Date.now() - t3}ms`);
  console.log(`Cached: ${result3.cached}`);
}

test();
```

Expected timing:
- First check: 200-500ms (API call)
- Second check: <1ms (cached)
- Third check: 200-500ms (API call after clear)

### Test 3: Offline Mode

Create a file `test-offline.js`:

```javascript
import { checkPasswordBreach } from './dist/index.js';

async function test() {
  console.log('Testing offline mode...\n');

  // Check with network disabled
  const result = await checkPasswordBreach('test', {
    allowNetwork: false
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (!result.checked && result.offline) {
    console.log('\n✅ Correctly handled offline mode');
  }
}

test();
```

### Test 4: Timeout Handling

Create a file `test-timeout.js`:

```javascript
import { checkPasswordBreach } from './dist/index.js';

async function test() {
  console.log('Testing timeout handling...\n');

  // Very short timeout
  const result = await checkPasswordBreach('newpassword123', {
    timeout: 1
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (!result.checked) {
    console.log('\n✅ Correctly handled timeout');
  }
}

test();
```

## Integration Testing Scenarios

### Scenario 1: Sign-Up Form

```javascript
async function validateSignupPassword(password) {
  // 1. Quick validation
  if (password.length < 12) {
    return { valid: false, error: 'Password too short' };
  }

  // 2. Check cache first (instant)
  const cachedCheck = await checkPasswordBreach(password, {
    allowNetwork: false
  });

  if (cachedCheck.breached) {
    return {
      valid: false,
      error: 'This password has been compromised'
    };
  }

  // 3. Full check with network
  const fullCheck = await checkPasswordBreach(password);

  if (fullCheck.breached) {
    return {
      valid: false,
      error: `Password found in ${fullCheck.count} breaches`
    };
  }

  return { valid: true };
}
```

### Scenario 2: Password Audit

```javascript
async function auditPasswords(passwords) {
  const results = [];

  for (const password of passwords) {
    const check = await checkPasswordBreach(password);

    if (check.breached) {
      results.push({
        password: '***', // Never log actual password
        breached: true,
        count: check.count
      });
    }

    // Rate limiting handled internally
  }

  return results;
}
```

### Scenario 3: Real-Time Feedback

```javascript
let debounceTimer;

function onPasswordInput(password) {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const result = await checkPasswordBreach(password);

    if (result.breached) {
      showWarning(`⚠️ Found in ${result.count} breaches`);
    } else if (result.checked) {
      showSuccess('✅ Not in known breaches');
    }
  }, 500);
}
```

## Testing Checklist

### Functional Testing

- [ ] Check a known breached password (e.g., "password")
- [ ] Check a strong unique password
- [ ] Verify cache behavior (same password twice)
- [ ] Test offline mode (`allowNetwork: false`)
- [ ] Test timeout handling
- [ ] Clear cache and verify it was cleared
- [ ] Check multiple passwords in sequence

### Security Testing

- [ ] Verify password is never sent over network (use DevTools)
- [ ] Verify only 5-char hash prefix is sent
- [ ] Verify HTTPS-only requests
- [ ] Verify no passwords in console logs
- [ ] Verify no passwords in error messages
- [ ] Test with special characters in password
- [ ] Test with Unicode characters

### Performance Testing

- [ ] First check timing (200-500ms expected)
- [ ] Cached check timing (<1ms expected)
- [ ] Memory usage (check DevTools)
- [ ] Network usage (check DevTools Network tab)
- [ ] Cache size after 100 checks
- [ ] Rate limiting behavior

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Error Handling

- [ ] Network error (disconnect internet)
- [ ] Timeout (very short timeout value)
- [ ] HIBP API down (simulated)
- [ ] Invalid password input (empty, null, undefined)
- [ ] IndexedDB unavailable (private browsing)

## Debugging

### Enable Verbose Logging

The breach checker logs errors to console. To see all logs:

```javascript
// In browser console or Node.js
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog('[LOG]', ...args);
};

console.error = (...args) => {
  originalError('[ERROR]', ...args);
};
```

### Inspect Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "pwnedpasswords.com"
4. Check a password
5. Verify:
   - Only one request per unique prefix
   - Request URL contains only 5 characters
   - Response size is ~15-25 KB

### Inspect IndexedDB

1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB
4. Look for "trustvault-breach-cache"
5. Inspect stored data:
   - Should see prefix (5 chars)
   - Should see hash array
   - Should see timestamp

### Common Issues

**Issue: "IndexedDB not available"**
- Expected in Node.js
- Expected in private browsing
- Falls back to network-only mode

**Issue: Very slow requests**
- First request per prefix is slow (API call)
- Subsequent requests are cached
- Check network connection

**Issue: "offline: true" when online**
- Check CORS settings
- Check HTTPS availability
- Check firewall/proxy settings

## Production Testing

### Pre-Deployment Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed
- [ ] Demo tested in production environment
- [ ] Error handling tested
- [ ] Privacy policy updated

### Monitoring

Monitor these metrics in production:

- **Cache hit rate**: Should be >80% after warmup
- **API response time**: 200-500ms average
- **Error rate**: Should be <1%
- **Offline handling**: Should degrade gracefully

### A/B Testing Recommendations

1. **Test with sample passwords:**
   - Use known breached passwords
   - Use strong unique passwords
   - Measure user response

2. **Measure impact:**
   - Password quality improvement
   - User sign-up completion rate
   - Time to complete sign-up

3. **User feedback:**
   - Survey users about feature
   - Track feature usage
   - Monitor support requests

## Next Steps

After testing Phase 1.1:

1. ✅ Verify all tests pass
2. ✅ Review security considerations
3. ✅ Test integration examples
4. 📋 Decide on next phase:
   - Phase 1.2: Argon2id wrapper
   - Phase 1.3: NIST policy engine
   - Production deployment

## Support

If you encounter issues:

1. Check this guide first
2. Review `BREACH_CHECKER_REVIEW.md`
3. Review `PHASE_1.1_COMPLETION_REPORT.md`
4. Check test files in `tests/`
5. Review implementation in `src/analyzer/breach.ts`

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0
