
import {
  Controller,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Get,
  Query,
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
    const { productId, value, comment } = createRatingDto;
    return this.ratingsService.upsertRating(userId, productId, value, comment);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  async upsertRating(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const { productId, value, comment } = createRatingDto;
    return this.ratingsService.upsertRating(userId, productId, value, comment);
  }

  @Get('/products/:id/summary')
  @HttpCode(HttpStatus.OK)
  async getProductRatingsSummary(@Param('id') productId: string) {
    return this.ratingsService.getRatingsSummary(productId);
  }

  @Get('/products/:id')
  @HttpCode(HttpStatus.OK)
  async getProductRatings(
    @Param('id') productId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.ratingsService.getRatingsWithUsers(
      productId,
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }
}
