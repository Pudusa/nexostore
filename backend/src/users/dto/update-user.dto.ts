import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The name of the user.',
    example: 'Jane Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'The email of the user.',
    example: 'jane.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @ApiProperty({
    description: 'The phone number of the user.',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
  
  @ApiProperty({
    description: 'The phone country code of the user.',
    example: '+1',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneCountry?: string;

  @ApiProperty({
    description: 'URL of the user\'s avatar image.',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'The current password of the user. Required only when changing the password.',
    example: 'OldPassword123!',
    required: false,
  })
  @ValidateIf(o => o.newPassword !== undefined)
  @IsString()
  @MinLength(8)
  oldPassword?: string;

  @ApiProperty({
    description: 'The new password for the user. Must be a strong password.',
    example: 'NewStrongPassword123!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword?: string;
}