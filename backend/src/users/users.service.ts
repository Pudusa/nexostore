import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.prisma.user.create({
      data: createUserDto,
    });

    const { password, ...result } = createdUser;
    return result;
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, phone: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...result } = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return result;
  }

    async remove(id: string) {

      await this.findOne(id); // Ensure user exists before trying to delete

      await this.prisma.user.delete({ where: { id } });

      return { message: `User with ID "${id}" successfully deleted` };

    }

  

    // This method is used by the AuthService to validate a user

    async findOneByEmail(email: string) {

      return this.prisma.user.findUnique({ where: { email } });

    }

  }