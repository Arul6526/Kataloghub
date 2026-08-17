import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const value = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (!value) throw new Error("AI_SETTINGS_ENCRYPTION_KEY belum dikonfigurasi.");

  const key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY harus berupa base64 dari 32 byte.");
  }
  return key;
}

export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptSecret(value: string): string {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Format secret AI tidak valid.");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivValue, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}
