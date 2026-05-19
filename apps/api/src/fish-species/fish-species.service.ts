import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FishSpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q?: string) {
    return this.prisma.fishSpecies.findMany({
      where: q
        ? {
            OR: [
              { commonName: { contains: q, mode: 'insensitive' } },
              { scientificName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { commonName: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.fishSpecies.findUnique({ where: { id } });
  }
}
