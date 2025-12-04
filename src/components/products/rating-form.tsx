// src/components/products/rating-form.tsx
"use client";

import React, { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { submitRating } from '@/app/actions/rating-actions'; // Crearemos esta acción

interface RatingFormProps {
  productId: string;
  userId: string;
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-4 w-full">
      {pending ? 'Enviando...' : 'Enviar Valoración'}
    </Button>
  );
}

export function RatingForm({ productId, userId }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const { toast } = useToast();

  const submitRatingWithId = submitRating.bind(null, productId);
  const [state, dispatch] = useFormState(submitRatingWithId, initialState);

  React.useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Éxito' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        setRating(0);
      }
    }
  }, [state, toast]);

  return (
    <form action={dispatch} className="w-full rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-2">Valora este producto</h3>
      <input type="hidden" name="rating" value={rating} />
      <div className="flex justify-center items-center space-x-1">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              aria-label={`Valorar con ${starValue} estrellas`}
              type="button"
              key={starValue}
              className="cursor-pointer"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(rating)}
            >
              <Star
                size={32}
                className={starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}
                fill="currentColor"
              />
            </button>
          );
        })}
      </div>
      {state.errors?.rating && (
        <p className="text-sm text-destructive mt-2 text-center">{state.errors.rating[0]}</p>
      )}
      <SubmitButton />
    </form>
  );
}
