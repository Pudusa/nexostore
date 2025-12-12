import { Suspense } from 'react';
import ProductGrid from '@/components/product-grid';
import { getProducts } from '@/lib/api';
import ProductSkeleton from '@/components/ui/product-skeleton';

// Server component to fetch and render products
async function ProductList() {
  const initialProducts = await getProducts({
    limit: 8, // Load 8 products initially for better performance
    offset: 0,
  });

  return <ProductGrid initialProducts={initialProducts.data} />;
}

export default function ProductsPage() {
  return (
    <section>
      {/* The header and skeleton will be streamed immediately */}
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Catálogo de Productos
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explora nuestra colección completa de productos.
          </p>
        </div>

        {/* Users will see the skeleton instantly while data loads from NestJS */}
        <Suspense fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        }>
          {/* This component makes the fetch to NestJS */}
          <ProductList />
        </Suspense>
      </div>
    </section>
  );
}