CREATE TABLE "FishSpecies" (
  "id" TEXT NOT NULL,
  "commonName" TEXT NOT NULL,
  "scientificName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "origin" TEXT,
  "careLevel" TEXT,
  "temperament" TEXT,
  "diet" TEXT,
  "waterLayer" TEXT,
  "minGroupSize" INTEGER,
  "minTankLiters" INTEGER,
  "adultSizeCm" DOUBLE PRECISION,
  "temperatureMin" DOUBLE PRECISION,
  "temperatureMax" DOUBLE PRECISION,
  "phMin" DOUBLE PRECISION,
  "phMax" DOUBLE PRECISION,
  "hardness" TEXT,
  "notes" TEXT,
  "sourceUrls" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FishSpecies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AquariumStock" (
  "id" TEXT NOT NULL,
  "aquariumId" TEXT NOT NULL,
  "speciesId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "displayName" TEXT,
  "color" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AquariumStock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AquariumDevice" (
  "id" TEXT NOT NULL,
  "aquariumId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RUNNING',
  "powerWatts" DOUBLE PRECISION,
  "flowRateLph" INTEGER,
  "schedule" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AquariumDevice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaterParameterProfile" (
  "id" TEXT NOT NULL,
  "aquariumId" TEXT NOT NULL,
  "temperatureMin" DOUBLE PRECISION,
  "temperatureMax" DOUBLE PRECISION,
  "phMin" DOUBLE PRECISION,
  "phMax" DOUBLE PRECISION,
  "ammoniaMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "nitriteMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "nitrateMax" DOUBLE PRECISION,
  "tdsMin" DOUBLE PRECISION,
  "tdsMax" DOUBLE PRECISION,
  "note" TEXT,
  "sourceUrls" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WaterParameterProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeedingTemplate" (
  "id" TEXT NOT NULL,
  "aquariumId" TEXT NOT NULL,
  "speciesId" TEXT,
  "food" TEXT NOT NULL,
  "amount" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeedingTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WaterParameterProfile_aquariumId_key" ON "WaterParameterProfile"("aquariumId");

ALTER TABLE "AquariumStock" ADD CONSTRAINT "AquariumStock_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AquariumStock" ADD CONSTRAINT "AquariumStock_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AquariumDevice" ADD CONSTRAINT "AquariumDevice_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WaterParameterProfile" ADD CONSTRAINT "WaterParameterProfile_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedingTemplate" ADD CONSTRAINT "FeedingTemplate_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedingTemplate" ADD CONSTRAINT "FeedingTemplate_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
