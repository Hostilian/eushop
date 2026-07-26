---
name: eushop-nextjs-image-optimisation
description: Next.js Image Optimisation Skill — next/image component patterns, WebP/AVIF configuration, CDN cache headers, and static export compatibility.
---

# Next.js Image Optimisation

## next/image Usage
```tsx
// Always use next/image for product images
import Image from 'next/image';

export function ProductImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}  // REQUIRED — accessibility + allergen product identification
      width={800}
      height={800}
      quality={85}
      format="webp"
      placeholder="blur"
      blurDataURL={generateBlurPlaceholder()}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}
```

## Static Export Compatibility
With `output: 'export'` in next.config.js, next/image requires a custom loader:
```js
// next.config.js
module.exports = {
  output: 'export',
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    unoptimized: false,  // Use CDN-side optimisation
  },
};
```

## CDN Cache Headers
```
Cache-Control: public, max-age=31536000, immutable
```
Use content-hash filenames to enable permanent caching.

## Alt Text Requirements
- Never: `alt="image"`, `alt="photo"`, `alt="img_1234.jpg"`
- Required: Descriptive text identifying the product and key visual attributes
- Allergen note: For food products, alt text should mention allergen-relevant visuals (e.g. "Bread containing gluten")
