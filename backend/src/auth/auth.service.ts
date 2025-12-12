import { Injectable, ConflictException } from '@nestjs/common';
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
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const { token: refreshToken, expiresAt } = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      access_token: this.jwtService.sign(payload),
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