import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, aquariumId: string) {
    const aquarium = await this.prisma.aquarium.findUnique({ where: { id: aquariumId } });
    if (!aquarium || aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumDevice.findMany({
      where: { aquariumId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, data: { aquariumId: string; type: string; name: string; status?: string; powerWatts?: number; flowRateLph?: number; schedule?: string; note?: string }) {
    const aquarium = await this.prisma.aquarium.findUnique({ where: { id: data.aquariumId } });
    if (!aquarium || aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumDevice.create({ data });
  }

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const device = await this.prisma.aquariumDevice.findUnique({ where: { id }, include: { aquarium: true } });
    if (!device) throw new NotFoundException();
    if (device.aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumDevice.update({ where: { id }, data: data as never });
  }

  async remove(userId: string, id: string) {
    const device = await this.prisma.aquariumDevice.findUnique({ where: { id }, include: { aquarium: true } });
    if (!device) throw new NotFoundException();
    if (device.aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumDevice.delete({ where: { id } });
  }
}
