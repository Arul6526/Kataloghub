import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-error";
import * as xlsx from "xlsx";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { userId } = await requireAdmin();
  const supabase = createAdminClient();

    // Fetch all products for the user
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        price,
        is_visible,
        sort_order,
        category:categories (
          name
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data for Excel
    const rows = (products || []).map((p: any) => ({
      ID: p.id, // Kunci utama untuk import
      "Nama Produk": p.name,
      Kategori: p.category?.name || "-",
      Slug: p.slug,
      "Harga (Rp)": p.price ?? "",
      "Tampilkan di Toko": p.is_visible ? "Ya" : "Tidak",
      "Urutan Tampil": p.sort_order,
    }));

    // Generate Excel workbook
    const worksheet = xlsx.utils.json_to_sheet(rows);
    
    // Atur lebar kolom
    worksheet["!cols"] = [
      { wch: 38 }, // ID (UUID)
      { wch: 40 }, // Nama
      { wch: 25 }, // Kategori
      { wch: 30 }, // Slug
      { wch: 15 }, // Harga
      { wch: 20 }, // Tampilkan
      { wch: 15 }, // Urutan
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Produk");

    // Tulis ke buffer
    const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Kembalikan sebagai file unduhan
    const now = new Date().toISOString().split("T")[0];
    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="katalog-produk-${now}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
});
