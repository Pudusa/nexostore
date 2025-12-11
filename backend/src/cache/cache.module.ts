import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { RedisClientService } from './redis-client.service';
import { CacheService } from './cache.service';

@Module({
  imports: [
    ConfigModule, // Importar el módulo de configuración para asegurar que las variables de entorno estén disponibles
    NestCacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        // With RedisClientService handling all Upstash Redis operations,
        // we can use memory cache for standard cache operations
        // but the RedisClientService will handle direct Redis operations
        console.log('Configured with Upstash Redis (through RedisClientService)');
        return {
          store: 'memory', // Use memory for standard cache operations
          ttl: 600, // 10 minutes by default
          isCacheableValue: (value: any) => value !== null && value !== undefined,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisClientService, CacheService],
  exports: [NestCacheModule, RedisClientService, CacheService],
})
export class RedisCacheModule {}