import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FishStocksService } from './fish-stocks.service';
import { CreateFishStockDto } from './dto/create-fish-stock.dto';
import { UpdateFishStockDto } from './dto/update-fish-stock.dto';

@Controller('fish-stocks')
export class FishStocksController {
  constructor(private readonly service: FishStocksService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('aquariumId') aquariumId: string) {
    return this.service.list(userId, aquariumId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateFishStockDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateFishStockDto) {
    return this.service.update(userId, id, dto as unknown as Record<string, unknown>);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
