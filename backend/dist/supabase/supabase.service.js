"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
const path_1 = require("path");
let SupabaseService = class SupabaseService {
    supabase;
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new common_1.InternalServerErrorException('Supabase URL or Service Role Key is not configured in environment variables.');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async uploadFile(file, bucket = 'product-images') {
        const fileExtension = (0, path_1.extname)(file.originalname);
        const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
        const { error } = await this.supabase.storage
            .from(bucket)
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            throw new common_1.InternalServerErrorException(`Error uploading file to Supabase: ${error.message}`);
        }
        const { data } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);
        return {
            originalname: file.originalname,
            publicUrl: data.publicUrl,
        };
    }
    async deleteFile(fileUrl) {
        const bucketName = "product-images";
        const fileName = fileUrl.split('/').pop();
        if (!fileName) {
            throw new common_1.InternalServerErrorException('Invalid file URL provided.');
        }
        const { error } = await this.supabase.storage
            .from(bucketName)
            .remove([fileName]);
        if (error) {
            if (error.message.includes('404')) {
                console.warn(`File not found in Supabase storage, skipping deletion: ${fileName}`);
            }
            else {
                throw new common_1.InternalServerErrorException(`Error deleting file from Supabase: ${error.message}`);
            }
        }
    }
    async deleteFiles(fileUrls) {
        const bucketName = "product-images";
        const fileNames = fileUrls.map(url => {
            const name = url.split('/').pop();
            if (!name) {
                console.warn(`Could not extract file name from URL: ${url}`);
                return null;
            }
            return name;
        }).filter((name) => name !== null);
        if (fileNames.length === 0) {
            return;
        }
        const { error } = await this.supabase.storage
            .from(bucketName)
            .remove(fileNames);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error deleting files from Supabase: ${error.message}`);
        }
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map