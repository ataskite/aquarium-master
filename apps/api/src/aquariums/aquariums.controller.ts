import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AquariumsService } from './aquariums.service';

@Controller('aquariums')
export class AquariumsController {
  constructor(private readonly service: AquariumsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.service.list(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.service.create(userId, body);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(userId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
