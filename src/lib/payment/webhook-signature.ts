import crypto from "node:crypto";

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

export function verifyWebhookSignature(
  secret: string | undefined,
  svixId: string | null,
  svixTimestamp: string | null,
  svixSignature: string | null,
  rawBody: string,
  now = Date.now(),
  toleranceSeconds = DEFAULT_TIMESTAMP_TOLERANCE_SECONDS,
): boolean {
  if (!secret || !svixId || !svixTimestamp || !svixSignature) return false;

  const timestamp = Number(svixTimestamp);
  if (!Number.isInteger(timestamp)) return false;

  const age = Math.abs(Math.floor(now / 1000) - timestamp);
  if (age > toleranceSeconds) return false;

  try {
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    return svixSignature.split(" ").some((value) => {
      const [version, signature] = value.split(",", 2);
      if (version !== "v1" || !signature) return false;

      const expected = Buffer.from(expectedSignature);
      const received = Buffer.from(signature);
      return expected.length === received.length && crypto.timingSafeEqual(expected, received);
    });
  } catch {
    return false;
  }
}
