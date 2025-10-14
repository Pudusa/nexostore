import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString() // Expecting a JSON string for the array of URLs
  @IsNotEmpty()
  imageUrls: string;

  @IsUUID()
  managerId: string;
}