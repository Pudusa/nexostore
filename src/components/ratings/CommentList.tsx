"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Comment {
  id: string;
  comment?: string;
  value: number; // El valor de la estrella de este comentario
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "text-yellow-400" : "text-gray-300"
            )}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xl font-semibold">Comentarios de Usuarios</h3>
      {comments.length === 0 ? (
        <p className="text-gray-500">Aún no hay comentarios.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.user.avatarUrl || undefined} />
              <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{comment.user.name}</p>
                <div className="flex items-center gap-1">
                  {renderStars(comment.value)}
                  <span className="text-sm text-gray-500">{comment.value.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              {comment.comment && (
                <p className="text-gray-700">{comment.comment}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}