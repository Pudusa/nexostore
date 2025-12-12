// src/lib/cache.ts

/**
 * Cache configuration and helper functions for Next.js frontend
 */

// Cache configuration
export const CACHE_CONFIG = {
  // Time-to-live values in seconds
  PRODUCTS_TTL: 300, // 5 minutes
  PRODUCT_TTL: 600,  // 10 minutes
  RATINGS_TTL: 300,  // 5 minutes
  USER_TTL: 900,     // 15 minutes
  
  // Cache keys
  PRODUCTS_KEY: 'products',
  PRODUCT_KEY: 'product',
  RATINGS_KEY: 'ratings',
  USER_KEY: 'user',
};

// In-memory cache for client-side (for SSR, server cache is handled by backend)
const inMemoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Get item from cache
 */
export const getFromCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') {
    // Server-side - rely on backend caching
    return null;
  }
  
  const cached = inMemoryCache.get(key);
  if (!cached) return null;
  
  // Check if cache is expired
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl * 1000) {
    inMemoryCache.delete(key);
    return null;
  }
  
  return cached.data as T;
};

/**
 * Set item in cache
 */
export const setInCache = <T>(key: string, data: T, ttl: number = CACHE_CONFIG.PRODUCTS_TTL): void => {
  if (typeof window === 'undefined') {
    // Server-side - rely on backend caching
    return;
  }
  
  inMemoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

/**
 * Delete item from cache
 */
export const deleteFromCache = (key: string): void => {
  inMemoryCache.delete(key);
};

/**
 * Delete multiple keys from cache by pattern
 */
export const deleteFromCacheByPattern = (pattern: string): void => {
  const keysToDelete: string[] = [];

  inMemoryCache.forEach((value, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => inMemoryCache.delete(key));
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  inMemoryCache.clear();
};

/**
 * Clear all cache
 */
export const clearCache = (): void => {
  inMemoryCache.clear();
};

/**
 * Generate cache key for products
 */
export const generateProductsCacheKey = (params?: any): string => {
  const baseKey = CACHE_CONFIG.PRODUCTS_KEY;
  if (!params) return baseKey;
  
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  return `${baseKey}:${queryString}`;
};