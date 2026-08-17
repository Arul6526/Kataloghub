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
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

interface CartDrawerProps {
  storeSlug: string;
  brandName?: string;
  whatsappNumber?: string | null;
  whatsappTemplate?: string | null;
}

export function CartDrawer({ storeSlug, brandName, whatsappNumber, whatsappTemplate }: CartDrawerProps) {
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
    let itemsText = cartItems
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative flex h-full w-full max-w-md flex-col bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-space font-bold text-foreground text-base leading-tight">
                    Keranjang Pesanan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} item dipilih dari {brandName || "toko"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm">Keranjang Anda Kosong</h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Pilih produk yang ingin Anda beli dari katalog untuk dimasukkan ke keranjang pesanan.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const imgUrl = publicUrl("product-images", item.imagePath);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 p-3 shadow-xs transition-colors hover:border-primary/40"
                    >
                      <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                            No Pic
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-foreground truncate">{item.name}</h4>
                        <p className="text-xs font-bold font-mono text-primary mt-0.5">
                          {item.price ? formatRupiah(item.price) : "Hubungi Admin"}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center rounded-lg border border-border bg-background">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-lg transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 font-mono text-xs font-bold text-foreground">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-lg transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
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
              <div className="border-t bg-muted/20 p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground block">
                    Nama Pemesan <span className="text-muted-foreground">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama Anda..."
                    className="w-full h-9 px-3 text-xs border border-border rounded-lg bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex justify-between items-baseline border-t border-border/60 pt-3">
                  <span className="text-xs font-medium text-muted-foreground">Total Estimasi ({totalItems} Item):</span>
                  <span className="font-space font-extrabold text-lg text-foreground font-mono">
                    {totalPrice > 0 ? formatRupiah(totalPrice) : "Sesuai konfirmasi"}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    size="lg"
                    onClick={handleCheckoutWA}
                    disabled={loadingCheckout}
                    className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Kirim Pesanan via WhatsApp
                  </Button>

                  <button
                    onClick={clearCart}
                    className="w-full text-[11px] text-muted-foreground hover:text-destructive transition-colors text-center py-1"
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
