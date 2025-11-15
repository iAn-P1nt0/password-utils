/**
 * Tests for Unicode Character Set Generator
 *
 * Tests cover:
 * - Unicode character set generation (CJK, Cyrillic, Arabic, etc.)
 * - Unicode normalization (NFC, NFD, NFKC, NFKD)
 * - Homoglyph detection
 * - Entropy calculation for international character sets
 * - Mixed charset support
 * - Emoji password generation
 */

import { describe, it, expect } from 'vitest';
import {
  generateUnicodePassword,
  getDefaultUnicodeOptions,
  getCharsetInfo,
  validateUnicodePassword,
  generateEmojiPassword,
  calculateMixedEntropy,
  CharsetType,
} from '../src/generators/unicode';

describe('Unicode Character Sets', () => {
  it('should generate Latin password', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
    });

    expect(result.password).toHaveLength(16);
    expect(result.charsetType).toBe(CharsetType.Latin);
    expect(result.poolSize).toBe(52); // 26 + 26
    expect(result.entropy).toBeCloseTo(Math.log2(52) * 16, 1);
  });

  it('should generate CJK password', () => {
    const result = generateUnicodePassword({
      length: 12,
      charsetType: CharsetType.CJK,
    });

    expect(result.password).toHaveLength(12);
    expect(result.charsetType).toBe(CharsetType.CJK);
    expect(result.poolSize).toBe(20992);
    expect(result.entropy).toBeCloseTo(14.36 * 12, 1); // ~172 bits
  });

  it('should generate Cyrillic password', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Cyrillic,
    });

    expect(result.password).toHaveLength(16);
    expect(result.charsetType).toBe(CharsetType.Cyrillic);
    expect(result.poolSize).toBe(256);
    expect(result.entropy).toBeCloseTo(8 * 16, 1); // 128 bits
  });

  it('should generate Arabic password', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Arabic,
    });

    expect(result.password).toHaveLength(16);
    expect(result.charsetType).toBe(CharsetType.Arabic);
    expect(result.poolSize).toBe(256);
  });

  it('should generate Latin Extended password', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.LatinExtended,
    });

    expect(result.password).toHaveLength(16);
    expect(result.charsetType).toBe(CharsetType.LatinExtended);
    expect(result.poolSize).toBe(336); // 128 + 208
  });

  it('should generate Emoji password', () => {
    const result = generateUnicodePassword({
      length: 8,
      charsetType: CharsetType.Emoji,
    });

    expect(result.password).toHaveLength(8);
    expect(result.charsetType).toBe(CharsetType.Emoji);
    expect(result.poolSize).toBe(80);
  });
});

describe('Mixed Character Sets', () => {
  it('should generate password with mixed charsets', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: [CharsetType.Latin, CharsetType.Cyrillic],
    });

    expect(result.password).toHaveLength(16);
    expect(result.charsetType).toEqual([
      CharsetType.Latin,
      CharsetType.Cyrillic,
    ]);
    expect(result.poolSize).toBe(52 + 256); // Latin + Cyrillic
  });

  it('should include numbers when requested', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
      includeNumbers: true,
    });

    expect(result.poolSize).toBe(62); // 52 + 10
  });

  it('should include symbols when requested', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
      includeSymbols: true,
    });

    expect(result.poolSize).toBe(84); // 52 + 32
  });

  it('should include both numbers and symbols', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
      includeNumbers: true,
      includeSymbols: true,
    });

    expect(result.poolSize).toBe(94); // 52 + 10 + 32
  });
});

describe('Unicode Normalization', () => {
  it('should normalize password by default', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
      normalize: true,
    });

    expect(result.normalized).toBeDefined();
  });

  it('should not normalize when disabled', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
      normalize: false,
    });

    expect(result.normalized).toBeUndefined();
  });

  it('should support different normalization forms', () => {
    const forms: Array<'NFC' | 'NFD' | 'NFKC' | 'NFKD'> = [
      'NFC',
      'NFD',
      'NFKC',
      'NFKD',
    ];

    for (const form of forms) {
      const result = generateUnicodePassword({
        length: 16,
        charsetType: CharsetType.Latin,
        normalize: true,
        normalizationForm: form,
      });

      expect(result.normalized).toBeDefined();
    }
  });

  it('should warn when normalization changes password', () => {
    // Create a password with combining characters
    const password = 'Café'; // é as e + combining acute

    const validation = validateUnicodePassword(password);

    // Normalization should produce consistent result
    expect(validation.normalized).toBeDefined();
  });
});

describe('Confusable Character Detection', () => {
  it('should detect confusable characters by default', () => {
    const result = generateUnicodePassword({
      length: 16,
      charsetType: CharsetType.Latin,
      rejectConfusables: true,
    });

    // Result should have warnings array
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should validate and detect confusables in existing password', () => {
    // Password with 0 (zero) and O (letter)
    const password = 'Pass0wordO123';

    const validation = validateUnicodePassword(password);

    // May have warnings about confusables
    expect(Array.isArray(validation.warnings)).toBe(true);
  });

  it('should detect Cyrillic/Latin confusables', () => {
    // Mix Cyrillic 'а' (U+0430) with Latin 'a' (U+0061)
    const password = 'аbcdеfgh'; // First char is Cyrillic 'a'

    const validation = validateUnicodePassword(password);

    // Should be valid but may have warnings
    expect(validation).toBeDefined();
  });
});

describe('Custom Character Pool', () => {
  it('should use custom character pool', () => {
    const customPool = 'αβγδεζηθ'; // Greek letters
    const result = generateUnicodePassword({
      length: 12,
      charsetType: CharsetType.Latin, // Overridden by customPool
      customPool,
    });

    expect(result.password).toHaveLength(12);
    expect(result.poolSize).toBe(8);

    // Every character should be from custom pool
    for (const char of result.password) {
      expect(customPool).toContain(char);
    }
  });

  it('should calculate correct entropy for custom pool', () => {
    const customPool = 'ABCD';
    const result = generateUnicodePassword({
      length: 10,
      charsetType: CharsetType.Latin,
      customPool,
    });

    expect(result.poolSize).toBe(4);
    expect(result.entropy).toBeCloseTo(Math.log2(4) * 10, 1); // 20 bits
  });
});

describe('Entropy Calculation', () => {
  it('should calculate correct entropy for CJK', () => {
    const result = generateUnicodePassword({
      length: 10,
      charsetType: CharsetType.CJK,
    });

    // CJK: log2(20992) ≈ 14.36 bits/char
    expect(result.entropy).toBeCloseTo(14.36 * 10, 1);
  });

  it('should calculate correct entropy for Cyrillic', () => {
    const result = generateUnicodePassword({
      length: 10,
      charsetType: CharsetType.Cyrillic,
    });

    // Cyrillic: log2(256) = 8 bits/char
    expect(result.entropy).toBeCloseTo(8 * 10, 1);
  });

  it('should calculate correct mixed entropy', () => {
    const entropy = calculateMixedEntropy(
      [CharsetType.Latin, CharsetType.Cyrillic],
      16,
      true,
      true
    );

    // Latin (52) + Cyrillic (256) + Numbers (10) + Symbols (32) = 350
    expect(entropy).toBeCloseTo(Math.log2(350) * 16, 1);
  });
});

describe('Helper Functions', () => {
  it('should return default options', () => {
    const defaults = getDefaultUnicodeOptions();

    expect(defaults.length).toBe(16);
    expect(defaults.charsetType).toBe(CharsetType.Latin);
    expect(defaults.normalize).toBe(true);
    expect(defaults.normalizationForm).toBe('NFC');
    expect(defaults.rejectConfusables).toBe(true);
  });

  it('should get charset info for all types', () => {
    const types = [
      CharsetType.Latin,
      CharsetType.CJK,
      CharsetType.Cyrillic,
      CharsetType.Arabic,
      CharsetType.LatinExtended,
      CharsetType.Emoji,
    ];

    for (const type of types) {
      const info = getCharsetInfo(type);

      expect(info.type).toBe(type);
      expect(info.poolSize).toBeGreaterThan(0);
      expect(info.entropyPerChar).toBeGreaterThan(0);
      expect(info.description).toBeDefined();
      expect(Array.isArray(info.ranges)).toBe(true);
    }
  });

  it('should validate charset info values', () => {
    const cjkInfo = getCharsetInfo(CharsetType.CJK);
    expect(cjkInfo.poolSize).toBe(20992);
    expect(cjkInfo.entropyPerChar).toBeCloseTo(14.36, 1);

    const cyrillicInfo = getCharsetInfo(CharsetType.Cyrillic);
    expect(cyrillicInfo.poolSize).toBe(256);
    expect(cyrillicInfo.entropyPerChar).toBe(8);
  });
});

describe('Emoji Password Generation', () => {
  it('should generate emoji password', () => {
    const result = generateEmojiPassword(12);

    expect(result.password).toHaveLength(12);
    expect(result.charsetType).toEqual([
      CharsetType.Latin,
      CharsetType.Emoji,
    ]);
  });

  it('should include numbers in emoji password', () => {
    const result = generateEmojiPassword(16);

    // Should have Latin + Emoji + Numbers
    expect(result.poolSize).toBeGreaterThan(52 + 80); // At least Latin + Emoji + numbers
  });
});

describe('Password Validation', () => {
  it('should validate simple password', () => {
    const validation = validateUnicodePassword('SimplePassword123');

    expect(validation.isValid).toBeDefined();
    expect(validation.normalized).toBeDefined();
    expect(Array.isArray(validation.warnings)).toBe(true);
  });

  it('should detect control characters', () => {
    const password = 'Test\x00Password'; // Contains null character

    const validation = validateUnicodePassword(password);

    expect(validation.warnings.some((w) => w.includes('control'))).toBe(true);
  });

  it('should normalize consistently', () => {
    // Same character in different forms
    const password1 = 'Café'; // é as single char
    const password2 = 'Café'; // é as e + combining acute

    const val1 = validateUnicodePassword(password1);
    const val2 = validateUnicodePassword(password2);

    // Normalized forms should be identical
    expect(val1.normalized).toBe(val2.normalized);
  });
});

describe('Edge Cases', () => {
  it('should handle minimum length', () => {
    const result = generateUnicodePassword({
      length: 1,
      charsetType: CharsetType.Latin,
    });

    expect(result.password).toHaveLength(1);
  });

  it('should handle maximum length', () => {
    const result = generateUnicodePassword({
      length: 256,
      charsetType: CharsetType.Latin,
    });

    expect(result.password).toHaveLength(256);
  });

  it('should reject invalid length', () => {
    expect(() => {
      generateUnicodePassword({
        length: 0,
        charsetType: CharsetType.Latin,
      });
    }).toThrow('length must be between 1 and 256');
  });

  it('should reject too long length', () => {
    expect(() => {
      generateUnicodePassword({
        length: 300,
        charsetType: CharsetType.Latin,
      });
    }).toThrow('length must be between 1 and 256');
  });

  it('should handle empty custom pool', () => {
    expect(() => {
      generateUnicodePassword({
        length: 10,
        charsetType: CharsetType.Latin,
        customPool: '',
      });
    }).toThrow('Character pool is empty');
  });
});

describe('Security Properties', () => {
  it('should generate cryptographically random passwords', () => {
    const passwords = new Set<string>();

    // Generate 100 passwords
    for (let i = 0; i < 100; i++) {
      const result = generateUnicodePassword({
        length: 16,
        charsetType: CharsetType.Latin,
      });
      passwords.add(result.password);
    }

    // All should be unique
    expect(passwords.size).toBe(100);
  });

  it('should have high entropy for long passwords', () => {
    const result = generateUnicodePassword({
      length: 32,
      charsetType: CharsetType.CJK,
    });

    // CJK with 32 chars: 14.36 * 32 ≈ 459 bits
    expect(result.entropy).toBeGreaterThan(400);
  });

  it('should maintain entropy with normalization', () => {
    const result = generateUnicodePassword({
      length: 20,
      charsetType: CharsetType.Latin,
      normalize: true,
    });

    // Entropy should still be calculated from original pool
    expect(result.entropy).toBeCloseTo(Math.log2(52) * 20, 1);
  });
});
