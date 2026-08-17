import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Endpoint bootstrap admin pertama.
 * Hanya bekerja bila belum ada admin sama sekali (has_no_admin() = true).
 */
export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  const { data: noAdmin } = await supabase.rpc("has_no_admin").single();
  if (!noAdmin) {
    return NextResponse.json({ error: "Admin sudah ada. Bootstrap ditutup." }, { status: 403 });
  }

  const body = await req.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan kata sandi wajib diisi" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Kata sandi minimal 8 karakter" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || "Gagal membuat user" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();

  if (!profile?.is_admin) {
    await supabase.from("profiles").update({ is_admin: true }).eq("id", data.user.id);
  }

  return NextResponse.json({ ok: true, email });
}
