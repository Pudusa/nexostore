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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UploadController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const supabase_service_1 = require("../supabase/supabase.service");
let UploadController = UploadController_1 = class UploadController {
    supabaseService;
    logger = new common_1.Logger(UploadController_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async uploadFiles(files) {
        this.logger.log(`[UPLOAD START] Received request with ${files?.length ?? 0} files.`);
        if (!files || files.length === 0) {
            this.logger.warn('[UPLOAD WARN] No files were provided in the request.');
            throw new common_1.InternalServerErrorException('No files provided for upload.');
        }
        try {
            const uploadPromises = files.map(file => {
                this.logger.debug(`[UPLOAD PROCESS] Processing file: ${file.originalname}`);
                return this.supabaseService.uploadFile(file);
            });
            const uploadedImages = await Promise.all(uploadPromises);
            this.logger.log(`[UPLOAD SUCCESS] Generated image data: ${JSON.stringify(uploadedImages)}`);
            return { uploadedImages };
        }
        catch (error) {
            this.logger.error(`[UPLOAD FAILED] Error during upload process: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to upload files: ${error.message}`);
        }
    }
    async deleteImages(imageUrls) {
        this.logger.log(`[DELETE START] Received request to delete ${imageUrls?.length ?? 0} images.`);
        if (!imageUrls || imageUrls.length === 0) {
            this.logger.warn('[DELETE WARN] No image URLs were provided in the request.');
            return { message: 'No images to delete.' };
        }
        try {
            await this.supabaseService.deleteFiles(imageUrls);
            this.logger.log(`[DELETE SUCCESS] Successfully deleted images.`);
            return { message: 'Images deleted successfully.' };
        }
        catch (error) {
            this.logger.error(`[DELETE FAILED] Error during deletion process: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to delete images: ${error.message}`);
        }
    }
    async uploadAvatar(file) {
        this.logger.log(`[AVATAR UPLOAD START] Received request for avatar upload.`);
        if (!file) {
            this.logger.warn('[AVATAR UPLOAD WARN] No file was provided.');
            throw new common_1.InternalServerErrorException('No file provided for upload.');
        }
        try {
            this.logger.debug(`[AVATAR UPLOAD PROCESS] Processing file: ${file.originalname}`);
            const uploadedImage = await this.supabaseService.uploadFile(file);
            this.logger.log(`[AVATAR UPLOAD SUCCESS] Generated image data: ${JSON.stringify(uploadedImage)}`);
            return uploadedImage;
        }
        catch (error) {
            this.logger.error(`[AVATAR UPLOAD FAILED] Error during upload: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to upload avatar: ${error.message}`);
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Post)('delete-images'),
    __param(0, (0, common_1.Body)('imageUrls')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteImages", null);
__decorate([
    (0, common_1.Post)('avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAvatar", null);
exports.UploadController = UploadController = UploadController_1 = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map