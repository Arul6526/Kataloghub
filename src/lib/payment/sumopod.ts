/**
 * Sumopod Payment Gateway SDK / API Helper (Sandbox & Production)
 */

export interface CreateSumopodPaymentParams {
  orderId: string;
  amount: number;
  currency?: string;
  expiresInHours?: number;
  successReturnUrl: string;
  cancelReturnUrl: string;
  webhookUrl?: string;
  paymentMethodTypeCode?: string;
}

export interface SumopodPaymentResponseData {
  payment_id?: string;
  id?: string;
  order_id?: string;
  amount?: number;
  fee?: number;
  net_amount?: number;
  currency?: string;
  status?: string;
  payment_link_url?: string;
  payment_url?: string;
  checkout_url?: string;
  qris_content?: string;
  qris_url?: string;
  expires_at?: string;
  [key: string]: any;
}

export interface SumopodPaymentResponse {
  success: boolean;
  data?: SumopodPaymentResponseData;
  error?: string;
  raw?: any;
}

const SUCCESS_STATUSES = new Set(["completed", "paid", "success", "settlement", "lunas"]);

const FAILED_STATUSES = new Set(["failed", "cancelled", "expired"]);
const SUMOPOD_REQUEST_TIMEOUT_MS = 15_000;

export function normalizeSumopodStatus(status: unknown): string {
  return typeof status === "string" ? status.trim().toLowerCase() : "";
}

export function isSumopodPaymentPaid(status: unknown, isPaid = false): boolean {
  return isPaid || SUCCESS_STATUSES.has(normalizeSumopodStatus(status));
}

export function isSumopodPaymentFailed(status: unknown): boolean {
  return FAILED_STATUSES.has(normalizeSumopodStatus(status));
}

/**
 * Mengambil base URL Sumopod Pay dari ENV atau fallback ke sandbox.
 */
export function getSumopodBaseUrl(): string {
  return (process.env.SUMOPOD_PAY_BASE_URL || "https://api-pay-sandbox.sumopod.com/api/v1").replace(
    /\/$/,
    "",
  );
}

/**
 * Mengambil API Key Sumopod Pay dari ENV.
 */
export function getSumopodApiKey(): string {
  return process.env.SUMOPOD_PAY_API_KEY || "";
}

/**
 * Membuat transaksi pembayaran baru via Sumopod Payment Gateway.
 */
export async function createSumopodPayment(
  params: CreateSumopodPaymentParams,
): Promise<SumopodPaymentResponse> {
  const apiKey = getSumopodApiKey();
  const baseUrl = getSumopodBaseUrl();

  if (!apiKey) {
    return {
      success: false,
      error: "SUMOPOD_PAY_API_KEY belum dikonfigurasi di variabel lingkungan.",
    };
  }

  const payload = {
    order_id: params.orderId,
    amount: params.amount,
    currency: params.currency || "IDR",
    expires_in_hours: params.expiresInHours || 24,
    success_return_url: params.successReturnUrl,
    cancel_return_url: params.cancelReturnUrl,
    webhook_url: params.webhookUrl,
    callback_url: params.webhookUrl,
    notification_url: params.webhookUrl,
    payment_method_type_code: params.paymentMethodTypeCode || "QRIS",
  };

  try {
    const res = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      signal: AbortSignal.timeout(SUMOPOD_REQUEST_TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
      return {
        success: false,
        error: errMsg,
        raw: data,
      };
    }

    return {
      success: true,
      data: data?.data || data,
      raw: data,
    };
  } catch (err: any) {
    console.error("Gagal menghubungi Sumopod Payment API:", err);
    return {
      success: false,
      error: err.message || "Gagal terhubung ke Sumopod Payment Gateway.",
    };
  }
}

/**
 * Mengambil status transaksi dari Sumopod Payment Gateway API.
 */
export async function getSumopodPaymentStatus(
  orderIdOrId: string,
): Promise<SumopodPaymentResponse> {
  const apiKey = getSumopodApiKey();
  const baseUrl = getSumopodBaseUrl();

  if (!apiKey) {
    return {
      success: false,
      error: "SUMOPOD_PAY_API_KEY belum dikonfigurasi di variabel lingkungan.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/payments/${orderIdOrId}`, {
      method: "GET",
      signal: AbortSignal.timeout(SUMOPOD_REQUEST_TIMEOUT_MS),
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `Request status ${res.status}`,
        raw: data,
      };
    }

    return {
      success: true,
      data: data?.data || data,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil status pembayaran dari Sumopod.",
    };
  }
}
