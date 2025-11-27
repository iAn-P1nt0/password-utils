# Running the Examples

## Quick Start

All examples can be run from the `examples/` directory after installing dependencies.

### Install Dependencies

```bash
npm install
```

This will install the `password-kit` package from the local tarball.

## Running Individual Examples

### Example 1: Basic Password Generation
```bash
node 1-basic-password.js
```
**Demonstrates:**
- Default password generation
- Custom length passwords
- Alphanumeric-only passwords
- Excluding ambiguous characters
- PIN/number-only generation
- Maximum security passwords

### Example 2: Passphrase Generation
```bash
node 2-passphrase.js
```
**Demonstrates:**
- Default passphrase with dash separator
- Space-separated passphrases
- Capitalization strategies
- Adding numbers for security
- Symbol-separated passphrases
- Concatenated passphrases

### Example 3: Strength Analysis
```bash
node 3-strength-analysis.js
```
**Demonstrates:**
- Analyzing various password types
- Pattern detection
- Crack time estimation
- Actionable feedback
- Comparing weak to strong passwords

### Example 4: Quick Validation
```bash
node 4-quick-validation.js
```
**Demonstrates:**
- Progressive typing simulation
- Real-time feedback
- Minimum requirements checking
- Form validation examples
- Performance comparison

### Example 5: Comprehensive Demo
```bash
node 5-comprehensive-demo.js
```
**Demonstrates:**
- All features in one place
- Batch password generation
- Security comparisons
- TOTP formatting
- Best practices

## Run All Examples

```bash
npm run demo
```

This will run all 5 examples in sequence.

## Example Output

Each example produces formatted console output showing:
- Generated passwords/passphrases
- Strength ratings
- Entropy calculations
- Security recommendations
- Validation feedback

## Troubleshooting

**Issue: "Cannot find module 'password-kit'"**

Solution:
```bash
cd ..
npm pack
cd examples
npm install
```

**Issue: "Examples show errors"**

Make sure you're using Node.js 20 or higher:
```bash
node --version  # Should be v20.0.0 or higher
```

## Next Steps

After running the examples:
1. Review the output to understand the API
2. Check the source code in each example file
3. Modify the examples to test different scenarios
4. Read the main README.md for API documentation
5. Try integrating the library into your own project

Enjoy! 🔐
