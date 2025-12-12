'use client';

import React, { useState, useEffect } from 'react';
import NextImage, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  blurOnLoading?: boolean;
  placeholderColor?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  priority = false,
  loading = 'lazy',
  quality = 75,
  blurOnLoading = true,
  placeholderColor = 'bg-gray-200',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Determine if the image is external or needs format optimization
  const isExternalImage = src.startsWith('http');
  const optimizedSrc = isExternalImage ? src : src;

  return (
    <div className={`relative overflow-hidden ${placeholderColor} ${props.className || ''}`}>
      <NextImage
        {...props}
        src={imageSrc}
        priority={priority}
        loading={loading}
        quality={quality}
        onError={handleError}
        unoptimized={false} // Let Next.js handle optimization
        className={`w-full h-full object-cover ${blurOnLoading ? 'transition-opacity duration-300' : ''} ${props.className || ''}`}
        placeholder={blurOnLoading ? 'blur' : undefined}
        blurDataURL={blurOnLoading ? props.blurDataURL || 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==' : undefined}
      />
      {blurOnLoading && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </div>
  );
};

export default OptimizedImage;