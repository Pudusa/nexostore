
import {
  Controller,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const { productId, value } = createRatingDto;
    return this.ratingsService.upsertRating(userId, productId, value);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  async upsertRating(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const { productId, value } = createRatingDto;
    return this.ratingsService.upsertRating(userId, productId, value);
  }
}

