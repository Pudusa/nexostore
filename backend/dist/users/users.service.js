"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const supabase_service_1 = require("../supabase/supabase.service");
let UsersService = class UsersService {
    prisma;
    supabaseService;
    constructor(prisma, supabaseService) {
        this.prisma = prisma;
        this.supabaseService = supabaseService;
    }
    async create(createUserDto) {
        const createdUser = await this.prisma.user.create({
            data: createUserDto,
        });
        const { password, ...result } = createdUser;
        return result;
    }
    async findAll(getUsersDto) {
        const { search, role, limit = 10, offset = 0 } = getUsersDto;
        const where = {
            email: {
                not: process.env.SUPER_ADMIN_EMAIL,
            },
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        const [users, totalItems] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true },
                take: limit,
                skip: offset,
            }),
            this.prisma.user.count({ where }),
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        return {
            data: users,
            totalItems,
            currentPage,
            totalPages,
            limit,
            offset,
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true, phoneCountry: true, avatarUrl: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async update(id, updateUserDto, performingUser) {
        if (performingUser.id !== id && performingUser.role !== client_1.Role.admin) {
            throw new common_1.ForbiddenException('You are not allowed to update this user');
        }
        const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
        if (!userToUpdate) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        const { oldPassword, newPassword, ...updateData } = updateUserDto;
        const dataToUpdate = { ...updateData };
        if (newPassword) {
            if (!oldPassword) {
                throw new common_1.UnauthorizedException('Old password is required to set a new password.');
            }
            const isPasswordMatching = await bcrypt.compare(oldPassword, userToUpdate.password);
            if (!isPasswordMatching) {
                throw new common_1.UnauthorizedException('Old password does not match.');
            }
            dataToUpdate.password = await bcrypt.hash(newPassword, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
        const { password, ...result } = updatedUser;
        return result;
    }
    async updateAvatar(id, avatarUrl) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { avatarUrl },
        });
        const { password, ...result } = updatedUser;
        return result;
    }
    async findOneByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async remove(id, performingUser) {
        const userToDelete = await this.prisma.user.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        images: true,
                    },
                },
            },
        });
        if (!userToDelete) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        if (userToDelete.email === process.env.SUPER_ADMIN_EMAIL) {
            throw new common_1.ForbiddenException('The Super Admin account cannot be deleted.');
        }
        if (performingUser.id === id) {
            throw new common_1.ForbiddenException('You cannot delete your own account.');
        }
        if (performingUser.role !== client_1.Role.admin &&
            !(process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && performingUser.email === process.env.SUPER_ADMIN_EMAIL)) {
            throw new common_1.ForbiddenException('You are not allowed to delete users');
        }
        if (userToDelete.role === client_1.Role.manager && userToDelete.products.length > 0) {
            const imageUrls = userToDelete.products.flatMap((product) => product.images.map((image) => image.url));
            if (imageUrls.length > 0) {
                await Promise.all(imageUrls.map((url) => this.supabaseService.deleteFile(url)));
            }
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: `User with ID "${id}" successfully deleted` };
    }
    async updateRole(id, newRole, performingUser) {
        const userToUpdate = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!userToUpdate) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        if (userToUpdate.email === process.env.SUPER_ADMIN_EMAIL &&
            performingUser.email !== process.env.SUPER_ADMIN_EMAIL) {
            throw new common_1.ForbiddenException('Only the Super Admin can change the Super Admin\'s role.');
        }
        if (performingUser.id === id && newRole === client_1.Role.admin && performingUser.role !== client_1.Role.admin) {
            throw new common_1.ForbiddenException('You cannot change your own role to ADMIN.');
        }
        if (performingUser.role !== client_1.Role.admin &&
            !(process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && performingUser.email === process.env.SUPER_ADMIN_EMAIL)) {
            throw new common_1.ForbiddenException('You are not allowed to update user roles');
        }
        if (userToUpdate.role === newRole) {
            return userToUpdate;
        }
        return this.prisma.user.update({
            where: { id },
            data: { role: newRole },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map