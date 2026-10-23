import assert from "node:assert/strict";
import { test } from "node:test";
import { signatureHeader, verifySignature } from "./signature.ts";

const secret = "whsec_test";
const body = JSON.stringify({ id: "evt_1", type: "invoice.paid" });

test("accepts what Stripe would send", () => {
  assert.deepEqual(
    verifySignature(body, signatureHeader(body, secret, 1_000), secret, { now: 1_010 }),
    { ok: true },
  );
});

test("accepts when any v1 matches (secret rotation sends two)", () => {
  const header = `t=1000,v1=${"0".repeat(64)},${signatureHeader(body, secret, 1_000).split(",")[1]}`;
  assert.equal(verifySignature(body, header, secret, { now: 1_000 }).ok, true);
});

test("refuses a tampered body, a wrong secret, a stale timestamp and junk", () => {
  const header = signatureHeader(body, secret, 1_000);
  assert.equal(verifySignature(`${body} `, header, secret, { now: 1_000 }).ok, false);
  assert.equal(verifySignature(body, header, "whsec_other", { now: 1_000 }).ok, false);
  assert.equal(verifySignature(body, header, secret, { now: 1_000 + 301 }).ok, false);
  assert.equal(verifySignature(body, null, secret).ok, false);
  assert.equal(verifySignature(body, "v1=abc", secret).ok, false);
  assert.equal(verifySignature(body, "t=1000,v1=zz", secret, { now: 1_000 }).ok, false);
});
