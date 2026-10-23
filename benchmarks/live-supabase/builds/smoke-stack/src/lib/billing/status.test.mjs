import assert from "node:assert/strict";
import { test } from "node:test";
import { isEntitling, isTerminal, pickCurrent } from "./status.ts";

test("only active and trialing entitle", () => {
  for (const s of ["active", "trialing"]) assert.equal(isEntitling(s), true, s);
  for (const s of [
    "past_due",
    "unpaid",
    "incomplete",
    "canceled",
    "paused",
    "incomplete_expired",
  ]) {
    assert.equal(isEntitling(s), false, s);
  }
  assert.equal(isTerminal("canceled"), true);
  assert.equal(isTerminal("past_due"), false);
});

const sub = (id, status, plan_key, end = "2026-11-01") => ({
  id,
  status,
  plan_key,
  price_key: null,
  current_period_start: null,
  current_period_end: end,
  cancel_at_period_end: false,
});
const rank = (key) => ["pro", "team"].indexOf(key ?? "");

test("an entitling subscription beats a higher plan that is not", () => {
  assert.equal(
    pickCurrent([sub("a", "past_due", "team"), sub("b", "active", "pro")], rank)?.id,
    "b",
  );
});

test("between entitling ones, the higher plan wins, then the later period", () => {
  assert.equal(
    pickCurrent([sub("a", "active", "pro"), sub("b", "trialing", "team")], rank)?.id,
    "b",
  );
  assert.equal(
    pickCurrent(
      [sub("a", "active", "pro", "2026-11-01"), sub("b", "active", "pro", "2026-12-01")],
      rank,
    )?.id,
    "b",
  );
});

test("a failed renewal is still reported, not hidden", () => {
  assert.equal(pickCurrent([sub("a", "past_due", "pro")], rank)?.status, "past_due");
  assert.equal(pickCurrent([], rank), null);
});
