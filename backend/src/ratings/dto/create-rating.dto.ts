
import { IsInt, Max, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}
