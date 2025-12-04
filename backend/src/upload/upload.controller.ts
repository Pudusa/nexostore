import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  InternalServerErrorException,
  Logger, // Importamos el Logger
  Body,
  UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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

      const uploadedImages = await Promise.all(uploadPromises);

      // Log para ver las URLs que se generaron antes de enviarlas
      this.logger.log(
        `[UPLOAD SUCCESS] Generated image data: ${JSON.stringify(
          uploadedImages,
        )}`,
      );

      return { uploadedImages };
    } catch (error) {
      // Log en caso de error
      this.logger.error(
        `[UPLOAD FAILED] Error during upload process: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to upload files: ${error.message}`,
      );
    }
  }

  @Post('delete-images')
  async deleteImages(@Body('imageUrls') imageUrls: string[]) {
    this.logger.log(`[DELETE START] Received request to delete ${imageUrls?.length ?? 0} images.`);

    if (!imageUrls || imageUrls.length === 0) {
      this.logger.warn('[DELETE WARN] No image URLs were provided in the request.');
      // No lanzamos un error, simplemente no hacemos nada.
      return { message: 'No images to delete.' };
    }

    try {
      await this.supabaseService.deleteFiles(imageUrls);
      this.logger.log(`[DELETE SUCCESS] Successfully deleted images.`);
      return { message: 'Images deleted successfully.' };
    } catch (error) {
      this.logger.error(`[DELETE FAILED] Error during deletion process: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete images: ${error.message}`);
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`[AVATAR UPLOAD START] Received request for avatar upload.`);

    if (!file) {
      this.logger.warn('[AVATAR UPLOAD WARN] No file was provided.');
      throw new InternalServerErrorException('No file provided for upload.');
    }

    try {
      this.logger.debug(`[AVATAR UPLOAD PROCESS] Processing file: ${file.originalname}`);
      const uploadedImage = await this.supabaseService.uploadFile(file);
      this.logger.log(`[AVATAR UPLOAD SUCCESS] Generated image data: ${JSON.stringify(uploadedImage)}`);
      return uploadedImage;
    } catch (error) {
      this.logger.error(`[AVATAR UPLOAD FAILED] Error during upload: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to upload avatar: ${error.message}`);
    }
  }
}