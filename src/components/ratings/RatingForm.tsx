"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ratingSchema, RatingFormValues } from "@/src/lib/schemas";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { useToast } from "@/src/hooks/use-toast";
import { useSession } from "next-auth/react";

interface RatingFormProps {
  productId: string;
  onRatingSubmitted: () => void;
}

export function RatingForm({ productId, onRatingSubmitted }: RatingFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      productId,
      value: 0,
      comment: "",
    },
  });

  const onSubmit = async (data: RatingFormValues) => {
    if (!session) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para dejar una valoración.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement Server Action for submitting rating
      console.log("Submitting rating:", data);

      toast({
        title: "Éxito",
        description: "Tu valoración ha sido enviada con éxito.",
      });
      form.reset();
      onRatingSubmitted();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Hubo un error al enviar tu valoración.",
        variant: "destructive",
      });
    }
  };

  const currentRating = form.watch("value");

  return (
    <div className="p-4 border rounded-lg shadow-sm mt-8">
      <h3 className="text-xl font-semibold mb-4">Deja tu Valoración</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tu Calificación</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-7 w-7 cursor-pointer transition-colors",
                          (hoveredRating || currentRating) >= star
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        )}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => field.onChange(star)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentario (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="¿Qué te pareció el producto?"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enviando..." : "Enviar Valoración"}
          </Button>
        </form>
      </Form>
    </div>
  );
}