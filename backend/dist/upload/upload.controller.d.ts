import { SupabaseService } from '../supabase/supabase.service';
export declare class UploadController {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    uploadFiles(files: Array<Express.Multer.File>): Promise<{
        uploadedImages: {
            originalname: string;
            publicUrl: string;
        }[];
    }>;
    deleteImages(imageUrls: string[]): Promise<{
        message: string;
    }>;
    uploadAvatar(file: Express.Multer.File): Promise<{
        originalname: string;
        publicUrl: string;
    }>;
}
