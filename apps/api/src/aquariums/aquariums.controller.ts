import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AquariumsService } from './aquariums.service';
import { CreateAquariumDto } from './dto/create-aquarium.dto';
import { UpdateAquariumDto } from './dto/update-aquarium.dto';

@Controller('aquariums')
export class AquariumsController {
  constructor(private readonly service: AquariumsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.service.list(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateAquariumDto) {
    return this.service.create(userId, dto as unknown as Record<string, unknown>);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateAquariumDto) {
    return this.service.update(userId, id, dto as unknown as Record<string, unknown>);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
