import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { SupabaseService } from '../supabase/supabase.service';
export declare class UsersController {
    private readonly usersService;
    private readonly supabaseService;
    private readonly logger;
    constructor(usersService: UsersService, supabaseService: SupabaseService);
    getProfile(req: any): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAvatar(req: any, file: Express.Multer.File): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(getUsersDto: GetUsersDto): Promise<{
        data: {
            name: string;
            email: string;
            phone: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        }[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
        limit: number;
        offset: number;
    }>;
    findOne(id: string): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    updateRole(id: string, newRole: Role, req: any): Promise<{
        name: string;
        email: string;
        phone: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
