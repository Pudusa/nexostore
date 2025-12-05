
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea o actualiza la valoración de un producto para un usuario específico.
   * Después de la operación, recalcula y actualiza el promedio de valoración
   * y el conteo total de valoraciones para el producto correspondiente.
   * Toda la operación se ejecuta dentro de una transacción de base de datos.
   *
   * @param userId - El ID del usuario que emite la valoración.
   * @param productId - El ID del producto a valorar.
   * @param value - El valor de la valoración (típicamente de 1 a 5).
   * @param comment - El comentario opcional del usuario.
   * @returns El producto actualizado con el nuevo promedio y conteo de valoraciones.
   */
  async upsertRating(
    userId: string,
    productId: string,
    value: number,
    comment?: string,
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear o actualizar la valoración del usuario para este producto.
      await tx.rating.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: { rating: value, comment },
        create: {
          userId,
          productId,
          rating: value,
          comment,
        },
      });

      // 2. Calcular el nuevo promedio y el conteo de valoraciones.
      const stats = await tx.rating.aggregate({
        where: { productId },
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
      });

      const averageRating = stats._avg?.rating || 0;
      const ratingCount = stats._count?._all || 0;

      // 3. Actualizar el producto con los nuevos datos.
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          averageRating,
          ratingCount,
        },
      });

      return updatedProduct;
    });
  }

  async getRatingsSummary(productId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalRatings = ratings.length;
    let sumRatings = 0;
    const ratingsCount = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    ratings.forEach((r) => {
      sumRatings += r.rating;
      ratingsCount[r.rating]++;
    });

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings,
      ratingsCount,
    };
  }

  async getRatingsWithUsers(
    productId: string,
    skip: number = 0,
    take: number = 10,
  ) {
    return this.prisma.rating.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }
}
