import React, { useState } from 'react';

interface ProductImageProps {
  sku?: string;
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
}

const LOCAL_SKU_IMAGE_MAP: Record<string, string> = {
  'SKU-BS-075': '/images/products/sku-bs-075.svg',
  'SKU-DT-1KG': '/images/products/sku-dt-1kg.svg',
  'SKU-TE-250': '/images/products/sku-te-250.svg',
  'SKU-BS-120': '/images/products/sku-bs-120.svg',
  'SKU-ND-070': '/images/products/sku-nd-070.svg',
};

const FALLBACK_IMAGE = '/images/products/placeholder-case.svg';

/**
 * Optimized product image component:
 * - Resolves known SKUs directly to instant local vector assets (< 2KB, 0ms external DNS/TLS overhead on 3G)
 * - Gracefully supports custom external URLs with async decoding, lazy loading, and broken-URL fallback
 * - Preserves explicit intrinsic width/height to eliminate Cumulative Layout Shift (CLS)
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  sku,
  src,
  alt,
  className = '',
  width = 400,
  height = 300,
  eager = false,
}) => {
  const [hasFailed, setHasFailed] = useState(false);

  const normalizedSku = sku?.toUpperCase().trim() || '';
  const localAsset = normalizedSku ? LOCAL_SKU_IMAGE_MAP[normalizedSku] : undefined;

  // Prefer instant local asset when SKU matches or when stored src is an unoptimized Unsplash URL / empty string
  const isUnoptimizedExternal = !src || src.includes('images.unsplash.com');
  const resolvedSrc = hasFailed
    ? localAsset || FALLBACK_IMAGE
    : localAsset && isUnoptimizedExternal
    ? localAsset
    : src || localAsset || FALLBACK_IMAGE;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (!hasFailed) setHasFailed(true);
      }}
      className={className}
    />
  );
};

