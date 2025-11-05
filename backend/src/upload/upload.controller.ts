import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  InternalServerErrorException,
  Logger, // Importamos el Logger
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('upload')
export class UploadController {
  // Creamos una instancia del logger para este controlador
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    // Log para saber cuándo entra la petición y con cuántos archivos
    this.logger.log(`[UPLOAD START] Received request with ${files?.length ?? 0} files.`);

    if (!files || files.length === 0) {
      this.logger.warn('[UPLOAD WARN] No files were provided in the request.');
      throw new InternalServerErrorException('No files provided for upload.');
    }

    try {
      const uploadPromises = files.map(file => {
        this.logger.debug(`[UPLOAD PROCESS] Processing file: ${file.originalname}`);
        return this.supabaseService.uploadFile(file);
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Log para ver las URLs que se generaron antes de enviarlas
      this.logger.log(`[UPLOAD SUCCESS] Generated URLs: ${JSON.stringify(imageUrls)}`);

      return { imageUrls };
    } catch (error) {
      // Log en caso de error
      this.logger.error(`[UPLOAD FAILED] Error during upload process: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to upload files: ${error.message}`);
    }
  }
}