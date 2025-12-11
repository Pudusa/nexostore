import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Invalidar todas las caches relacionadas con productos
   */
  async invalidateProductCaches(productId?: string): Promise<void> {
    // Invalidar la cache específica del producto si se proporciona ID
    if (productId) {
      await this.cacheService.del(`product_${productId}`);
    }

    // Invalidar las caches de listas de productos
    // Como no podemos borrar por patrón, borramos las claves más comunes
    await this.cacheService.del('products_list_10_0_false'); // página por defecto
    await this.cacheService.del('products_list_10_0_true');  // con out of stock
    await this.cacheService.del('products_list_20_0_false'); // página con más elementos
    await this.cacheService.del('products_list_20_0_true');  // con out of stock

    // También invalidar caches de resumen de ratings relacionadas con el producto
    if (productId) {
      await this.cacheService.del(`ratings_summary_${productId}`);
    }
  }

  /**
   * Invalidar caches relacionadas con usuarios
   */
  async invalidateUserCaches(userId?: string): Promise<void> {
    if (userId) {
      await this.cacheService.del(`user_${userId}`);
    }
    // No hay caches comunes de usuarios que invalidar en esta implementación
  }

  /**
   * Invalidar caches relacionadas con ratings
   */
  async invalidateRatingCaches(productId?: string): Promise<void> {
    if (productId) {
      await this.cacheService.del(`ratings_summary_${productId}`);
    }
  }
}