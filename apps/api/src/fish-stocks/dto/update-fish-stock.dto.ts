import { PartialType } from '@nestjs/mapped-types';
import { CreateFishStockDto } from './create-fish-stock.dto';

export class UpdateFishStockDto extends PartialType(CreateFishStockDto) {}
