// src/components/ui/star-rating.tsx
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  starSize?: number;
}

export function StarRating({ rating, starSize = 16, className, ...props }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const partialStarPercentage = (rating % 1) * 100;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="gold" strokeWidth={0} size={starSize} />
      ))}
      {partialStarPercentage > 0 && (
        <div className="relative">
          <Star key="partial" fill="lightgray" strokeWidth={0} size={starSize} />
          <div
            className="absolute top-0 left-0 h-full overflow-hidden"
            style={{ width: `${partialStarPercentage}%` }}
          >
            <Star fill="gold" strokeWidth={0} size={starSize} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="lightgray" strokeWidth={0} size={starSize} />
      ))}
    </div>
  );
}