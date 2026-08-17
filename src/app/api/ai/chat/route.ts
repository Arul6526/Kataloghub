import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { completeForUser, getAssistantDomain } from "@/lib/ai/service";
import type { AiMessage } from "@/lib/ai/openai-compatible";
import type { AiAssistantDomain } from "@/lib/ai/types";
import { executeProductTool, PRODUCT_AI_TOOLS } from "@/lib/ai/tools";

const BASE_SYSTEM_PROMPT = `Kamu adalah KatalogHub AI Assistant. Jawab dalam Bahasa Indonesia kecuali pengguna meminta bahasa lain. Jangan mengarang data produk yang tidak diberikan. Jika diminta membuat konten media sosial, berikan caption, CTA, dan hashtag yang siap digunakan.`;

export async function POST(req: NextRequest) {
  try {
    const current = await requireAdmin();
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const allowedDomains: AiAssistantDomain[] = ["product", "marketing", "business", "sales"];
    const domain: AiAssistantDomain = allowedDomains.includes(body.domain)
      ? body.domain
      : "marketing";
    const requestedConversationId =
      typeof body.conversationId === "string" ? body.conversationId : null;

    if (body.confirmedAction?.name && body.confirmedAction?.arguments) {
      if (domain !== "product") {
        return NextResponse.json(
          { success: false, error: "Aksi tool hanya tersedia untuk Product AI." },
          { status: 400 },
        );
      }
      const result = await executeProductTool(
        current.userId,
        body.confirmedAction.name,
        body.confirmedAction.arguments,
      );
      return NextResponse.json({
        success: true,
        conversationId: requestedConversationId,
        message: result.message,
        toolResult: result,
      });
    }

    if (!message || message.length > 12_000) {
      return NextResponse.json(
        { success: false, error: "Pesan wajib diisi dan maksimal 12.000 karakter." },
        { status: 400 },
      );
    }

    const db = createAdminClient();
    const assistantDomain = await getAssistantDomain(domain);
    const { data: catalog } = await db
      .from("products")
      .select("name, description, price, is_visible")
      .eq("user_id", current.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    const { data: categories } = await db
      .from("categories")
      .select("id, name, slug")
      .eq("user_id", current.userId)
      .order("sort_order", { ascending: true });
    let conversationId = requestedConversationId;
    if (conversationId) {
      const { data: conversation } = await db
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", current.userId)
        .maybeSingle();
      if (!conversation) conversationId = null;
    }

    if (!conversationId) {
      const { data: conversation, error } = await db
        .from("ai_conversations")
        .insert({ user_id: current.userId, title: message.slice(0, 80) })
        .select("id")
        .single();
      if (error || !conversation) throw error || new Error("Gagal membuat percakapan.");
      conversationId = conversation.id;
    }

    await db.from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: current.userId,
      role: "user",
      content: message,
    });

    const { data: history } = await db
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .eq("user_id", current.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const catalogContext =
      (catalog || []).length || (categories || []).length
        ? `\n\nKonteks katalog toko (gunakan hanya sebagai referensi):\n${JSON.stringify({ categories, products: catalog })}`
        : "\n\nKatalog toko belum memiliki data produk.";
    const messages: AiMessage[] = [
      {
        role: "system",
        content: `${BASE_SYSTEM_PROMPT}\n\nPeran domain: ${assistantDomain.name}. ${assistantDomain.systemPrompt}${catalogContext}`,
      },
      ...((history || []).reverse() as AiMessage[]),
    ];
    const result = await completeForUser(
      current.userId,
      messages,
      conversationId,
      domain,
      domain === "product" ? PRODUCT_AI_TOOLS : [],
    );

    if (result.toolCalls?.length) {
      return NextResponse.json({
        success: true,
        conversationId,
        message: result.content || "Saya menemukan perubahan produk yang perlu dikonfirmasi.",
        pendingActions: result.toolCalls,
      });
    }

    await db.from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: current.userId,
      role: "assistant",
      content: result.content,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      provider_name: result.providerName,
      model: result.model,
    });
    await db
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", current.userId);

    return NextResponse.json({
      success: true,
      conversationId,
      domain,
      message: result.content,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI assistant gagal memproses permintaan.",
      },
      { status: 500 },
    );
  }
}
