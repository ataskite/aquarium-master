/*
  Warnings:

  - Made the column `userId` on table `Aquarium` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Aquarium" DROP CONSTRAINT "Aquarium_userId_fkey";

-- AlterTable
ALTER TABLE "Aquarium" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "AquariumStock" ALTER COLUMN "speciesId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Aquarium" ADD CONSTRAINT "Aquarium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
