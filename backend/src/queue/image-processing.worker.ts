import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessingJobData {
  originalFileName: string;
  fileBuffer: Buffer;
  originalName: string;
  bucket?: string;
}

@Injectable()
export class ImageProcessingWorker implements OnModuleInit {
  private readonly logger = new Logger(ImageProcessingWorker.name);
  private worker: Worker;

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {
    // Use Upstash Redis configuration
    const upstashUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const upstashToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!upstashUrl || !upstashToken) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured for BullMQ workers');
    }

    let connection: Redis;
    try {
      const url = new URL(upstashUrl);
      const hostname = url.hostname;
      const port = parseInt(url.port || '6379');

      // Configure Redis for Upstash with TLS
      connection = new Redis({
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

    this.worker = new Worker(
      'image-processing',
      async (job: Job<ImageProcessingJobData>) => {
        this.logger.log(`Procesando imagen: ${job.data.originalName}`);

        // Procesar la imagen con Sharp
        const optimizedBuffer = await sharp(job.data.fileBuffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const fileName = `${uuidv4()}.webp`;
        const bucket = job.data.bucket || 'product-images';

        // Subir a Supabase
        const result = await this.supabaseService.uploadFileFromBuffer(
          optimizedBuffer,
          fileName,
          bucket,
          'image/webp',
        );

        this.logger.log(`Imagen procesada y subida: ${result.publicUrl}`);

        return {
          originalFileName: job.data.originalFileName,
          publicUrl: result.publicUrl,
          fileName: fileName,
        };
      },
      {
        connection,
        concurrency: 5, // Procesar hasta 5 imágenes simultáneamente
        limiter: {
          max: 10,      // máximo 10 trabajos por intervalo
          duration: 30000, // cada 30 segundos
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Trabajo completado: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Trabajo fallido: ${job?.id || 'unknown'}`, err);
    });
  }

  async onModuleInit() {
    // El worker comienza a procesar trabajos automáticamente
  }

  async close() {
    await this.worker.close();
  }
}