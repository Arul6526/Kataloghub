export type AiMode = "managed" | "byok";
export type AiAssistantDomain = "product" | "marketing" | "business" | "sales";

export interface AiSettingsView {
  mode: AiMode;
  providerName: string;
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
  maskedApiKey: string | null;
  tokenLimit: number;
  tokensUsed: number;
}
