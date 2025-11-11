import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class GetUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}