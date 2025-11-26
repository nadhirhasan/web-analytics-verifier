/**
 * Simple in-memory cache with TTL (Time To Live) support
 * Used to cache GA4 API responses and reduce redundant API calls
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTLMinutes: number = 5) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Get value from cache if it exists and hasn't expired
   * @param key Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMinutes Optional TTL in minutes (defaults to constructor value)
   */
  set<T>(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  /**
   * Check if key exists and is not expired
   * @param key Cache key
   * @returns true if key exists and valid, false otherwise
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific key from cache
   * @param key Cache key to clear
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Object with cache size and entry details
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalSize: this.cache.size,
      validEntries,
      expiredEntries,
    };
  }

  /**
   * Remove all expired entries from cache
   * @returns Number of entries removed
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    });

    return removed;
  }
}

// Export singleton instance
export const metricsCache = new MemoryCache(5); // 5 minute default TTL

// Export class for testing or custom instances
export default MemoryCache;
