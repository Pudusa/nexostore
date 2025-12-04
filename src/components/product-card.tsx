import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { StarRating } from "./ui/star-rating";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.png')}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product image"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold leading-tight">
            {product.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden">
            {product.description && product.description.length > 50
              ? `${product.description.substring(0, 50)}...`
              : product.description}
          </p>
          <div className="mt-2 flex items-center justify-start">
            <div className="flex items-center gap-1">
              <StarRating rating={product.averageRating} starSize={16} />
              <span className="text-xs font-bold">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-lg font-bold text-primary">
            {formatter.format(product.price)}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
