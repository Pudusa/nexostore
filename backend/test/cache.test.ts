// backend/test/cache.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../src/cache/cache.service';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma.service';
import { SupabaseService } from '../src/supabase/supabase.service';
import { Redis } from 'ioredis';

describe('Cache Service', () => {
  let cacheService: CacheService;

  beforeAll(() => {
    // Mock Redis connection for testing
    jest.mock('ioredis');
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  it('should set and get a value from cache', async () => {
    const key = 'test-key';
    const value = { id: 1, name: 'Test Product' };
    
    await cacheService.set(key, value, 300); // 5 minutes TTL
    const result = await cacheService.get(key);
    
    expect(result).toEqual(value);
  });

  it('should delete a value from cache', async () => {
    const key = 'test-key-delete';
    const value = { id: 1, name: 'Test Product to Delete' };
    
    await cacheService.set(key, value);
    const existsBefore = await cacheService.has(key);
    expect(existsBefore).toBe(true);
    
    const result = await cacheService.del(key);
    expect(result).toBe(true);
    
    const existsAfter = await cacheService.has(key);
    expect(existsAfter).toBe(false);
  });

  it('should delete multiple keys by pattern', async () => {
    const key1 = 'test:product:1';
    const key2 = 'test:product:2';
    const value = { id: 1, name: 'Test Product' };
    
    await cacheService.set(key1, value);
    await cacheService.set(key2, value);
    
    const deletedCount = await cacheService.delByPattern('test:product:*');
    expect(deletedCount).toBeGreaterThanOrEqual(2);
  });
});