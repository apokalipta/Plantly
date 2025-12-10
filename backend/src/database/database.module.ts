// Module base de données: expose PrismaService pour l'injection dans l'application.
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  // Fournit PrismaService et le rend disponible aux autres modules
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

