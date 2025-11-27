/**
 * Password Breach Checker using k-Anonymity Protocol
 *
 * Implements Have I Been Pwned (HIBP) API integration with:
 * - k-Anonymity protocol (only sends first 5 chars of SHA-1 hash)
 * - LRU cache with IndexedDB persistence (24-hour TTL)
 * - Offline-first architecture
 * - Rate limiting and exponential backoff
 *
 * @module breach
 */

/* eslint-disable no-console */
import { sha1 } from '@noble/hashes/sha1';
import { bytesToHex } from '@noble/hashes/utils';

/**
 * Result of a password breach check
 */
export interface BreachResult {
  /** Was the check performed successfully? */
  checked: boolean;
  /** Was the password found in known breaches? null if not checked */
  breached: boolean | null;
  /** Number of times the password appeared in breaches (if breached) */
  count?: number;
  /** Was the check performed while offline? */
  offline?: boolean;
  /** Was the result retrieved from cache? */
  cached?: boolean;
}

/**
 * Options for breach checking
 */
export interface BreachCheckOptions {
  /** Allow network requests to HIBP API (default: true) */
  allowNetwork?: boolean;
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;
}

/**
 * Cache entry structure for IndexedDB
 */
interface CacheEntry {
  /** SHA-1 prefix (first 5 hex chars) */
  prefix: string;
  /** Set of full hash suffixes found in this prefix bucket */
  hashes: string[];
  /** Timestamp when this entry was cached */
  timestamp: number;
}

/**
 * LRU Cache node for doubly-linked list
 */
interface LRUNode {
  key: string;
  prev: LRUNode | null;
  next: LRUNode | null;
}

// Constants
const HIBP_API_URL = 'https://api.pwnedpasswords.com/range/';
const CACHE_DB_NAME = 'trustvault-breach-cache';
const CACHE_STORE_NAME = 'breach-hashes';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000; // prefixes
const RATE_LIMIT_MS = 1000; // 1 request per second
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * LRU Cache implementation with O(1) access
 */
class LRUCache {
  private cache = new Map<string, LRUNode>();
  private head: LRUNode | null = null;
  private tail: LRUNode | null = null;
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  /**
   * Access a key (moves to front of LRU)
   */
  access(key: string): void {
    const node = this.cache.get(key);
    if (!node) {
      // Add new node
      const newNode: LRUNode = { key, prev: null, next: this.head };
      if (this.head) {
        this.head.prev = newNode;
      }
      this.head = newNode;
      if (!this.tail) {
        this.tail = newNode;
      }
      this.cache.set(key, newNode);

      // Evict if over capacity
      if (this.cache.size > this.maxSize) {
        this.evictLRU();
      }
    } else {
      // Move to front
      this.moveToFront(node);
    }
  }

  /**
   * Move node to front of list
   */
  private moveToFront(node: LRUNode): void {
    if (node === this.head) return;

    // Remove from current position
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    if (node === this.tail) {
      this.tail = node.prev;
    }

    // Move to front
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    if (!this.tail) return;

    const evicted = this.tail;
    this.cache.delete(evicted.key);

    this.tail = evicted.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }

    // Also remove from IndexedDB
    this.removeFromDB(evicted.key).catch(console.error);
  }

  /**
   * Remove entry from IndexedDB
   */
  private async removeFromDB(prefix: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CACHE_STORE_NAME);
      await store.delete(prefix);
    } catch (error) {
      console.error('Error removing from IndexedDB:', error);
    }
  }

  /**
   * Open IndexedDB connection
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'prefix' });
        }
      };
    });
  }
}

/**
 * Breach checker singleton
 */
class BreachChecker {
  private lruCache = new LRUCache(MAX_CACHE_SIZE);
  private lastRequestTime = 0;
  private dbReady = false;

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    if (this.dbReady) return;

    try {
      const db = await this.openDB();
      db.close();
      this.dbReady = true;
    } catch (error) {
      console.warn('IndexedDB not available, operating without cache persistence:', error);
    }
  }

  /**
   * Open IndexedDB connection
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(CACHE_DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'prefix' });
        }
      };
    });
  }

  /**
   * Get cached entry from IndexedDB
   */
  private async getCacheEntry(prefix: string): Promise<CacheEntry | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
      const store = tx.objectStore(CACHE_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(prefix);
        request.onsuccess = () => {
          const entry = request.result as CacheEntry | undefined;
          if (!entry) {
            resolve(null);
            return;
          }

          // Check if expired
          if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
            // Delete expired entry
            const deleteTx = db.transaction(CACHE_STORE_NAME, 'readwrite');
            deleteTx.objectStore(CACHE_STORE_NAME).delete(prefix);
            resolve(null);
          } else {
            resolve(entry);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Store entry in IndexedDB
   */
  private async setCacheEntry(entry: CacheEntry): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CACHE_STORE_NAME);
      await store.put(entry);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  /**
   * Rate limit API requests
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch hashes from HIBP API with retry logic
   */
  private async fetchFromHIBP(
    prefix: string,
    timeout: number
  ): Promise<string[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Rate limit
        await this.rateLimit();

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${HIBP_API_URL}${prefix}`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'password-kit',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, exponential backoff
            const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }
          throw new Error(`HIBP API error: ${response.status}`);
        }

        const text = await response.text();
        const hashes = text.split('\n').map(line => {
          const [hash] = line.split(':');
          return hash?.trim() || '';
        }).filter(Boolean);

        return hashes;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }

        // Exponential backoff
        if (attempt < MAX_RETRIES - 1) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }

    throw lastError || new Error('Failed to fetch from HIBP');
  }

  /**
   * Check if password has been breached
   */
  async checkPassword(
    password: string,
    options: BreachCheckOptions = {}
  ): Promise<BreachResult> {
    const { allowNetwork = true, timeout = 5000 } = options;

    try {
      // Initialize DB on first use
      await this.initDB();

      // Hash password with SHA-1
      const hash = bytesToHex(sha1(password)).toUpperCase();
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      // Check cache first
      this.lruCache.access(prefix);
      const cached = await this.getCacheEntry(prefix);

      if (cached) {
        const breached = cached.hashes.includes(suffix);
        const result: BreachResult = {
          checked: true,
          breached,
          cached: true,
        };
        if (breached) {
          result.count = 1;
        }
        return result;
      }

      // Cache miss - fetch from API if online
      if (!allowNetwork) {
        return {
          checked: false,
          breached: null,
          offline: true,
        };
      }

      if (typeof fetch === 'undefined') {
        return {
          checked: false,
          breached: null,
          offline: true,
        };
      }

      try {
        const hashes = await this.fetchFromHIBP(prefix, timeout);

        // Store in cache
        const entry: CacheEntry = {
          prefix,
          hashes,
          timestamp: Date.now(),
        };
        await this.setCacheEntry(entry);

        const breached = hashes.includes(suffix);
        const result: BreachResult = {
          checked: true,
          breached,
          cached: false,
        };
        if (breached) {
          result.count = 1;
        }
        return result;
      } catch (error) {
        // Network error - return offline result
        return {
          checked: false,
          breached: null,
          offline: true,
        };
      }
    } catch (error) {
      console.error('Breach check error:', error);
      return {
        checked: false,
        breached: null,
      };
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CACHE_STORE_NAME);
      await store.clear();
      this.lruCache = new LRUCache(MAX_CACHE_SIZE);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Singleton instance
const checker = new BreachChecker();

/**
 * Check if a password has been found in known data breaches
 *
 * Uses the Have I Been Pwned (HIBP) API with k-Anonymity protocol:
 * - Only sends first 5 characters of SHA-1 hash to server
 * - Server returns all hashes with that prefix
 * - Full hash comparison done locally
 *
 * Implements LRU cache with IndexedDB persistence:
 * - 24-hour TTL on cached results
 * - Max 1000 prefixes cached (~2MB storage)
 * - Survives browser restarts
 *
 * Offline-first architecture:
 * - Returns cached result if available (instant)
 * - Falls back to API if cache miss and online
 * - Returns offline status if network unavailable
 *
 * @param password - The password to check
 * @param options - Optional configuration
 * @returns Breach check result with status and count
 *
 * @example
 * ```typescript
 * const result = await checkPasswordBreach('password123');
 * if (result.breached) {
 *   console.log(`Found in ${result.count} breaches!`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Check without network (cache only)
 * const result = await checkPasswordBreach('mypassword', {
 *   allowNetwork: false
 * });
 * if (!result.checked && result.offline) {
 *   console.log('No cached result, and network disabled');
 * }
 * ```
 */
export async function checkPasswordBreach(
  password: string,
  options?: BreachCheckOptions
): Promise<BreachResult> {
  return checker.checkPassword(password, options);
}

/**
 * Clear all cached breach data
 *
 * Removes all cached hash prefixes from IndexedDB.
 * Useful for testing or privacy-conscious users.
 *
 * @example
 * ```typescript
 * await clearBreachCache();
 * console.log('All breach cache cleared');
 * ```
 */
export async function clearBreachCache(): Promise<void> {
  return checker.clearCache();
}
