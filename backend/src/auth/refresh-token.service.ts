import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Correct import path from auth directory
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createRefreshToken(userId: string, userAgent?: string): Promise<{ token: string; expiresAt: Date }> {
    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 10);

    // Refresh tokens will expire in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });

    return {
      token,
      expiresAt,
    };
  }

  async findValidRefreshToken(token: string): Promise<{ refreshToken: any; user: User }> {
    // First, fetch all potentially matching tokens to verify against the provided token
    const candidateTokens = await this.prisma.refreshToken.findMany({
      where: {
        isRevoked: false,
        expiresAt: {
          gte: new Date(), // Greater than or equal to current date (not expired)
        },
      },
      include: {
        user: true
      }
    });

    // Find the matching token by comparing the provided token with stored hashed tokens
    for (const refreshTokenRecord of candidateTokens) {
      const isValid = await bcrypt.compare(token, refreshTokenRecord.token);
      if (isValid) {
        return {
          refreshToken: refreshTokenRecord,
          user: refreshTokenRecord.user
        };
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async revokeToken(token: string): Promise<void> {
    // Find the token by comparing with all unrevoked tokens
    const allRefreshTokens = await this.prisma.refreshToken.findMany({
      where: {
        isRevoked: false
      }
    });

    for (const refreshTokenRecord of allRefreshTokens) {
      const isValid = await bcrypt.compare(token, refreshTokenRecord.token);
      if (isValid) {
        await this.prisma.refreshToken.update({
          where: { id: refreshTokenRecord.id },
          data: { isRevoked: true }
        });
        return;
      }
    }

    throw new UnauthorizedException('Token not found');
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });
  }

  async cleanExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lte: new Date(), // Less than or equal to current date (expired)
            }
          },
          {
            isRevoked: true // Also clean revoked tokens for maintenance
          }
        ]
      }
    });

    return result.count;
  }
}