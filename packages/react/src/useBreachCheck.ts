/**
 * React Hook: useBreachCheck
 * 
 * Provides password breach checking with caching support
 * 
 * @example
 * ```tsx
 * function PasswordValidator() {
 *   const [password, setPassword] = useState('');
 *   const { breached, loading, check } = useBreachCheck();
 * 
 *   useEffect(() => {
 *     if (password) {
 *       check(password);
 *     }
 *   }, [password, check]);
 * 
 *   return (
 *     <div>
 *       <input 
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *       {breached && (
 *         <p>⚠️ This password has been breached!</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import {
  checkPasswordBreach,
  type BreachResult
} from 'password-tools';

/**
 * Options for useBreachCheck hook
 */
export interface UseBreachCheckOptions {
  /** Allow network requests (default: true) */
  allowNetwork?: boolean;
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Auto-check on password change (default: false) */
  autoCheck?: boolean;
  /** Debounce delay in milliseconds (default: 500) */
  debounce?: number;
}

/**
 * Result from useBreachCheck hook
 */
export interface UseBreachCheckResult {
  /** Breach check result */
  result: BreachResult | null;
  /** Loading state during check */
  loading: boolean;
  /** Error during check if any */
  error: Error | null;
  /** Whether password is breached */
  breached: boolean | null;
  /** Number of times password found in breaches */
  count: number | null;
  /** Check password for breaches */
  check: (password: string) => Promise<BreachResult>;
  /** Clear check results */
  clear: () => void;
}

/**
 * React hook for password breach checking
 * 
 * Checks passwords against Have I Been Pwned database using k-Anonymity.
 * Results are cached for 24 hours for performance.
 * 
 * @param options - Configuration options
 * @returns Breach check state and actions
 * 
 * @example
 * ```tsx
 * function SignupForm() {
 *   const [password, setPassword] = useState('');
 *   const { breached, loading, check } = useBreachCheck();
 * 
 *   const handleSubmit = async () => {
 *     const result = await check(password);
 *     if (result.breached) {
 *       alert('Password has been breached!');
 *       return;
 *     }
 *     // Proceed with signup
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input 
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *       <button disabled={loading}>Sign Up</button>
 *     </form>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Offline-only mode
 * const { check } = useBreachCheck({ 
 *   allowNetwork: false 
 * });
 * ```
 */
export function useBreachCheck(
  options: UseBreachCheckOptions = {}
): UseBreachCheckResult {
  const {
    allowNetwork = true,
    timeout = 5000,
  } = options;

  const [result, setResult] = useState<BreachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cancelledRef = useRef(false);

  const check = useCallback(
    async (password: string): Promise<BreachResult> => {
      if (!password) {
        const emptyResult: BreachResult = {
          checked: false,
          breached: null,
        };
        setResult(emptyResult);
        return emptyResult;
      }

      cancelledRef.current = false;
      setLoading(true);
      setError(null);

      try {
        const checkResult = await checkPasswordBreach(password, {
          allowNetwork,
          timeout,
        });

        if (!cancelledRef.current) {
          setResult(checkResult);
          setLoading(false);
        }

        return checkResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (!cancelledRef.current) {
          setError(error);
          setLoading(false);
        }

        throw error;
      }
    },
    [allowNetwork, timeout]
  );

  const clear = useCallback(() => {
    cancelledRef.current = true;
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    result,
    loading,
    error,
    breached: result?.breached ?? null,
    count: result?.count ?? null,
    check,
    clear,
  };
}
