import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import sharp from 'sharp';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new InternalServerErrorException(
        'Supabase URL or Service Role Key is not configured in environment variables.',
      );
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string = 'product-images',
  ): Promise<{ originalname: string; publicUrl: string }> {
    // Optimizar la imagen con sharp
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${uuidv4()}.webp`; // Cambiar extensión a webp

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp', // Cambiar mimetype a webp
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error uploading file to Supabase: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      originalname: file.originalname,
      publicUrl: data.publicUrl,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const bucketName = "product-images";
    // Extraer el nombre del archivo de la URL. La URL pública de Supabase tiene el formato:
    // .../storage/v1/object/public/bucket-name/file-name.ext
    const fileName = fileUrl.split('/').pop();

    if (!fileName) {
      throw new InternalServerErrorException('Invalid file URL provided.');
    }

    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      // No lanzar un error si el archivo no se encuentra (código '404'),
      // ya que podría haber sido eliminado previamente.
      if (error.message.includes('404')) {
        console.warn(`File not found in Supabase storage, skipping deletion: ${fileName}`);
      } else {
        throw new InternalServerErrorException(
          `Error deleting file from Supabase: ${error.message}`,
        );
      }
    }
  }

  async deleteFiles(fileUrls: string[]): Promise<void> {
    const bucketName = "product-images";
    const fileNames = fileUrls.map(url => {
      const name = url.split('/').pop();
      if (!name) {
        // Log a warning but don't throw an error to allow other valid URLs to be processed.
        console.warn(`Could not extract file name from URL: ${url}`);
        return null;
      }
      return name;
    }).filter((name): name is string => name !== null); // Filter out any nulls

    if (fileNames.length === 0) {
      return; // No valid file names to delete
    }

    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove(fileNames);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting files from Supabase: ${error.message}`,
      );
    }
  }
}
