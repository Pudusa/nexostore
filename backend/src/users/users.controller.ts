import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('me')
  getProfile(@Request() req) {
    // El usuario autenticado está disponible en req.user gracias a JwtAuthGuard
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto, req.user);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`Received request to upload avatar for user ${req.user.id}`);
    if (!file) {
      this.logger.warn('No file provided for avatar upload.');
      throw new InternalServerErrorException('No file provided for upload.');
    }

    try {
      const { publicUrl } = await this.supabaseService.uploadFile(
        file,
        'avatars',
      );
      this.logger.log(`Avatar uploaded to ${publicUrl}`);
      return this.usersService.updateAvatar(req.user.id, publicUrl);
    } catch (error) {
      this.logger.error(`Failed to upload avatar: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to upload avatar: ${error.message}`,
      );
    }
  }

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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body('newRole') newRole: Role,
    @Request() req
  ) {
    return this.usersService.updateRole(id, newRole, req.user);
  }
}
