"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = { role: "user" | "assistant"; content: string };
type PendingAction = { id: string; name: string; arguments: Record<string, unknown> };
type AiAssistantDomain = "product" | "marketing" | "business" | "sales";

const DOMAINS: { value: AiAssistantDomain; label: string; description: string }[] = [
  { value: "product", label: "Product AI", description: "Produk & katalog" },
  { value: "marketing", label: "Marketing AI", description: "Konten & media sosial" },
  { value: "business", label: "Business AI", description: "Analisis bisnis" },
  { value: "sales", label: "Sales AI", description: "Penjualan & pelanggan" },
];

export function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [domain, setDomain] = useState<AiAssistantDomain>("marketing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  async function sendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    setError("");
    setPendingActions([]);
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId, domain }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.error || "AI assistant gagal memproses pesan.");
      setConversationId(result.conversationId);
      setMessages((current) => [...current, { role: "assistant", content: result.message }]);
      setPendingActions(result.pendingActions || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmAction(action: PendingAction) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, conversationId, confirmedAction: action }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Aksi produk gagal.");
      setMessages((current) => [...current, { role: "assistant", content: result.message }]);
      setPendingActions((current) => current.filter((item) => item.id !== action.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Aksi produk gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col gap-5 pb-10">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="h-6 w-6 text-emerald-600" /> AI Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat konten, kelola katalog, dan kembangkan ide marketing dengan konteks toko Anda.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {DOMAINS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setDomain(item.value);
              setConversationId(null);
              setMessages([]);
            }}
            className={`rounded-xl border p-3 text-left transition-colors ${domain === item.value ? "border-emerald-500 bg-emerald-500/10" : "bg-card hover:bg-muted"}`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        {messages.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Sparkles className="mb-3 h-8 w-8 text-emerald-500" />
            <h2 className="font-semibold">Mulai dari ide sederhana</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Contoh: “Buatkan caption Instagram untuk promo paket alat tulis sekolah dengan gaya
              ramah.”
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[85%] gap-2 rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {message.role === "assistant" ? (
                <Bot className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Assistant sedang berpikir...
          </div>
        )}
        {pendingActions.length > 0 && (
          <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold">Konfirmasi perubahan produk</p>
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background/70 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {action.name === "create_product" ? "Buat produk baru" : "Perbarui produk"}
                  </p>
                  <pre className="mt-1 max-w-xl overflow-auto text-xs text-muted-foreground">
                    {JSON.stringify(action.arguments, null, 2)}
                  </pre>
                </div>
                <Button type="button" disabled={loading} onClick={() => void confirmAction(action)}>
                  Konfirmasi
                </Button>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
      </div>
      <form
        onSubmit={sendMessage}
        className="flex items-end gap-2 rounded-2xl border bg-card p-3 shadow-sm"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="Tulis permintaan Anda..."
          rows={2}
          className="resize-none border-0 shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          size="icon"
          className="shrink-0 rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
