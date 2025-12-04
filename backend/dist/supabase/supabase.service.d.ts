export declare class SupabaseService {
    private supabase;
    constructor();
    uploadFile(file: Express.Multer.File, bucket?: string): Promise<{
        originalname: string;
        publicUrl: string;
    }>;
    deleteFile(fileUrl: string): Promise<void>;
    deleteFiles(fileUrls: string[]): Promise<void>;
}
