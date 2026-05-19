import { Controller, Get, Param, Query } from '@nestjs/common';
import { FishSpeciesService } from './fish-species.service';

@Controller('fish-species')
export class FishSpeciesController {
  constructor(private readonly service: FishSpeciesService) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.service.list(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
