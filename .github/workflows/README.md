# GitHub Workflows

This directory contains GitHub Actions workflows for the password-kit package.

## Active Workflows

### ci.yml - Continuous Integration

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Test** - Runs on Node.js 20 and 22
   - Checkout code
   - Install dependencies
   - Type checking (`npm run type-check`)
   - Run tests (`npm test`)
   - Build package (`npm run build`)
   - Upload coverage to Codecov (Node 20 only)

2. **Lint** - Code quality checks
   - Run ESLint (`npm run lint`)
   - Continues on error (informational only)

### publish.yml - NPM Publishing

**Triggers:**
- GitHub release created

**Jobs:**
1. **Publish** - Publish to npm registry
   - Checkout code
   - Install dependencies
   - Type checking
   - Run tests
   - Build package
   - Publish to npm with provenance

**Requirements:**
- `NPM_TOKEN` secret must be set in repository settings
- Create npm access token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
- Add token to GitHub: Settings → Secrets → Actions → New repository secret

### codeql.yml - Security Analysis

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Mondays at 6:00 AM)

**Jobs:**
1. **Analyze** - CodeQL security scanning
   - Scans for security vulnerabilities
   - Analyzes TypeScript code
   - Reports findings to Security tab

## Removed Workflows

The following workflows were removed as they were specific to PWA deployment:

- ❌ `deploy-gh-pages.yml` - GitHub Pages deployment
- ❌ `deploy.yml` - Vercel deployment

## Setup Instructions

### For NPM Publishing

1. **Create NPM Access Token**
   ```
   1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   2. Click "Generate New Token" → "Automation"
   3. Copy the token
   ```

2. **Add Token to GitHub**
   ```
   1. Go to repository Settings → Secrets and variables → Actions
   2. Click "New repository secret"
   3. Name: NPM_TOKEN
   4. Value: Paste your npm token
   5. Click "Add secret"
   ```

3. **Create a Release**
   ```bash
   # Tag a version
   git tag v1.0.0
   git push origin v1.0.0
   
   # Create GitHub release
   gh release create v1.0.0 --title "v1.0.0" --notes "Initial release"
   ```

4. **Automatic Publishing**
   - Workflow automatically triggers on release creation
   - Runs tests and builds package
   - Publishes to npm registry with provenance

### For CodeQL Security Scanning

No setup required. CodeQL automatically:
- Scans code on every push and PR
- Runs weekly security checks
- Reports findings in Security → Code scanning alerts

## Workflow Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/iAn-P1nt0/password-kit/workflows/CI/badge.svg)](https://github.com/iAn-P1nt0/password-kit/actions/workflows/ci.yml)
[![CodeQL](https://github.com/iAn-P1nt0/password-kit/workflows/CodeQL/badge.svg)](https://github.com/iAn-P1nt0/password-kit/actions/workflows/codeql.yml)
[![npm version](https://img.shields.io/npm/v/password-kit.svg)](https://www.npmjs.com/package/password-kit)
```

## Troubleshooting

### CI Failures

**Tests failing:**
```bash
# Run locally to debug
npm test
npm run type-check
npm run lint
```

**Build failing:**
```bash
# Test build locally
npm run build
```

### Publish Failures

**"401 Unauthorized"**
- Check that `NPM_TOKEN` secret is set correctly
- Verify token hasn't expired
- Ensure token has "Automation" type permissions

**"403 Forbidden"**
- Verify you have publish permissions for @trustvault scope
- Check organization membership if using org scope
- Ensure package name is available

**"Version already exists"**
- Update version in package.json
- Create new git tag with updated version

### CodeQL Alerts

**False positives:**
- Review alert details
- Dismiss if confirmed false positive
- Add comment explaining dismissal reason

**True positives:**
- Create issue to track fix
- Fix vulnerability in code
- Re-run CodeQL to verify fix

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [CodeQL Documentation](https://codeql.github.com/docs/)
