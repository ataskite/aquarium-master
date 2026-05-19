import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('aquariumId') aquariumId?: string) {
    return this.prisma.reminder.findMany({
      where: { userId, ...(aquariumId ? { aquariumId } : {}) },
      orderBy: { dueAt: 'asc' },
    });
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.prisma.reminder.create({ data: { ...body, userId } as never });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.reminder.update({ where: { id }, data: body as never });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.reminder.delete({ where: { id } });
  }
}
