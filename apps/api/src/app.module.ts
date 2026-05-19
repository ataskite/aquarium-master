import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AiModule } from './ai/ai.module';
import { AquariumsModule } from './aquariums/aquariums.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PrismaModule } from './prisma/prisma.module';
import { RemindersModule } from './reminders/reminders.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { FishSpeciesModule } from './fish-species/fish-species.module';
import { FishStocksModule } from './fish-stocks/fish-stocks.module';
import { WaterQualityModule } from './water-quality/water-quality.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AquariumsModule,
    WaterQualityModule,
    MaintenanceModule,
    AiModule,
    StorageModule,
    RemindersModule,
    KnowledgeModule,
    FishStocksModule,
    FishSpeciesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
