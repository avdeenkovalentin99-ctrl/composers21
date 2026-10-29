import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { motion } from "motion/react";
import { optimizedImages, type OptimizedImage } from "../data/optimizedImages.generated";
import { resolvePublicAssetPath } from "../utils/assets";

const byUrl = new Map<string, OptimizedImage>(Object.values(optimizedImages).map(image => [image.src, image]));

export const PHOTO_FALLBACK_SRC = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="#f4f4f4"/><g fill="none" stroke="#8a8a8a" stroke-width="3"><rect x="438" y="239" width="84" height="66" rx="3"/><circle cx="461" cy="260" r="7"/><path d="m439 298 24-22 20 17 17-15 21 20"/></g><text x="480" y="365" text-anchor="middle" fill="#616161" font-family="Arial,sans-serif" font-size="30">Фото временно недоступно</text></svg>',
);

type ImageProps = ComponentPropsWithoutRef<"img"> & { coverAspectRatio?: number; fallbackSrc?: string };

export const ResponsiveImage = forwardRef<HTMLImageElement, ImageProps>(
  function ResponsiveImage({ src, sizes, coverAspectRatio, fallbackSrc, onError, ...props }, ref) {
    const [failedSource, setFailedSource] = useState<string | undefined | null>(null);
    const showingFallback = Boolean(fallbackSrc) && failedSource === src;
    const image = src ? optimizedImages[src] ?? byUrl.get(src) : undefined;
    // A landscape photo cropped into a portrait needs more source pixels than
    // the box width alone suggests. Keep the existing crop without softening it.
    const coverScale = image && coverAspectRatio ? Math.max(1, image.width / image.height / coverAspectRatio) : 1;
    const responsiveSizes = (sizes ?? "(min-width: 1024px) 50vw, 100vw")
      .replace(/(\d*\.?\d+)(px|vw)(?=\s*(?:,|$))/g, (_match, value, unit) => `${Math.ceil(Number(value) * coverScale)}${unit}`);
    return <img ref={ref}
      {...(showingFallback ? {
        src: fallbackSrc,
        ...(image ? { width: image.width, height: image.height } : {}),
      } : image ? {
        src: resolvePublicAssetPath(image.src),
        srcSet: image.srcSet.split(", ").map(candidate => {
          const [url, width] = candidate.split(" ");
          return `${resolvePublicAssetPath(url)} ${width}`;
        }).join(", "),
        sizes: responsiveSizes,
        width: image.width,
        height: image.height,
      } : { src, sizes })}
      {...props}
      onError={event => {
        onError?.(event);
        if (fallbackSrc && !showingFallback) setFailedSource(src);
      }}
    />;
  },
);

export const MotionImage = motion.create(ResponsiveImage);
