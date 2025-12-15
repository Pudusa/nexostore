import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
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

    // Devolver solo access token por ahora hasta que se aplique la migración
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const { password, ...userWithoutPassword } = user;

    const { token: refreshToken, expiresAt } = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expiresAt: expiresAt,
      user: userWithoutPassword,
    };
  }

  async refreshTokens(refreshToken: string) {
    const { refreshToken: tokenRecord, user } = await this.refreshTokenService.findValidRefreshToken(refreshToken);

    // Generate new access token
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      phone: user.phone,
      phoneCountry: user.phoneCountry,
    };

    const newAccessToken = this.jwtService.sign(payload);

    // Create a new refresh token to implement rolling refresh tokens
    await this.refreshTokenService.revokeToken(refreshToken);
    const { token: newRefreshToken, expiresAt } = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expiresAt: expiresAt,
      user: user,
    };
  }
}