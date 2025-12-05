"use client"

import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";
import { Star } from "lucide-react";

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  ratingsCount: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export function RatingSummary({
  averageRating,
  totalRatings,
  ratingsCount,
}: RatingSummaryProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5",
              star <= rating ? "text-yellow-400" : "text-gray-300"
            )}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Resumen de Valoraciones</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
        {renderStars(Math.round(averageRating))}
        <span className="text-gray-500">({totalRatings} valoraciones)</span>
      </div>

      <div className="space-y-2">
        {Object.entries(ratingsCount)
          .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Ordenar de 5 a 1 estrellas
          .map(([star, count]) => {
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-4 text-sm font-medium">{star}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Progress value={percentage} className="flex-grow h-2 bg-gray-200" />
                <span className="w-10 text-right text-sm text-gray-600">
                  {count}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}