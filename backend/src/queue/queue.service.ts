import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

export interface ImageProcessingJobData {
  originalFileName: string;
  fileBuffer: Buffer;
  originalName: string;
  bucket?: string;
}

export interface ImageProcessingResult {
  originalFileName: string;
  publicUrl: string;
  fileName: string;
}

@Injectable()
export class QueueService implements OnModuleInit {
  private redisConnection: Redis;
  public imageProcessingQueue: Queue;
  public queueEvents: QueueEvents;

  constructor(private configService: ConfigService) {
    // Use Upstash Redis configuration
    const upstashUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const upstashToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!upstashUrl || !upstashToken) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured for BullMQ');
    }

    try {
      const url = new URL(upstashUrl);
      const hostname = url.hostname;
      const port = parseInt(url.port || '6379');

      // Configure Redis for Upstash with TLS
      this.redisConnection = new Redis({
        host: hostname,
        port: port,
        username: 'default',
        password: upstashToken,
        tls: {},
        maxRetriesPerRequest: null, // Required for BullMQ
      });
    } catch (error) {
      throw new Error(`Error configuring Upstash Redis: ${error.message}`);
    }

    this.imageProcessingQueue = new Queue('image-processing', {
      connection: this.redisConnection,
    });
    this.queueEvents = new QueueEvents('image-processing', {
      connection: this.redisConnection,
    });
  }

  async onModuleInit() {
    // No es necesario inicializar nada aquí, pero mantengo el método por si se necesita
  }

  async addImageProcessingJob(data: ImageProcessingJobData) {
    return await this.imageProcessingQueue.add('process-image', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async addImageProcessingJobAndWait(data: ImageProcessingJobData, timeoutMs: number = 10000): Promise<ImageProcessingResult> {
    // Crear un trabajo y esperar su resultado con timeout
    const job = await this.imageProcessingQueue.add('process-image', data, {
      attempts: 1, // Solo un intento para la espera síncrona
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    // Esperar el resultado del trabajo con timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Processing timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      // Escuchar eventos del trabajo
      const checkJobStatus = async () => {
        const updatedJob = await Job.fromId(this.imageProcessingQueue, job.id!); // Aseguramos que el ID no es undefined
        if (updatedJob) {
          const isCompleted = await updatedJob.isCompleted();
          const isFailed = await updatedJob.isFailed();

          if (isCompleted) {
            clearTimeout(timeout);
            resolve(updatedJob.returnvalue as ImageProcessingResult);
          } else if (isFailed) {
            clearTimeout(timeout);
            reject(new Error(`Job failed: ${updatedJob.failedReason}`));
          } else {
            // Si el trabajo aún no ha terminado, revisar de nuevo en un poco
            setTimeout(checkJobStatus, 100);
          }
        } else {
          // Si no se puede encontrar el trabajo, probablemente ocurrió un error
          clearTimeout(timeout);
          reject(new Error('Job not found'));
        }
      };

      checkJobStatus();
    });
  }

  getQueue() {
    return this.imageProcessingQueue;
  }

  getRedisConnection() {
    return this.redisConnection;
  }

  async close() {
    await this.queueEvents.close();
    await this.imageProcessingQueue.close();
    await this.redisConnection.quit();
  }
}