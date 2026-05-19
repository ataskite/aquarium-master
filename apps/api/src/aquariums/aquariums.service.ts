import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AquariumsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.aquarium.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        fishStocks: { include: { species: true }, orderBy: { createdAt: 'asc' } },
        waterProfile: true,
        waterRecords: { orderBy: { recordedAt: 'desc' }, take: 1 },
        reminders: true,
      },
    });
  }

  async create(userId: string, data: Record<string, unknown>) {
    return this.prisma.aquarium.create({
      data: { ...data, userId } as never,
    });
  }

  async findOne(userId: string, id: string) {
    const aquarium = await this.prisma.aquarium.findUnique({
      where: { id },
      include: {
        fishStocks: { include: { species: true }, orderBy: { createdAt: 'asc' } },
        devices: { orderBy: { createdAt: 'asc' } },
        waterProfile: true,
        feedingTemplates: { include: { species: true }, orderBy: { createdAt: 'asc' } },
        waterRecords: { orderBy: { recordedAt: 'desc' } },
        maintenanceRecords: { orderBy: { happenedAt: 'desc' } },
        reminders: { orderBy: { dueAt: 'asc' } },
      },
    });
    if (!aquarium) throw new NotFoundException();
    if (aquarium.userId !== userId) throw new ForbiddenException();
    return aquarium;
  }

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const existing = await this.prisma.aquarium.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquarium.update({ where: { id }, data: data as never });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.aquarium.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquarium.delete({ where: { id } });
  }
}
