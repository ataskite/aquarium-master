CREATE TYPE "AquariumStatus" AS ENUM ('RUNNING', 'MAINTENANCE', 'PAUSED');
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'DONE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "openId" TEXT,
  "nickname" TEXT,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Aquarium" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "coverUrl" TEXT,
  "volumeLiters" INTEGER,
  "lengthCm" INTEGER,
  "widthCm" INTEGER,
  "heightCm" INTEGER,
  "species" TEXT,
  "status" "AquariumStatus" NOT NULL DEFAULT 'RUNNING',
  "healthScore" INTEGER NOT NULL DEFAULT 92,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Aquarium_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaterQualityRecord" (
  "id" TEXT NOT NULL,
  "aquariumId" TEXT NOT NULL,
  "temperature" DOUBLE PRECISION,
  "ph" DOUBLE PRECISION,
  "ammonia" DOUBLE PRECISION,
  "nitrite" DOUBLE PRECISION,
  "nitrate" DOUBLE PRECISION,
  "tds" DOUBLE PRECISION,
  "note" TEXT,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WaterQualityRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MaintenanceRecord" (
  "id" TEXT NOT NULL,
  "aquariumId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "note" TEXT,
  "imageUrl" TEXT,
  "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reminder" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "aquariumId" TEXT,
  "title" TEXT NOT NULL,
  "note" TEXT,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "repeatRule" TEXT,
  "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeArticle" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FileObject" (
  "id" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FileObject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_openId_key" ON "User"("openId");
CREATE UNIQUE INDEX "FileObject_objectKey_key" ON "FileObject"("objectKey");

ALTER TABLE "Aquarium" ADD CONSTRAINT "Aquarium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WaterQualityRecord" ADD CONSTRAINT "WaterQualityRecord_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
