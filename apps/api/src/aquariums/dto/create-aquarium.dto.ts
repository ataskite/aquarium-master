import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';

export enum AquariumSpecies {
  FRESHWATER = 'freshwater',
  PLANTED = 'planted',
  MARINE = 'marine',
}

export class CreateAquariumDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  volumeLiters?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  lengthCm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  widthCm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  heightCm?: number;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsEnum(['RUNNING', 'MAINTENANCE', 'PAUSED'])
  status?: string;
}
