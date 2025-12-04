'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { updateUserAvatar } from '@/app/actions/user-actions';
import { useToast } from '@/hooks/use-toast';
import { CgSpinner } from 'react-icons/cg';

export function AvatarEditor() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const result = await updateUserAvatar(formData);

      if (result.success && result.data) {
        // Actualizar la sesión de NextAuth para reflejar el nuevo avatar
        await update({
          ...session,
          user: {
            ...user,
            avatarUrl: result.data.avatarUrl,
          },
        });
        toast({
          title: 'Success',
          description: 'Avatar updated successfully.',
        });
      } else {
        throw new Error(result.error || 'Failed to update avatar.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        disabled={isUploading}
      />
      <Button
        onClick={handleAvatarClick}
        variant="ghost"
        className="relative h-24 w-24 rounded-full"
        disabled={isUploading}
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatarUrl ?? ''} alt={user.name ?? 'User'} />
          <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
            <CgSpinner className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </Button>
      <span className="mt-2 text-sm text-muted-foreground">Click to change</span>
    </div>
  );
}
