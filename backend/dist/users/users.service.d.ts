import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/types';
import { Role } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { SupabaseService } from '../supabase/supabase.service';
export declare class UsersService {
    private prisma;
    private supabaseService;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
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
    update(id: string, updateUserDto: UpdateUserDto, performingUser: AuthenticatedUser): Promise<{
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
    updateAvatar(id: string, avatarUrl: string): Promise<{
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
    findOneByEmail(email: string): Promise<{
        name: string;
        email: string;
        phone: string;
        phoneCountry: string;
        avatarUrl: string | null;
        id: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    remove(id: string, performingUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    updateRole(id: string, newRole: Role, performingUser: AuthenticatedUser): Promise<{
        name: string;
        email: string;
        phone: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
