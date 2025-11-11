"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import type { Image as ProductImage } from "@/lib/types";

interface ImageUploadProps {
  newFiles: File[];
  existingImages: ProductImage[];
  coverImage: File | { url: string } | null;
  onNewFilesChange: (files: File[]) => void;
  onExistingImagesChange: (images: ProductImage[]) => void;
  onCoverImageChange: (file: File | { url: string } | null) => void;
}

export function ImageUpload({
  newFiles,
  existingImages,
  coverImage,
  onNewFilesChange,
  onExistingImagesChange,
  onCoverImageChange,
}: ImageUploadProps) {
  const { toast } = useToast();

  const totalImages = newFiles.length + existingImages.length;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (totalImages + acceptedFiles.length > 10) {
        toast({
          title: "Límite de imágenes excedido",
          description: "Puedes subir un máximo de 10 imágenes.",
          variant: "destructive",
        });
        return;
      }
      onNewFilesChange([...newFiles, ...acceptedFiles]);
    },
    [newFiles, onNewFilesChange, totalImages, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemoveNewFile = (file: File) => {
    onNewFilesChange(newFiles.filter((f) => f !== file));
    if (coverImage === file) {
      onCoverImageChange(null);
    }
  };

  const handleRemoveExistingFile = (image: ProductImage) => {
    onExistingImagesChange(existingImages.filter((img) => img.url !== image.url));
    if (coverImage && "url" in coverImage && coverImage.url === image.url) {
      onCoverImageChange(null);
    }
  };

  const handleSetCover = (image: File | ProductImage) => {
    onCoverImageChange(image);
  };

  const isCover = (image: File | ProductImage) => {
    if (!coverImage) return false;
    if (image instanceof File && coverImage instanceof File) {
      return image === coverImage;
    }
    if (! (image instanceof File) && ! (coverImage instanceof File)) {
      return image.url === coverImage.url;
    }
    return false;
  };

  return (
    <div>
      {totalImages === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4">
            <UploadCloud className="w-12 h-12 text-gray-400" />
            {isDragActive ? (
              <p>Suelta las imágenes aquí...</p>
            ) : (
              <p>
                Arrastra y suelta algunas imágenes aquí, o haz clic para
                seleccionarlas
              </p>
            )}
            <p className="text-xs text-gray-500">
              Máximo 10 imágenes, hasta 10MB cada una.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {existingImages.map((image) => (
            <div key={image.url} className="relative group">
              <Image
                src={image.url}
                alt={image.url}
                width={100}
                height={100}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute top-0 right-0 flex flex-col p-1 bg-black bg-opacity-50 rounded-bl-lg">
                <button
                  type="button"
                  onClick={() => handleSetCover(image)}
                  className="p-1 text-white hover:text-green-400"
                  title="Marcar como portada"
                >
                  <CheckCircle
                    className={`w-5 h-5 ${isCover(image) ? "text-green-400" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveExistingFile(image)}
                  className="p-1 text-white hover:text-red-500"
                  title="Eliminar imagen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {isCover(image) && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs text-center py-1 rounded-b-lg">
                  Portada
                </div>
              )}
            </div>
          ))}
          {newFiles.map((file, index) => (
            <div key={file.name + index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute top-0 right-0 flex flex-col p-1 bg-black bg-opacity-50 rounded-bl-lg">
                <button
                  type="button"
                  onClick={() => handleSetCover(file)}
                  className="p-1 text-white hover:text-green-400"
                  title="Marcar como portada"
                >
                  <CheckCircle
                    className={`w-5 h-5 ${isCover(file) ? "text-green-400" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveNewFile(file)}
                  className="p-1 text-white hover:text-red-500"
                  title="Eliminar imagen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {isCover(file) && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs text-center py-1 rounded-b-lg">
                  Portada
                </div>
              )}
            </div>
          ))}
          {totalImages < 10 && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center border-gray-300 hover:border-primary h-32"
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-8 h-8 text-gray-400" />
              <p className="text-sm mt-2">Añadir más</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}