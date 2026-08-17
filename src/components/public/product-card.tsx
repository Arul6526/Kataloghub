"use client";

import Link from "next/link";
import Image from "next/image";
import { publicUrl } from "@/lib/storage-url";
import { formatRupiah } from "@/lib/utils";
import type { PublicProductListItem } from "@/lib/public-data";
import { useCart } from "./cart-context";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product, storeSlug, showPrice }: { product: PublicProductListItem; storeSlug?: string; showPrice?: boolean }) {
  const imgSrc = publicUrl("product-images", product.main_image_path);
  const basePath = storeSlug ? `/toko/${storeSlug}` : "";
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imagePath: product.main_image_path,
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 hover:ring-1 hover:ring-primary/20">
      <Link href={`${basePath}/produk/${product.slug}`} className="block relative aspect-square w-full overflow-hidden bg-muted/50">
        {imgSrc ? (
          <>
            <Image
              src={imgSrc}
              alt={product.main_image_alt || product.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs p-4 text-center">
            {product.name}
          </div>
        )}

        {product.category_name && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-block rounded-md bg-background/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm border border-border/40">
              {product.category_name}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <Link href={`${basePath}/produk/${product.slug}`} className="space-y-1 block">
          <h3 className="font-semibold leading-snug text-xs sm:text-sm tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.summary && (
            <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
              {product.summary}
            </p>
          )}
        </Link>

        {/* Card Footer: Price & Add To Cart Button */}
        <div className="mt-3 pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            {showPrice && product.price != null ? (
              <span className="text-xs sm:text-sm font-extrabold text-primary tracking-tight font-mono block truncate">
                {formatRupiah(product.price)}
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block truncate">
                Spesifikasi Lengkap
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex h-9 sm:h-10 items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 rounded-xl transition-all shadow-xs shrink-0 w-full sm:w-auto active:scale-98"
            title="Tambah ke Keranjang Pesanan"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span>+ Beli</span>
          </button>
        </div>
      </div>
    </div>
  );
}
