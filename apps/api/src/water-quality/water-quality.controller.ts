import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('water-quality-records')
export class WaterQualityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('aquariumId') aquariumId?: string) {
    return this.prisma.waterQualityRecord.findMany({
      where: aquariumId ? { aquariumId } : undefined,
      orderBy: { recordedAt: 'desc' },
    });
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.prisma.waterQualityRecord.create({ data: body as never });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.waterQualityRecord.update({ where: { id }, data: body as never });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.waterQualityRecord.delete({ where: { id } });
  }
}
