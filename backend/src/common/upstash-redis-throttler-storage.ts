import { ThrottlerStorage } from '@nestjs/throttler';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToLive: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class UpstashRedisThrottlerStorage implements ThrottlerStorage {
  private readonly redisUrl: string;
  private readonly redisToken: string;
  private readonly logger = new Logger(UpstashRedisThrottlerStorage.name);

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    if (!redisUrl) {
      throw new Error('UPSTASH_REDIS_REST_URL is not defined in the configuration.');
    }
    this.redisUrl = redisUrl;

    const redisToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
    if (!redisToken) {
      throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined in the configuration.');
    }
    this.redisToken = redisToken;

    if (!this.redisUrl || !this.redisToken) {
      this.logger.error('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not defined.');
      throw new Error('Upstash Redis configuration missing.');
    }
  }

  private async sendCommand(command: string, ...args: (string | number)[]) {
    const response = await fetch(this.redisUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.redisToken}`,
      },
      body: JSON.stringify([command, ...args]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Upstash Redis command failed: ${command} ${args.join(' ')}, Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`Upstash Redis command failed: ${errorText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async getRecord(key: string): Promise<number[]> {
    const rawRecord = await this.sendCommand('LRANGE', key, 0, -1);
    
    // Upstash LRange devuelve un array de strings. Necesitamos parsearlos a números.
    const record = (rawRecord || []).map(Number);

    return record.filter(t => t > Date.now() / 1000); // Filtrar marcas de tiempo expiradas
  }

  async addRecord(key: string, ttl: number): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000); // Timestamp en segundos
    await this.sendCommand('RPUSH', key, timestamp);
    await this.sendCommand('EXPIRE', key, ttl); // Establecer el TTL para toda la lista
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const now = Date.now();
    const expirationTime = now + ttl * 1000;

    // 1. Añadir la marca de tiempo actual al final de la lista
    await this.sendCommand('RPUSH', key, now);
    // 2. Eliminar las marcas de tiempo que ya han expirado
    await this.sendCommand('LREM', key, 0, (now - ttl * 1000));
    // 3. Establecer el TTL para la clave si no existe o actualizarla
    await this.sendCommand('EXPIRE', key, ttl);

    // 4. Obtener el número actual de hits
    const totalHits = await this.sendCommand('LLEN', key);

    const timeToLive = Math.max(0, Math.ceil((expirationTime - now) / 1000));

    const isBlocked = totalHits >= limit;
    let timeToBlockExpire = 0;

    if (isBlocked && blockDuration > 0) {
      const blockExpiration = now + blockDuration * 1000;
      timeToBlockExpire = Math.max(0, Math.ceil((blockExpiration - now) / 1000));
    }

    return {
      totalHits,
      timeToLive,
      timeToExpire: timeToLive,
      isBlocked,
      timeToBlockExpire,
    };
  }
}
