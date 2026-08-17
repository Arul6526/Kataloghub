"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  src: string;
  alt: string;
}

interface ProductGalleryClientProps {
  mainImage: GalleryImage | null;
  gallery: GalleryImage[];
}

export function ProductGalleryClient({ mainImage, gallery }: ProductGalleryClientProps) {
  // Combine all images: main image first, then gallery images.
  const allImages = React.useMemo(() => {
    const images: GalleryImage[] = [];
    if (mainImage && mainImage.src) images.push(mainImage);
    
    gallery.forEach((g) => {
      if (g.src) images.push(g);
    });
    
    // filter out duplicates by src just in case
    return images.filter((img, index, self) => 
      index === self.findIndex((t) => t.src === img.src)
    );
  }, [mainImage, gallery]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      setSelectedIndex(index);
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Tidak ada gambar
        </div>
      </div>
    );
  }

  const activeImage = allImages[selectedIndex] || allImages[0];

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted shadow-xs">
        <Image
          src={activeImage.src}
          alt={activeImage.alt || "Gambar Produk"}
          fill
          className="object-contain p-2 sm:p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails Carousel */}
      {allImages.length > 1 && (
        <div className="relative px-7 sm:px-8">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2">
              {allImages.map((img, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-muted transition-all",
                    selectedIndex === index 
                      ? "border-primary shadow-xs" 
                      : "border-transparent hover:border-muted-foreground/50 opacity-70 hover:opacity-100"
                  )}
                  onClick={() => onThumbClick(index)}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur-xs shadow-sm hover:bg-muted z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur-xs shadow-sm hover:bg-muted z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
