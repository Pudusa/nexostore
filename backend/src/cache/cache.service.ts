import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { RedisClientService } from './redis-client.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private redisClientService: RedisClientService,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      // Try to get from Redis first
      if (this.redisClientService) {
        const result = await this.redisClientService.get<T>(key);
        if (result !== null) {
          return result;
        }
      }

      // Fallback to memory cache
      return await this.cacheManager.get(key);
    } catch (error) {
      this.logger.warn(`Error getting cache key ${key}: ${error.message}`);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      // Set in Redis
      if (this.redisClientService) {
        await this.redisClientService.set(key, value, ttl || 600); // default to 10 minutes if no TTL
      }

      // Also set in memory cache for fallback
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Error setting cache key ${key}: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      // Delete from Redis
      if (this.redisClientService) {
        await this.redisClientService.del(key);
      }

      // Also delete from memory cache
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(`Error deleting cache key ${key}: ${error.message}`);
    }
  }

  // Método para borrar por patrón - usa RedisClientService
  async delByPattern(pattern: string): Promise<void> {
    try {
      if (this.redisClientService) {
        await this.redisClientService.delByPattern(pattern);
      } else {
        this.logger.warn(`RedisClientService not available for pattern deletion: ${pattern}`);
      }
    } catch (error) {
      this.logger.warn(`Error deleting cache by pattern ${pattern}: ${error.message}`);
    }
  }
}