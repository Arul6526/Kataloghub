import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Endpoint login: verifikasi email/password via Supabase Auth,
 * pastikan user memiliki profil terdaftar (auto-heal jika terlewat).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const redirectTo = String(body.redirectTo ?? "/admin");

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan kata sandi wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json(
      { error: "Email atau kata sandi salah" },
      { status: 401 },
    );
  }

  // Pastikan user memiliki profil terdaftar di sistem (Auto-heal jika terlewat)
  let profile = null;
  try {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", data.user.id)
      .maybeSingle();
    profile = existingProfile;
  } catch (err) {
    console.warn("Failed querying profile in login action:", err);
  }

  if (!profile) {
    try {
      const adminDb = createAdminClient();
      const namePart = email.split("@")[0] || "Admin";

      await adminDb.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email ?? email,
          full_name: namePart,
          is_admin: true,
        },
        { onConflict: "id" }
      );

      const baseSlug = namePart.toLowerCase().replace(/[^a-z0-9]/g, "-") || "toko";
      const storeSlug = `${baseSlug}-${data.user.id.substring(0, 6)}`;

      await adminDb.from("site_settings").upsert(
        {
          user_id: data.user.id,
          brand_name: namePart,
          store_slug: storeSlug,
          whatsapp_template: "Halo, saya tertarik dengan produk di katalog Anda.",
        },
        { onConflict: "user_id" }
      );
    } catch (e) {
      console.error("Auto-heal profile login error:", e);
    }
  }

  return NextResponse.json({ ok: true, redirectTo });
}
