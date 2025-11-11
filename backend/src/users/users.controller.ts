import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';

// Creamos un usuario simulado con rol de admin para satisfacer las dependencias del servicio.
const mockUser = {
  id: 'clxmxm6wu0000z93g6q564s3v', // Un ID de usuario existente para pruebas
  email: 'admin@nexostore.com',
  role: 'admin',
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() getUsersDto: GetUsersDto) {
    return this.usersService.findAll(getUsersDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto, mockUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id, mockUser);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body('newRole') newRole: Role,
  ) {
    return this.usersService.updateRole(id, newRole, mockUser);
  }
}
