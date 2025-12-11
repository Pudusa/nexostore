import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ImageProcessingWorker } from './image-processing.worker';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [QueueService, ImageProcessingWorker],
  exports: [QueueService, ImageProcessingWorker],
})
export class QueueModule {}