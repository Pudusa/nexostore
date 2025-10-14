import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { products, users } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import ProductContact from "@/components/product-contact";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const manager = users.find((u) => u.id === product.managerId);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square relative overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={url}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint="product detail"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {product.name}
          </h1>

          {manager && (
            <Badge variant="secondary" className="mt-2 w-fit">
              Vendido por: {manager.name}
            </Badge>
          )}

          <p className="mt-4 text-3xl font-bold text-primary">
            {formatter.format(product.price)}
          </p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Detalles del Producto</h2>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>
          
          {manager?.phone && <ProductContact phone={manager.phone} />}
        </div>
      </div>
    </div>
  );
}
