
import { IsInt, Max, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
