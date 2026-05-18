import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "WaterQualityRecord", "MaintenanceRecord", "Reminder", "AquariumStock", "AquariumDevice", "WaterParameterProfile", "FeedingTemplate", "Aquarium", "User", "KnowledgeArticle", "FileObject" CASCADE`,
  );
}

export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}
