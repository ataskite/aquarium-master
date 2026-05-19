import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum DeviceType {
  FILTER = 'FILTER',
  LIGHT = 'LIGHT',
  HEATER = 'HEATER',
  AIR_PUMP = 'AIR_PUMP',
  CO2 = 'CO2',
  WAVE_MAKER = 'WAVE_MAKER',
  OTHER = 'OTHER',
}

export class CreateDeviceDto {
  @IsString()
  aquariumId: string;

  @IsEnum(DeviceType)
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  powerWatts?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  flowRateLph?: number;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
