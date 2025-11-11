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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

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
  findAll() {
    return this.productsService.findAll();
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.manager, Role.admin)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.productsService.remove(id, req.user);
  }
}
