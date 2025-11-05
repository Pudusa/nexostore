import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class UpdateAuthDto extends PartialType(CreateUserDto) {}
