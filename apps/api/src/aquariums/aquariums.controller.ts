import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('aquariums')
export class AquariumsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('userId') userId?: string) {
    return this.prisma.aquarium.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { waterRecords: { orderBy: { recordedAt: 'desc' }, take: 1 }, reminders: true },
    });
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.prisma.aquarium.create({ data: body as never });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.aquarium.findUnique({
      where: { id },
      include: {
        waterRecords: { orderBy: { recordedAt: 'desc' } },
        maintenanceRecords: { orderBy: { happenedAt: 'desc' } },
        reminders: { orderBy: { dueAt: 'asc' } },
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.aquarium.update({ where: { id }, data: body as never });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.aquarium.delete({ where: { id } });
  }
}
