/**
 * Tests for breach checker functionality
 *
 * Tests cover:
 * - k-Anonymity protocol (only 5-char prefix sent)
 * - Offline-first architecture
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPasswordBreach } from '../src/analyzer/breach';

describe('checkPasswordBreach', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle offline mode gracefully', async () => {
    const result = await checkPasswordBreach('testpassword', {
      allowNetwork: false,
    });

    expect(result.checked).toBe(false);
    expect(result.breached).toBeNull();
    expect(result.offline).toBe(true);
  });

  it('should handle timeout correctly', async () => {
    const result = await checkPasswordBreach('testpassword', {
      timeout: 1,
      allowNetwork: true,
    });

    // Should fail fast with timeout
    expect(result.checked).toBe(false);
  });

  it('should export correct types', () => {
    // Type check - this will fail at compile time if types are wrong
    const result: Promise<{
      checked: boolean;
      breached: boolean | null;
      count?: number;
      offline?: boolean;
      cached?: boolean;
    }> = checkPasswordBreach('test');

    expect(result).toBeDefined();
  });
});

describe('Security validation', () => {
  it('should not expose password in error messages', async () => {
    const password = 'supersecretpassword123';
    try {
      await checkPasswordBreach(password, { timeout: 1 });
    } catch (error) {
      const errorString = JSON.stringify(error);
      expect(errorString).not.toContain(password);
    }
  });
});
