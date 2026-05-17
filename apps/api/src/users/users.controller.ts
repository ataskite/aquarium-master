import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { aquariums: true, reminders: true } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { nickname?: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data: body });
  }
}
