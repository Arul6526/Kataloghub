import assert from "node:assert/strict";
import test from "node:test";
import {
  isSumopodPaymentFailed,
  isSumopodPaymentPaid,
  normalizeSumopodStatus,
  // @ts-ignore Node's native TypeScript runner requires the file extension.
} from "./sumopod.ts";

test("normalizes gateway statuses consistently", () => {
  assert.equal(normalizeSumopodStatus("  SETTLEMENT "), "settlement");
  assert.equal(normalizeSumopodStatus(undefined), "");
});

test("recognizes successful Sumopod statuses and explicit paid flag", () => {
  for (const status of ["completed", "paid", "success", "settlement", "lunas"]) {
    assert.equal(isSumopodPaymentPaid(status), true, status);
  }

  assert.equal(isSumopodPaymentPaid("processing"), false);
  assert.equal(isSumopodPaymentPaid("processing", true), true);
});

test("recognizes failed and expired statuses", () => {
  for (const status of ["failed", "cancelled", "expired"]) {
    assert.equal(isSumopodPaymentFailed(status), true, status);
  }

  assert.equal(isSumopodPaymentFailed("pending"), false);
});
