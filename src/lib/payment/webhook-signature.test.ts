import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the file extension.
import { verifyWebhookSignature } from "./webhook-signature.ts";

const secret = `whsec_${Buffer.from("sandbox-secret").toString("base64")}`;
const timestamp = 1_700_000_000;
const id = "msg_test_123";
const body = JSON.stringify({ event_type: "payment.test" });

function sign() {
  return crypto
    .createHmac("sha256", Buffer.from("sandbox-secret"))
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
}

test("accepts a valid Svix signature", () => {
  assert.equal(
    verifyWebhookSignature(secret, id, String(timestamp), `v1,${sign()}`, body, timestamp * 1000),
    true,
  );
});

test("accepts one valid signature during secret rotation", () => {
  assert.equal(
    verifyWebhookSignature(
      secret,
      id,
      String(timestamp),
      `v1,old-signature v1,${sign()}`,
      body,
      timestamp * 1000,
    ),
    true,
  );
});

test("rejects a changed body or expired timestamp", () => {
  assert.equal(
    verifyWebhookSignature(
      secret,
      id,
      String(timestamp),
      `v1,${sign()}`,
      `${body} `,
      timestamp * 1000,
    ),
    false,
  );
  assert.equal(
    verifyWebhookSignature(
      secret,
      id,
      String(timestamp),
      `v1,${sign()}`,
      body,
      timestamp * 1000 + 301_000,
    ),
    false,
  );
});
