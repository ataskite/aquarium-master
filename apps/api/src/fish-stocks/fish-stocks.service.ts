import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FishStocksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, aquariumId: string) {
    const aquarium = await this.prisma.aquarium.findUnique({ where: { id: aquariumId } });
    if (!aquarium || aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumStock.findMany({
      where: { aquariumId },
      include: { species: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, data: { aquariumId: string; speciesId?: string; displayName?: string; quantity: number; color?: string; note?: string }) {
    const aquarium = await this.prisma.aquarium.findUnique({ where: { id: data.aquariumId } });
    if (!aquarium || aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumStock.create({ data, include: { species: true } });
  }

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const stock = await this.prisma.aquariumStock.findUnique({ where: { id }, include: { aquarium: true } });
    if (!stock) throw new NotFoundException();
    if (stock.aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumStock.update({ where: { id }, data: data as never, include: { species: true } });
  }

  async remove(userId: string, id: string) {
    const stock = await this.prisma.aquariumStock.findUnique({ where: { id }, include: { aquarium: true } });
    if (!stock) throw new NotFoundException();
    if (stock.aquarium.userId !== userId) throw new ForbiddenException();
    return this.prisma.aquariumStock.delete({ where: { id } });
  }
}
