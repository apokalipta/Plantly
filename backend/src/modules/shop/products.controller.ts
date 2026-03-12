// Contrôleur boutique: endpoints publics produits (liste + détail).
// Objectif: Exposer une API simple pour la boutique mock (catalogue et fiche produit).
// Logique: Délégation au service, 404 sur produit absent, filtre optionnel par catégorie.
import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('shop')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (optionally filtered by category)' })
  @ApiQuery({ name: 'category', required: false, description: 'SEED | ACCESSORY | POT | SOIL' })
  @ApiOkResponse({ description: 'Products list' })
  async listProducts(@Query('category') category?: string) {
    return this.productsService.listProducts(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by id' })
  @ApiOkResponse({ description: 'Product details' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async getProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const product = await this.productsService.getProductById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}

