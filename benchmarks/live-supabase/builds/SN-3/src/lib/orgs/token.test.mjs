import assert from "node:assert/strict";
import { test } from "node:test";
import { generateInviteToken, hashInviteToken, isEmail, isInviteToken, normalizeEmail } from "./token.ts";

test("tokens are 43 URL-safe characters and unique", () => {
  const a = generateInviteToken();
  const b = generateInviteToken();
  assert.equal(isInviteToken(a), true);
  assert.notEqual(a, b);
  assert.equal(isInviteToken("short"), false);
  assert.equal(isInviteToken(`${a.slice(0, 42)}/`), false);
});

test("the stored hash is stable and is not the token", () => {
  const t = generateInviteToken();
  assert.equal(hashInviteToken(t), hashInviteToken(t));
  assert.notEqual(hashInviteToken(t), t);
  assert.match(hashInviteToken(t), /^[0-9a-f]{64}$/);
});

test("emails are compared normalized", () => {
  assert.equal(normalizeEmail("  Ada@Example.COM "), "ada@example.com");
  assert.equal(isEmail("ada@example.com"), true);
  assert.equal(isEmail("ada@example"), false);
  assert.equal(isEmail("ada example@x.io"), false);
});
