import { Injectable, Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisClientService {
  private readonly logger = new Logger(RedisClientService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {
    // Use only Upstash Redis configuration (require Upstash configuration)
    const upstashUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const upstashToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!upstashUrl || !upstashToken) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured for Redis operations');
    }

    // Extract hostname and port from Upstash URL
    try {
      const url = new URL(upstashUrl);
      const hostname = url.hostname;
      const port = parseInt(url.port || '6379');

      // Connect to Upstash using ioredis over TLS
      this.client = new Redis({
        host: hostname,
        port: port,
        username: 'default',  // Upstash often uses 'default' as username
        password: upstashToken,
        tls: {},  // Enable TLS for secure connection to Upstash
        lazyConnect: true,
        maxRetriesPerRequest: null, // Required for BullMQ compatibility
      });

      this.logger.log('Connected to Upstash Redis');
    } catch (error) {
      this.logger.error('Error parsing Upstash URL:', error);
      throw new Error(`Error configuring Upstash Redis: ${error.message}`);
    }

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Upstash Redis');
    });

    this.client.on('ready', () => {
      this.logger.log('Upstash Redis is ready');
    });
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.client.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key '${key}':`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache key '${key}':`, error);
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting cache key '${key}':`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in cache
   */
  async has(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key '${key}':`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        const result = await this.client.del(...keys);
        this.logger.log(`Deleted ${result} keys matching pattern: ${pattern}`);
        return result;
      }
      return 0;
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern '${pattern}':`, error);
      return 0;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys by pattern '${pattern}':`, error);
      return [];
    }
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<boolean> {
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      this.logger.error('Error flushing cache:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      this.logger.error('Error getting Redis info:', error);
      return '';
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }
}