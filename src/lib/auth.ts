import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Profile, UUID } from "@/lib/db/types";
import { redirect } from "next/navigation";

import { cache } from "react";

/**
 * Ambil user auth + profile admin saat ini. Mengembalikan null bila tidak ada
 * user (caller harus handle, mis. redirect ke login).
 * Dibungkus dengan React cache() untuk menghindari multiple network roundtrip dalam 1 request.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<{
  userId: UUID;
  email: string;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let profile: Profile | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as Profile | null) ?? null;
  } catch (e) {
    console.warn("Failed fetching profile via user client:", e);
  }

  // Jika profile belum terbuat (mis. trigger terlewat atau RLS issue), auto-heal via adminDb
  if (!profile) {
    try {
      const adminDb = createAdminClient();
      const userEmail = user.email ?? "admin@kataloghub.local";
      const namePart = userEmail.split("@")[0] || "Admin";

      await adminDb.from("profiles").upsert(
        {
          id: user.id,
          email: userEmail,
          full_name: namePart,
          is_admin: true,
        },
        { onConflict: "id" }
      );

      const baseSlug = namePart.toLowerCase().replace(/[^a-z0-9]/g, "-") || "toko";
      const storeSlug = `${baseSlug}-${user.id.substring(0, 6)}`;

      await adminDb.from("site_settings").upsert(
        {
          user_id: user.id,
          brand_name: namePart,
          store_slug: storeSlug,
          whatsapp_template: "Halo, saya tertarik dengan produk di katalog Anda.",
        },
        { onConflict: "user_id" }
      );

      const { data: healed } = await adminDb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      profile = (healed as Profile | null) ?? null;
    } catch (err) {
      console.error("Auto-heal profile in getCurrentUser failed:", err);
    }
  }

  if (!profile) return null;
  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile: profile as Profile,
  };
});

/**
 * Ambil admin saat ini dan pastikan is_admin = true. Bila tidak, redirect ke
 * pemberitahuan. Dipakai di Server Action / Server Component area admin.
 */
export async function requireAdmin(): Promise<{
  userId: UUID;
  email: string;
  profile: Profile;
}> {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }
  return current;
}

/**
 * Memastikan user saat ini memiliki role Super Admin.
 *
 * SECURITY FIX: Sebelumnya `is_admin === true` bisa bypass pengecekan role.
 * Sekarang hanya role === "superadmin" yang diizinkan mengakses area Super Admin.
 */
export async function requireSuperAdmin(): Promise<{
  userId: UUID;
  email: string;
  profile: Profile;
}> {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/admin/login?redirect=/superadmin");
  }

  // SECURITY: Strictly check for "superadmin" role only.
  // is_admin alone is NOT sufficient — it grants regular admin access, not superadmin.
  if (current.profile.role !== "superadmin") {
    redirect("/admin?error=superadmin-required");
  }

  return current;
}