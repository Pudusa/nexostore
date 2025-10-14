import ProductCard from "@/components/product-card";
import { products } from "@/lib/data";

export default function Home() {
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
      </div>
    </div>
  );
}
