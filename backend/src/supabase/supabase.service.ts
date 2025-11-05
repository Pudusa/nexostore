import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucketName = "product-images";
    const fileExtension = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    const { error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error uploading file to Supabase: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
