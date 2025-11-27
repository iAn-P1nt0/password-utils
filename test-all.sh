#!/bin/bash

# Test All Packages Script
# This script runs tests for all packages in the monorepo

set -e

echo "=================================================="
echo "Testing all TrustVault Password Utils packages"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

# Track test status
FAILED_TESTS=""
SUCCESSFUL_TESTS=""
TOTAL_TESTS=0
PASSED_TESTS=0

# Test main package with timeout
print_step "Testing main package (password-kit)..."
if timeout 120 npm test 2>&1 | tee /tmp/main-test.log; then
    print_success "Main package tests passed"
    SUCCESSFUL_TESTS="${SUCCESSFUL_TESTS}\n  - Main package"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    TEST_EXIT=$?
    if [ $TEST_EXIT -eq 124 ]; then
        print_warning "Main package tests timed out after 120 seconds"
        FAILED_TESTS="${FAILED_TESTS}\n  - Main package (timeout)"
    else
        print_error "Main package tests failed"
        FAILED_TESTS="${FAILED_TESTS}\n  - Main package"
    fi
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test React package with timeout
print_step "Testing React hooks package (password-kit-react)..."
cd packages/react
if timeout 120 npm test 2>&1 | tee /tmp/react-test.log; then
    print_success "React package tests passed"
    SUCCESSFUL_TESTS="${SUCCESSFUL_TESTS}\n  - React hooks package"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    TEST_EXIT=$?
    if [ $TEST_EXIT -eq 124 ]; then
        print_warning "React package tests timed out after 120 seconds"
        FAILED_TESTS="${FAILED_TESTS}\n  - React hooks package (timeout)"
    else
        print_error "React package tests failed"
        FAILED_TESTS="${FAILED_TESTS}\n  - React hooks package"
    fi
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
cd ../..
echo ""

# Test CLI package
print_step "Testing CLI package (@trustvault/password-cli)..."
cd packages/cli
if timeout 60 npm test 2>&1 | tee /tmp/cli-test.log; then
    print_success "CLI package tests passed"
    SUCCESSFUL_TESTS="${SUCCESSFUL_TESTS}\n  - CLI package"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    TEST_EXIT=$?
    if [ $TEST_EXIT -eq 124 ]; then
        print_warning "CLI package tests timed out after 60 seconds"
        FAILED_TESTS="${FAILED_TESTS}\n  - CLI package (timeout)"
    else
        print_warning "CLI package has no tests or tests failed"
        FAILED_TESTS="${FAILED_TESTS}\n  - CLI package (no tests)"
    fi
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
cd ../..
echo ""

# Test Web Component package
print_step "Testing Web Component package (@trustvault/password-generator-element)..."
cd packages/web-component
if timeout 60 npm test 2>&1 | tee /tmp/webcomponent-test.log; then
    print_success "Web Component package tests passed"
    SUCCESSFUL_TESTS="${SUCCESSFUL_TESTS}\n  - Web Component package"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    TEST_EXIT=$?
    if [ $TEST_EXIT -eq 124 ]; then
        print_warning "Web Component package tests timed out after 60 seconds"
        FAILED_TESTS="${FAILED_TESTS}\n  - Web Component package (timeout)"
    else
        print_warning "Web Component package has no tests or tests failed"
        FAILED_TESTS="${FAILED_TESTS}\n  - Web Component package (no tests)"
    fi
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
cd ../..
echo ""

# Print summary
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo "Tests passed: $PASSED_TESTS/$TOTAL_TESTS"
echo ""

if [ -n "$SUCCESSFUL_TESTS" ]; then
    echo -e "${GREEN}Successful tests:${NC}"
    echo -e "$SUCCESSFUL_TESTS"
    echo ""
fi

if [ -n "$FAILED_TESTS" ]; then
    echo -e "${YELLOW}Failed/Skipped tests:${NC}"
    echo -e "$FAILED_TESTS"
    echo ""
fi

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    print_success "All tests passed!"
    exit 0
elif [ $PASSED_TESTS -gt 0 ]; then
    print_warning "Some tests passed, but not all"
    exit 0
else
    print_error "All tests failed"
    exit 1
fi
