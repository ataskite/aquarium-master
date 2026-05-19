import { Module } from '@nestjs/common';
import { FishSpeciesController } from './fish-species.controller';
import { FishSpeciesService } from './fish-species.service';

@Module({
  controllers: [FishSpeciesController],
  providers: [FishSpeciesService],
})
export class FishSpeciesModule {}
