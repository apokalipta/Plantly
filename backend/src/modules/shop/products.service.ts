// Service boutique: lecture des produits (liste + détail).
// Objectif: Centraliser l’accès Prisma pour la boutique mock (sans auth avancée).
// Logique: Filtrage optionnel par catégorie et mapping minimal des résultats.
import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCategory(category?: string): ProductCategory | undefined {
    const c = String(category || '').trim();
    if (!c) return undefined;
    const allowed = new Set<string>(Object.values(ProductCategory));
    if (!allowed.has(c)) {
      throw new BadRequestException(`Unknown category: ${c}`);
    }
    return c as ProductCategory;
  }

  async listProducts(category?: string) {
    const normalized = this.normalizeCategory(category);
    return this.prisma.product.findMany({
      where: normalized ? { category: normalized } : undefined,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
      },
    });
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
      },
    });
  }
}

