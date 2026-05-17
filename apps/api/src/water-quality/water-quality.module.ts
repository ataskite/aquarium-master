import { Module } from '@nestjs/common';
import { WaterQualityController } from './water-quality.controller';

@Module({ controllers: [WaterQualityController] })
export class WaterQualityModule {}
