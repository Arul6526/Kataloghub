"use client";

import React, { useState, useRef } from "react";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Send, 
  Search, 
  Store, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  ShoppingBag,
  Sparkles,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/utils";
import type { Product } from "@/lib/db/types";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface POSNotaClientProps {
  products: Pick<Product, "id" | "name" | "price" | "slug">[];
  brandName: string;
  brandTagline: string;
  whatsappNumber: string;
  storeSlug: string;
}

export function POSNotaClient({
  products,
  brandName,
  brandTagline,
  whatsappNumber,
  storeSlug,
}: POSNotaClientProps) {
  /* ---- Form State ---- */
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"LUNAS" | "BELUM_LUNAS">("LUNAS");
  const [paymentMethod, setPaymentMethod] = useState("Transfer / QRIS");
  const [discount, setDiscount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  
  /* ---- Selected Items State ---- */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- Custom Item State ---- */
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const receiptRef = useRef<HTMLDivElement>(null);

  /* ---- Filter catalog products ---- */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---- Cart Handlers ---- */
  const handleAddProduct = (prod: Pick<Product, "id" | "name" | "price">) => {
    const existing = cart.find((item) => item.id === prod.id);
    const itemPrice = prod.price ?? 0;
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === prod.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        { id: prod.id, name: prod.name, price: itemPrice, qty: 1 },
      ]);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice) return;
    const priceNum = parseInt(customPrice, 10) || 0;
    const newItemId = `custom-${Date.now()}`;
    setCart([
      ...cart,
      { id: newItemId, name: customName.trim(), price: priceNum, qty: 1 },
    ]);
    setCustomName("");
    setCustomPrice("");
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  /* ---- Computations ---- */
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  /* ---- Generate Receipt ID & Date ---- */
  const today = new Date();
  const receiptNo = `NOTA-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateFormatted = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ---- Share to WhatsApp ---- */
  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    let text = `*NOTA PEMBAYARAN RESMI*\n`;
    text += `*${brandName || "Toko Kami"}*\n`;
    text += `-----------------------------------\n`;
    text += `No. Nota : ${receiptNo}\n`;
    text += `Tanggal  : ${dateFormatted}\n`;
    if (customerName) text += `Pelanggan: ${customerName}\n`;
    text += `Status   : ${paymentStatus === "LUNAS" ? "✅ LUNAS" : "⏳ BELUM LUNAS"}\n`;
    text += `Metode   : ${paymentMethod}\n`;
    text += `-----------------------------------\n\n`;
    text += `*RINCIAN PESANAN:*\n`;

    cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name}\n   ${item.qty}x @ ${formatRupiah(item.price)} = *${formatRupiah(item.price * item.qty)}*\n`;
    });

    text += `\n-----------------------------------\n`;
    text += `Subtotal    : ${formatRupiah(subtotal)}\n`;
    if (discount > 0) text += `Diskon      : -${formatRupiah(discount)}\n`;
    if (shippingCost > 0) text += `Ongkos Kirim: ${formatRupiah(shippingCost)}\n`;
    text += `*TOTAL BAYAR: ${formatRupiah(grandTotal)}*\n`;
    text += `-----------------------------------\n`;
    text += `Terima kasih telah berbelanja di *${brandName}*! 🙏\n`;

    let cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(waUrl, "_blank");
  };

  /* ---- Print Handler ---- */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* ACTION BAR (HIDDEN ON PRINT) */}
      <div className="print:hidden rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-space text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Kasir Ringkas & Rekap Nota Digital 1-Klik
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Buat rincian belanjaan, buat nota struk resmi, dan kirimkan langsung bukti transaksi ke WhatsApp pembeli.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleSendWhatsApp}
              disabled={cart.length === 0}
              className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-4 w-4" /> Kirim Nota via WhatsApp
            </Button>

            <Button
              onClick={handlePrint}
              disabled={cart.length === 0}
              variant="outline"
              className="gap-2 text-xs font-bold"
            >
              <Printer className="h-4 w-4" /> Cetak Struk (PDF/Thermal)
            </Button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN INTERACTIVE POS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* LEFT COLUMN: PRODUCT SELECTION & CALCULATOR (HIDDEN ON PRINT) */}
        <div className="lg:col-span-6 space-y-5 print:hidden">
          
          {/* CUSTOMER & PAYMENT DETAILS CARD */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-space text-sm font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Informasi Pelanggan & Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nama Pelanggan (Opsional)</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Misal: Bu Nina Kawalu"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">No. WhatsApp Pembeli (Opsional)</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08123456789"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Status Pembayaran</Label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="LUNAS">✅ LUNAS (Sudah Bayar)</option>
                  <option value="BELUM_LUNAS">⏳ BELUM LUNAS (Pending)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Metode Pembayaran</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Tunai / Cash">💵 Tunai / Cash</option>
                  <option value="Transfer / QRIS">💳 Transfer Bank / QRIS</option>
                  <option value="COD (Cash on Delivery)">🚚 COD (Bayar di Tempat)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CATALOG PRODUCT PICKER */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-space text-sm font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Pilih dari Katalog Produk Toko
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono font-bold">
                {products.length} Item Tersedia
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk katalog..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Product Chips / List */}
            <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Tidak ada produk ditemukan.</p>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/60 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{prod.name}</p>
                      <p className="text-[11px] text-primary font-mono font-semibold">
                        {formatRupiah(prod.price ?? 0)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddProduct(prod)}
                      className="h-7 px-3 text-xs gap-1 font-bold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Non-Catalog Item */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <p className="text-xs font-bold text-foreground">tambah Item Kustom (Luar Katalog):</p>
              <form onSubmit={handleAddCustomItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nama barang kustom..."
                  className="sm:col-span-6 h-8 text-xs"
                />
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Harga (Rp)"
                  className="sm:col-span-4 h-8 text-xs"
                />
                <Button type="submit" size="sm" className="sm:col-span-2 h-8 text-xs font-bold">
                  + Item
                </Button>
              </form>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: DIGITAL RECEIPT PREVIEW (PRINT TARGET) */}
        <div className="lg:col-span-6 flex justify-center">
          
          <div
            ref={receiptRef}
            className="w-full max-w-[420px] bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-slate-300 flex flex-col justify-between space-y-6 print:w-full print:border-none print:shadow-none print:p-0"
          >
            {/* RECEIPT HEADER */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
              <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Store className="h-3.5 w-3.5 text-blue-400" /> {brandName || "Toko Kami"}
              </div>
              <h3 className="font-space text-base font-bold text-slate-800 pt-1">
                STRUK NOTA PEMBAYARAN
              </h3>
              <p className="text-[10px] text-slate-500">{brandTagline || "Katalog & Penjualan Resmi Toko"}</p>

              <div className="pt-2 flex justify-between text-[11px] font-mono text-slate-600">
                <span>No: {receiptNo}</span>
                <span>{dateFormatted}</span>
              </div>
              {customerName && (
                <div className="text-left text-[11px] font-semibold text-slate-700 pt-1">
                  Pelanggan: {customerName}
                </div>
              )}
            </div>

            {/* ITEM TABLE */}
            <div className="space-y-3 min-h-[140px]">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <Receipt className="h-8 w-8 mx-auto opacity-30 mb-2" />
                  Belum ada item ditambahkan ke nota.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <div className="space-y-0.5 max-w-[200px]">
                      <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {item.qty} x {formatRupiah(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(item.price * item.qty)}
                      </span>
                      
                      {/* Qty & Delete controls (Hidden on Print) */}
                      <div className="flex items-center gap-1 print:hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="h-5 w-5 bg-slate-100 text-slate-700 font-bold rounded flex items-center justify-center hover:bg-slate-200"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="h-5 w-5 bg-slate-100 text-slate-700 font-bold rounded flex items-center justify-center hover:bg-slate-200"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-5 w-5 text-red-500 hover:text-red-700 flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TOTALS & SUMMARY */}
            <div className="border-t-2 border-slate-900 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">{formatRupiah(subtotal)}</span>
              </div>

              {/* Discount Input in Preview */}
              <div className="flex justify-between items-center text-slate-600 print:flex">
                <span className="print:inline">Diskon</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 print:hidden">-Rp</span>
                  <input
                    type="number"
                    value={discount || ""}
                    onChange={(e) => setDiscount(parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="w-20 text-right font-mono text-xs border border-slate-200 rounded px-1 py-0.5 print:border-none print:p-0"
                  />
                </div>
              </div>

              {/* Shipping Input in Preview */}
              <div className="flex justify-between items-center text-slate-600 print:flex">
                <span className="print:inline">Ongkos Kirim</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 print:hidden">+Rp</span>
                  <input
                    type="number"
                    value={shippingCost || ""}
                    onChange={(e) => setShippingCost(parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="w-20 text-right font-mono text-xs border border-slate-200 rounded px-1 py-0.5 print:border-none print:p-0"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-200 text-slate-900">
                <span>TOTAL AKHIR</span>
                <span className="font-mono text-base text-blue-600">{formatRupiah(grandTotal)}</span>
              </div>

              {/* Payment Status Badge */}
              <div className="pt-3 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500">Metode: {paymentMethod}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    paymentStatus === "LUNAS"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {paymentStatus === "LUNAS" ? "✅ LUNAS" : "⏳ BELUM LUNAS"}
                </span>
              </div>
            </div>

            {/* RECEIPT FOOTER */}
            <div className="text-center border-t border-dashed border-slate-300 pt-4 space-y-1">
              <p className="text-xs font-bold text-slate-800">Terima Kasih Atas Kepercayaan Anda!</p>
              <p className="text-[10px] text-slate-500">
                Struk ini merupakan bukti transaksi pembayaran resmi.
              </p>
              <p className="text-[9px] font-mono text-blue-600 font-bold pt-1">
                kataloghub.com/toko/{storeSlug}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
