import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/types';
import { Role, Prisma } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.prisma.user.create({
      data: createUserDto,
    });

    const { password, ...result } = createdUser;
    return result;
  }

  async findAll(getUsersDto: GetUsersDto) {
    const { search, role, limit = 10, offset = 0 } = getUsersDto;
    const where: Prisma.UserWhereInput = {
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
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true, avatarUrl: true },
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true, phoneCountry: true, avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, performingUser: AuthenticatedUser) {
    if (performingUser.id !== id && performingUser.role !== Role.admin) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const { oldPassword, newPassword, ...updateData } = updateUserDto;
    const dataToUpdate: Prisma.UserUpdateInput = { ...updateData };

    if (newPassword) {
      if (!oldPassword) {
        throw new UnauthorizedException('Old password is required to set a new password.');
      }

      const isPasswordMatching = await bcrypt.compare(
        oldPassword,
        userToUpdate.password,
      );

      if (!isPasswordMatching) {
        throw new UnauthorizedException('Old password does not match.');
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

  async updateAvatar(id: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        avatarUrl: true,
        phone: true,
        phoneCountry: true,
      },
    });
    return user;
  }

  async remove(id: string, performingUser: AuthenticatedUser) {
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
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Proteger al Super Admin de ser eliminado
    if (userToDelete.email === process.env.SUPER_ADMIN_EMAIL) {
      throw new ForbiddenException('The Super Admin account cannot be deleted.');
    }

    // Un admin no puede eliminarse a sí mismo
    if (performingUser.id === id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    if (
      performingUser.role !== Role.admin &&
      !(process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && performingUser.email === process.env.SUPER_ADMIN_EMAIL)
    ) {
      throw new ForbiddenException('You are not allowed to delete users');
    }

    // Si el usuario es un manager y tiene productos, eliminar imágenes del storage
    if (userToDelete.role === Role.manager && userToDelete.products.length > 0) {
      const imageUrls = userToDelete.products.flatMap(
        (product) => product.images.map((image) => image.url),
      );

      if (imageUrls.length > 0) {
        await Promise.all(
          imageUrls.map((url) => this.supabaseService.deleteFile(url)),
        );
      }
    }

    // La eliminación en cascada de la base de datos se encargará de los productos y las imágenes.
    await this.prisma.user.delete({ where: { id } });

    return { message: `User with ID "${id}" successfully deleted` };
  }

  async updateRole(
    id: string,
    newRole: Role,
    performingUser: AuthenticatedUser,
  ) {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Proteger al Super Admin de cambios de rol no autorizados
    if (
      userToUpdate.email === process.env.SUPER_ADMIN_EMAIL &&
      performingUser.email !== process.env.SUPER_ADMIN_EMAIL
    ) {
      throw new ForbiddenException('Only the Super Admin can change the Super Admin\'s role.');
    }

    // Un admin no puede cambiar su propio rol a ADMIN
    if (performingUser.id === id && newRole === Role.admin && performingUser.role !== Role.admin) {
      throw new ForbiddenException('You cannot change your own role to ADMIN.');
    }

    // Solo ADMIN o Super Admin pueden cambiar roles
    if (
      performingUser.role !== Role.admin &&
      !(process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && performingUser.email === process.env.SUPER_ADMIN_EMAIL)
    ) {
      throw new ForbiddenException('You are not allowed to update user roles');
    }

    // No cambiar si el rol es el mismo
    if (userToUpdate.role === newRole) {
      return userToUpdate; // No hay cambios necesarios
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true },
    });
  }
}