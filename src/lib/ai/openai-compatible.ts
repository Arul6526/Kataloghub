export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: Record<string, unknown>[];
}

export interface AiToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AiCompletionResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  toolCalls?: AiToolCall[];
}

export function validateAiBaseUrl(value: string): string {
  const url = new URL(value);
  const blockedHosts = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
  const host = url.hostname.toLowerCase();
  const isPrivateIp =
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host);

  if (url.protocol !== "https:" || blockedHosts.has(host) || isPrivateIp) {
    throw new Error("Base URL AI harus menggunakan HTTPS dan host publik.");
  }
  return value.replace(/\/$/, "");
}

function estimateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}

export async function createOpenAiCompatibleCompletion(
  options: AiCompletionOptions,
): Promise<AiCompletionResult> {
  const response = await fetch(`${validateAiBaseUrl(options.baseUrl)}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1200,
      ...(options.tools?.length ? { tools: options.tools, tool_choice: "auto" } : {}),
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || payload?.message || `AI provider error (${response.status})`,
    );
  }

  const assistantMessage = payload?.choices?.[0]?.message;
  const content = typeof assistantMessage?.content === "string" ? assistantMessage.content : "";
  const toolCalls = Array.isArray(assistantMessage?.tool_calls)
    ? assistantMessage.tool_calls.flatMap((call: any) => {
        try {
          return [
            {
              id: call.id,
              name: call.function.name,
              arguments: JSON.parse(call.function.arguments),
            },
          ];
        } catch {
          return [];
        }
      })
    : [];
  if (!content && toolCalls.length === 0)
    throw new Error("Response AI provider tidak memiliki content.");

  const inputTokens =
    Number(payload?.usage?.prompt_tokens) ||
    estimateTokens(options.messages.map((m) => m.content).join("\n"));
  const outputTokens = Number(payload?.usage?.completion_tokens) || estimateTokens(content);
  return { content, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, toolCalls };
}
