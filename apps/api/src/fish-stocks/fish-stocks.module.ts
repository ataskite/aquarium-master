import { Module } from '@nestjs/common';
import { FishStocksController } from './fish-stocks.controller';
import { FishStocksService } from './fish-stocks.service';

@Module({
  controllers: [FishStocksController],
  providers: [FishStocksService],
})
export class FishStocksModule {}
