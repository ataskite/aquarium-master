import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  findMe(@CurrentUser('id') userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, include: { aquariums: true, reminders: true } });
  }

  @Patch('me')
  updateMe(@CurrentUser('id') userId: string, @Body() body: { nickname?: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data: body });
  }
}
