'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/product-card';
import ProductSkeleton from '@/components/ui/product-skeleton';
import { getProducts } from '@/lib/api';

interface ProductGridProps {
  initialProducts: Product[];
}

export default function ProductGrid({ initialProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [limit] = useState(8); // 8 productos por página para mejor rendimiento
  const [showSkeletons, setShowSkeletons] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setShowSkeletons(true);
    try {
      const result = await getProducts({
        limit,
        offset: page * limit,
      });

      setProducts(prev => [...prev, ...result.data]);
      setHasMore(result.data.length === limit);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoading(false);
      setShowSkeletons(false);
    }
  }, [page, isLoading, hasMore, limit]);

  // Detectar cuando el usuario se acerca al final de la página para cargar más productos
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 800 // Cargar 800px antes del final
      ) {
        if (!isLoading && hasMore) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, loadMore]);

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Catálogo de Productos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explora nuestra colección de productos únicos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* Mostrar skeletons mientras se carga más contenido */}
        {showSkeletons && Array.from({ length: limit }).map((_, index) => (
          <ProductSkeleton key={`skeleton-${index}`} />
        ))}
      </div>

      {/* Mostrar spinner adicional si se está cargando más contenido */}
      {isLoading && !showSkeletons && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center mt-8 text-muted-foreground">
          No hay más productos para mostrar
        </div>
      )}
    </div>
  );
}