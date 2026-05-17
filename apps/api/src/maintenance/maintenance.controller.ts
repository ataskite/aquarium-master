import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('maintenance-records')
export class MaintenanceController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('aquariumId') aquariumId?: string) {
    return this.prisma.maintenanceRecord.findMany({
      where: aquariumId ? { aquariumId } : undefined,
      orderBy: { happenedAt: 'desc' },
    });
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.prisma.maintenanceRecord.create({ data: body as never });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.maintenanceRecord.update({ where: { id }, data: body as never });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.maintenanceRecord.delete({ where: { id } });
  }
}
