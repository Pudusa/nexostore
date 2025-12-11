import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ImageProcessingWorker } from './image-processing.worker';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [QueueService, ImageProcessingWorker, SupabaseService],
  exports: [QueueService, ImageProcessingWorker],
})
export class QueueModule {}