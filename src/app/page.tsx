import { getProducts } from "@/lib/api";
import ProductGrid from "@/components/product-grid";
import { Suspense } from "react";
import HomeSkeleton from "@/components/ui/home-skeleton";

export const revalidate = 900; // Regenerar cada 15 minutos (900 segundos)

// Componente server para obtener los productos iniciales
async function InitialProductsFetcher() {
  const initialProducts = await getProducts({
    limit: 8, // Reducir a 8 productos inicialmente para mejorar la carga
    offset: 0,
  });

  return <ProductGrid initialProducts={initialProducts.data} />;
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <InitialProductsFetcher />
    </Suspense>
  );
}
