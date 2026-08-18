"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { publicUrl } from "@/lib/storage-url";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

interface CartDrawerProps {
  storeSlug: string;
  brandName?: string;
  whatsappNumber?: string | null;
  whatsappTemplate?: string | null;
}

export function CartDrawer({
  storeSlug,
  brandName,
  whatsappNumber,
  whatsappTemplate,
}: CartDrawerProps) {
  const {
    cartItems,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  if (totalItems === 0 && !isCartOpen) return null;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckoutWA = async () => {
    if (cartItems.length === 0) return;
    setLoadingCheckout(true);

    const cleanNumber = formatWhatsAppNumber(whatsappNumber || "628123456789");

    // Format Multi-Product Message
    const itemsText = cartItems
      .map((item, index) => {
        const priceStr = item.price ? formatRupiah(item.price * item.qty) : "Harga hubungi admin";
        return `${index + 1}. *${item.name}* (x${item.qty}) - ${priceStr}`;
      })
      .join("\n");

    const totalText = totalPrice > 0 ? formatRupiah(totalPrice) : "Sesuai konfirmasi";
    const nameLine = customerName.trim() ? `Nama: *${customerName.trim()}*\n` : "";

    const message = `Halo Admin *${brandName || "Toko"}*,\n\n${nameLine}Saya ingin pesan produk berikut:\n\n${itemsText}\n\n*Total Estimasi*: ${totalText}\n\nMohon info ketersediaan stok & petunjuk pembayarannya. Terima kasih!`;

    // Record lead asynchronously
    try {
      await fetch("/api/order-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          customerName: customerName.trim() || "Pelanggan Katalog",
          itemsSummary: itemsText,
          totalPrice,
        }),
      });
    } catch (e) {
      console.warn("Log order lead warning:", e);
    }

    setLoadingCheckout(false);

    // Redirect to WhatsApp
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Slide-out Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex justify-end bg-black/60 duration-200 animate-in fade-in">
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl duration-300 animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-space text-base font-bold leading-tight text-foreground">
                    Keranjang Pesanan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} item dipilih dari {brandName || "toko"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-3 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Keranjang Anda Kosong</h4>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Pilih produk yang ingin Anda beli dari katalog untuk dimasukkan ke keranjang
                    pesanan.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const imgUrl = publicUrl("product-images", item.imagePath);
                  return (
                    <div
                      key={item.id}
                      className="shadow-xs flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-muted-foreground">
                            No Pic
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-semibold text-foreground">
                          {item.name}
                        </h4>
                        <p className="mt-0.5 font-mono text-xs font-bold text-primary">
                          {item.price ? formatRupiah(item.price) : "Hubungi Admin"}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-border bg-background">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 font-mono text-xs font-bold text-foreground">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cartItems.length > 0 && (
              <div className="space-y-4 border-t bg-muted/20 p-5">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-foreground">
                    Nama Pemesan <span className="text-muted-foreground">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama Anda..."
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs transition-colors focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Estimasi ({totalItems} Item):
                  </span>
                  <span className="font-mono font-space text-lg font-extrabold text-foreground">
                    {totalPrice > 0 ? formatRupiah(totalPrice) : "Sesuai konfirmasi"}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    size="lg"
                    onClick={handleCheckoutWA}
                    disabled={loadingCheckout}
                    className="w-full gap-2 bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-500"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Kirim Pesanan via WhatsApp
                  </Button>

                  <button
                    onClick={clearCart}
                    className="w-full py-1 text-center text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Bersihkan Keranjang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
