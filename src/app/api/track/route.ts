import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sanitizeText, isPayloadTooLarge } from "@/lib/security/input-validator";

// Hashing function for IP + UserAgent to create a session ID
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Input Validation ──
    if (isPayloadTooLarge(body, 2_000)) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }

    const { path } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // Sanitize path — only allow safe URL path characters
    const safePath = sanitizeText(path, 500).replace(/[<>"'`;]/g, "");
    if (!safePath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    ip = ip.split(",")[0].trim();
    
    const userAgent = req.headers.get("user-agent") || "unknown-ua";
    
    // Hash them to create an anonymous session string (to protect privacy)
    // We add the current date (YYYY-MM-DD) so sessions are daily unique.
    const today = new Date().toISOString().split("T")[0];
    const rawString = `${ip}-${userAgent}-${today}`;
    const sessionHash = await hashString(rawString);

    const supabase = createAdminClient();
    
    // Insert into page_views
    const { error } = await supabase.from("page_views").insert({
      path: safePath,
      session_hash: sessionHash
    });

    if (error) {
      console.error("[Track API] Supabase error:", error.message);
      return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Track API] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
