import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.manager, Role.admin)
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.create(createProductDto, req.user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('includeOutOfStock') includeOutOfStock?: string,
  ) {
    const includeOutOfStockBool = includeOutOfStock === 'true';
    return this.productsService.findAll({
      ...paginationDto,
      includeOutOfStock: includeOutOfStockBool,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.manager, Role.admin)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.update(id, updateProductDto, req.user);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.manager, Role.admin)
  updateStockStatus(
    @Param('id') id: string,
    @Body('isOutOfStock') isOutOfStock: boolean,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.updateStockStatus(
      id,
      isOutOfStock,
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.manager, Role.admin)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.productsService.remove(id, req.user);
  }
}
