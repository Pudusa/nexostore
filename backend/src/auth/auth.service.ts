import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este correo electrónico.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // Crear un objeto con la contraseña hasheada
    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.usersService.create(userData);
    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      phone: user.phone,
      phoneCountry: user.phoneCountry,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }

}