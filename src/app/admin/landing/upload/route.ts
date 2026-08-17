import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadFile, removeFile } from "@/lib/storage";

/**
 * Upload gambar section landing (hero background, about image) ke bucket landing-media.
 */
export async function POST(req: NextRequest) {
  await requireAdmin();
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "File wajib" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Hanya gambar" }, { status: 400 });
  }
  try {
    const upload = await uploadFile("landing-media", file, "landing");
    return NextResponse.json({ ok: true, path: upload.path });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload gagal" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const { path } = await req.json();
  await removeFile("landing-media", path);
  return NextResponse.json({ ok: true });
}