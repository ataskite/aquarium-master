import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly service: DevicesService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('aquariumId') aquariumId: string) {
    return this.service.list(userId, aquariumId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDeviceDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.service.update(userId, id, dto as unknown as Record<string, unknown>);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
