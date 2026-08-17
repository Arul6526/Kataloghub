import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export interface LogAuditParams {
  actionType: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}

/**
 * Mencatat peristiwa audit ke dalam tabel `platform_audit_logs`.
 * Secara otomatis mengambil data user/superadmin yang sedang aktif.
 */
export async function logAuditEvent({
  actionType,
  targetType = "platform",
  targetId,
  details = {},
}: LogAuditParams): Promise<boolean> {
  try {
    const supabase = await createClient();
    const current = await getCurrentUser();

    const { error } = await supabase.from("platform_audit_logs").insert({
      actor_id: current?.userId ?? null,
      actor_email: current?.email ?? "system",
      action_type: actionType,
      target_type: targetType,
      target_id: targetId ?? null,
      details,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("[Audit Log] Failed to insert audit log:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Audit Log] Exception while logging event:", err);
    return false;
  }
}
