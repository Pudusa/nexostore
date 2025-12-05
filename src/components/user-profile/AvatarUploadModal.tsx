"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area, Point } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Slider } from "@/src/components/ui/slider";
import { getCroppedImg } from "@/src/lib/utils"; // Necesitará una función de utilidad para esto
import { useToast } from "@/src/hooks/use-toast";
import { updateMyAvatar } from "@/src/lib/api"; // Server Action para subir avatar
import { useRouter } from "next/navigation";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated?: () => void;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  onAvatarUpdated,
}: AvatarUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "La imagen no puede exceder los 5MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result as string));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, _croppedAreaPixels: Area) => {
      setCroppedAreaPixels(_croppedAreaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const formData = new FormData();
      formData.append("avatar", croppedImageBlob, "avatar.webp"); // Nombre de archivo genérico y formato webp

      await updateMyAvatar(formData); // Llama a la Server Action
      toast({
        title: "Éxito",
        description: "Tu avatar ha sido actualizado.",
      });
      onAvatarUpdated?.();
      router.refresh(); // Refrescar la página para mostrar el nuevo avatar
      onClose();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Hubo un error al actualizar tu avatar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [imageSrc, croppedAreaPixels, toast, onAvatarUpdated, router, onClose]);

  const handleClose = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Avatar</DialogTitle>
        </DialogHeader>
        {!imageSrc ? (
          <div className="grid gap-4 py-4">
            <input type="file" accept="image/*" onChange={onFileChange} />
            <p className="text-sm text-gray-500">Máximo 5MB, formatos JPG, PNG, WEBP.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full h-[300px]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Para un recorte cuadrado inicial
                cropShape="round" // Esto hace el recorte circular
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={false}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FormLabel>Zoom</FormLabel>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={[zoom]}
                onValueChange={(val) => setZoom(val[0])}
                className="w-full"
              />
            </div>
            <Button onClick={showCroppedImage} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Avatar"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}