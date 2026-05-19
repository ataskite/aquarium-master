import { Module } from '@nestjs/common';
import { AquariumsController } from './aquariums.controller';
import { AquariumsService } from './aquariums.service';

@Module({
  controllers: [AquariumsController],
  providers: [AquariumsService],
})
export class AquariumsModule {}
