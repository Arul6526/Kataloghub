import Link from "next/link";
import Image from "next/image";
import { publicUrl } from "@/lib/storage-url";
import { ArrowRight } from "lucide-react";
import type { PublicCategory } from "@/lib/public-data";
import { CategoryIcon } from "@/components/public/category-icon";

export function CategoryCard({ category, storeSlug }: { category: PublicCategory; storeSlug?: string }) {
  const imgSrc = publicUrl("category-media", category.image_path);
  const basePath = storeSlug ? `/toko/${storeSlug}` : "";

  return (
    <Link
      href={`${basePath}/kategori/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={category.image_alt || category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/5 text-primary">
            <CategoryIcon name={category.name} className="h-14 w-14 opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {category.product_count} produk
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </div>
    </Link>
  );
}
