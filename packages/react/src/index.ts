/**
 * password-tools-react
 *
 * React hooks for password generation and strength analysis
 *
 * @packageDocumentation
 */

export { 
  usePasswordGenerator,
  type UsePasswordGeneratorResult 
} from './usePasswordGenerator';

export { 
  usePasswordStrength,
  type UsePasswordStrengthOptions,
  type UsePasswordStrengthResult 
} from './usePasswordStrength';

export { 
  usePassphraseGenerator,
  type UsePassphraseGeneratorResult 
} from './usePassphraseGenerator';

export { 
  useBreachCheck,
  type UseBreachCheckOptions,
  type UseBreachCheckResult 
} from './useBreachCheck';

// Re-export types from core package for convenience
export type {
  PasswordGeneratorOptions,
  GeneratedPassword,
  PassphraseOptions,
  PasswordStrengthResult,
  BreachResult,
} from 'password-tools';
