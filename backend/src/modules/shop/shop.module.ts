// Module boutique: encapsule les endpoints produits pour la boutique mock.
// Objectif: Regrouper controller/service et faciliter l’import dans AppModule.
// Logique: Fournit ProductsService via PrismaService (DatabaseModule global).
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ShopModule {}
