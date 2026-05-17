import { Module } from '@nestjs/common';
import { AquariumsController } from './aquariums.controller';

@Module({ controllers: [AquariumsController] })
export class AquariumsModule {}
