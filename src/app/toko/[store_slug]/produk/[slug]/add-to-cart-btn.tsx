"use client";

import { useState } from "react";
import { useCart } from "@/components/public/cart-context";
import { ShoppingBag, Check } from "lucide-react";

export function AddToCartBtn({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | null;
    main_image_path: string | null;
  };
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imagePath: product.main_image_path,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 flex h-14 sm:h-16 items-center justify-center gap-2.5 rounded-2xl bg-primary/10 text-primary border-2 border-primary/40 text-sm sm:text-base font-extrabold shadow-sm transition-all hover:bg-primary/20 active:scale-98"
    >
      {added ? <Check className="h-5 w-5 text-emerald-600 shrink-0" /> : <ShoppingBag className="h-5 w-5 shrink-0" />}
      <span>{added ? "Tersimpan di Keranjang!" : "+ Keranjang Belanja"}</span>
    </button>
  );
}
