'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AvatarUploadModal } from '@/components/user-profile/AvatarUploadModal';

export function AvatarEditor() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAvatarUpdated = async () => {
    await update(); // Refrescar la sesión para obtener el nuevo avatar
  };

  if (!user) return null;

  return (
    <div className="relative flex flex-col items-center">
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="ghost"
        className="relative h-24 w-24 rounded-full"
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatarUrl ?? ''} alt={user.name ?? 'User'} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-white text-sm">Cambiar</span>
        </div>
      </Button>

      <AvatarUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </div>
  );
}
