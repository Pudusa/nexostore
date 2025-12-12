import ProductSkeleton from '@/components/ui/product-skeleton';

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl animate-pulse">
          Catálogo de Productos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground animate-pulse">
          Cargando nuestra colección...
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={`loading-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
}