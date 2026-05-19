import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateFishStockDto {
  @IsString()
  aquariumId: string;

  @IsOptional()
  @IsString()
  speciesId?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
