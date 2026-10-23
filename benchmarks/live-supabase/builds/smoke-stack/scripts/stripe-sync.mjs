#!/usr/bin/env node
/**
 * Create this app's Stripe products, prices and usage meters from its catalog.
 *
 * Usage:
 *   npm run stripe:sync -- --dry-run     # print the plan, touch nothing
 *   STRIPE_SECRET_KEY=sk_test_… npm run stripe:sync
 *
 * Flags: [--from src/resources/plans.json | stack.json] [--dry-run] [--json]
 *
 * Reads the app's catalog, src/resources/plans.json, when there is one (the
 * billing slice ships it and the app bills from it), else `answers.billing`
 * in stack.json. Either file has the same shape.
 *
 * No dependency: this talks to the Stripe REST API over global fetch, so the
 * app installs nothing extra and still builds and runs with no environment at
 * all. Without STRIPE_SECRET_KEY it prints the plan and stops, which is the
 * same output as --dry-run.
 *
 * Idempotent by construction, so re-running is safe and is the intended way to
 * apply a price change:
 *
 * - Products use a deterministic id (`<prefix><key>`), so existence is one
 *   exact GET. Stripe's search index is eventually consistent and would
 *   double-create on a quick second run; an id lookup cannot.
 * - Prices are immutable in Stripe — an amount cannot be edited. They are
 *   matched on `lookup_key`. An unchanged price is reused. A changed one gets
 *   a NEW price created with `transfer_lookup_key`, which moves the key off
 *   the old price, and the old price is then archived. Existing subscriptions
 *   stay on the old price, which is what Stripe intends and what you want:
 *   nobody's bill changes because a config file did.
 */
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const getFlag = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const hasFlag = (n) => args.includes(`--${n}`);

const asJson = hasFlag("json");
const out = [];
const say = (line) => {
  if (!asJson) console.log(line);
};
const fail = (msg) => {
  if (asJson) console.log(JSON.stringify({ ok: false, error: msg }));
  else console.error(`stripe-sync: ${msg}`);
  process.exit(1);
};

const PLANS = "src/resources/plans.json";
const stackPath = getFlag("from") || (existsSync(PLANS) ? PLANS : "stack.json");
if (!existsSync(stackPath)) {
  fail(`no ${stackPath} here. Run this from the project root, or pass --from <path>.`);
}
let stack;
try {
  stack = JSON.parse(readFileSync(stackPath, "utf8"));
} catch (e) {
  fail(`${stackPath} is not valid JSON (${e.message})`);
}

// A catalog file is the billing object itself; a stack.json carries it under answers.
const billing = stack?.products ? stack : stack?.answers?.billing;
if (!billing) {
  fail(
    `${stackPath} has no answers.billing, so there is nothing to create. It looks like:\n  "answers": { "billing": { "provider": "stripe", "currency": "eur", "products": [\n    { "key": "pro", "name": "Pro", "prices": [ { "key": "pro-monthly", "amount": 1900, "interval": "month" } ] }\n  ] } }`,
  );
}

// Validation is strict, like the scaffolder's: a typo in a price is a wrong
// charge, so it is reported rather than guessed at.
if (billing.provider !== "stripe") {
  fail(`answers.billing.provider is ${JSON.stringify(billing.provider ?? null)}; this script only knows "stripe"`);
}
const currency = billing.currency;
if (typeof currency !== "string" || !/^[a-z]{3}$/.test(currency)) {
  fail(`answers.billing.currency must be a three-letter lowercase code (got ${JSON.stringify(currency ?? null)})`);
}
if (!Array.isArray(billing.products) || billing.products.length === 0) {
  fail("answers.billing.products must be a non-empty array");
}
const prefix = billing.idPrefix ?? "stack_";
if (typeof prefix !== "string" || !/^[A-Za-z0-9_-]*$/.test(prefix)) {
  fail(`answers.billing.idPrefix must be letters, digits, "_" or "-" (got ${JSON.stringify(prefix)})`);
}
const KEY = /^[a-z0-9][a-z0-9_-]*$/;
/** Same rule as reportUsage() in src/lib/billing/server.ts. */
const METER = /^[a-z0-9_.-]{1,100}$/i;

/**
 * A metered price bills what `reportUsage` sent to its meter. `amount` is per
 * unit and may be fractional (0.05 = 0.0005 a unit); `tiers` replaces it with
 * graduated tiers, and a first tier at 0 is the usage a plan includes.
 */
function validateMetered(pr) {
  if (typeof pr.meter !== "string" || !METER.test(pr.meter)) {
    fail(`price "${pr.key}" meter must be an event name of letters, digits, "_", "." or "-" (got ${JSON.stringify(pr.meter)})`);
  }
  if (pr.interval === undefined) fail(`price "${pr.key}" is metered, so it needs an interval`);
  const unit = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  if (pr.tiers === undefined) {
    if (!unit(pr.amount)) fail(`price "${pr.key}" amount must be a non-negative number of minor units per unit`);
    return;
  }
  if (!Array.isArray(pr.tiers) || pr.tiers.length === 0) fail(`price "${pr.key}" tiers must be a non-empty array`);
  let last = 0;
  pr.tiers.forEach((tier, i) => {
    const final = i === pr.tiers.length - 1;
    if (!unit(tier?.amount)) fail(`price "${pr.key}" tier ${i + 1} amount must be a non-negative number of minor units per unit`);
    if (final) {
      if (tier.upTo !== null) fail(`price "${pr.key}" last tier must have "upTo": null, so usage past it is still billed`);
    } else if (!Number.isInteger(tier?.upTo) || tier.upTo <= last) {
      fail(`price "${pr.key}" tier ${i + 1} upTo must be a whole number above the tier before it`);
    } else {
      last = tier.upTo;
    }
  });
}

const seenProduct = new Set();
const seenPrice = new Set();
for (const p of billing.products) {
  if (!KEY.test(p?.key ?? "")) fail(`product key ${JSON.stringify(p?.key ?? null)} must match ${KEY}`);
  if (seenProduct.has(p.key)) fail(`duplicate product key "${p.key}"`);
  seenProduct.add(p.key);
  if (typeof p.name !== "string" || !p.name.trim()) fail(`product "${p.key}" needs a name`);
  if (!Array.isArray(p.prices) || p.prices.length === 0) fail(`product "${p.key}" needs at least one price`);
  for (const pr of p.prices) {
    if (!KEY.test(pr?.key ?? "")) fail(`price key ${JSON.stringify(pr?.key ?? null)} must match ${KEY}`);
    if (seenPrice.has(pr.key)) fail(`duplicate price key "${pr.key}" — lookup keys are unique across the account`);
    seenPrice.add(pr.key);
    if (pr.meter !== undefined) validateMetered(pr);
    else if (!Number.isInteger(pr.amount) || pr.amount < 0) {
      fail(`price "${pr.key}" amount must be a non-negative integer in the currency's minor unit (1900 = 19.00)`);
    }
    if (pr.interval !== undefined && !["day", "week", "month", "year"].includes(pr.interval)) {
      fail(`price "${pr.key}" interval must be day, week, month or year — omit it for a one-time price`);
    }
  }
}

const plan = billing.products.flatMap((p) =>
  p.prices.map((pr) => ({
    product: p.key,
    productId: `${prefix}${p.key}`,
    price: pr.key,
    amount: pr.amount ?? null,
    currency,
    interval: pr.interval ?? null,
    ...(pr.meter !== undefined ? { meter: pr.meter } : {}),
    ...(pr.tiers !== undefined ? { tiers: pr.tiers } : {}),
  })),
);

const key = process.env.STRIPE_SECRET_KEY;
const dryRun = hasFlag("dry-run") || !key;

const money = (a) => (a / 100).toFixed(2);
/** Minor units as Stripe's `unit_amount_decimal`: at most 12 places, never exponent notation. */
const decimal = (n) => n.toFixed(12).replace(/\.?0+$/, "");
const unitMoney = (a) => `${decimal(a / 100)} ${currency.toUpperCase()}`;
const usageLabel = (r) =>
  r.tiers
    ? r.tiers.map((t) => `${unitMoney(t.amount)} each ${t.upTo === null ? "after" : `up to ${t.upTo}`}`).join(", ")
    : `${unitMoney(r.amount)} each`;
const label = (r) =>
  r.meter
    ? `${r.product}/${r.price}  metered "${r.meter}": ${usageLabel(r)} / ${r.interval}`
    : `${r.product}/${r.price}  ${money(r.amount)} ${currency.toUpperCase()}${r.interval ? ` / ${r.interval}` : " once"}`;

if (dryRun) {
  say(key ? "plan (--dry-run, nothing sent):" : "plan (no STRIPE_SECRET_KEY set, nothing sent):");
  for (const r of plan) say(`  ${label(r)}`);
  say("");
  say(key ? "Re-run without --dry-run to apply." : "Set STRIPE_SECRET_KEY and re-run to apply.");
  if (asJson) console.log(JSON.stringify({ ok: true, dryRun: true, plan }, null, 2));
  process.exit(0);
}

const API = process.env.STRIPE_API_BASE || "https://api.stripe.com";

/** Stripe takes form-encoded bodies, including for nested keys. */
const form = (obj, prefixKey = "", acc = new URLSearchParams()) => {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const name = prefixKey ? `${prefixKey}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") form(item, `${name}[${i}]`, acc);
        else acc.append(`${name}[${i}]`, String(item));
      });
    } else if (typeof v === "object") form(v, name, acc);
    else acc.append(name, String(v));
  }
  return acc;
};

async function stripe(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body: form(body).toString() } : {}),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    fail(`${method} ${path} returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    if (res.status === 404) return null;
    fail(`${method} ${path} failed (${res.status}): ${json?.error?.message || text.slice(0, 200)}`);
  }
  return json;
}

// Billing Meters, one per event name. Stripe has no lookup by event name, so
// list the active ones; an account holds few. A meter aggregates by sum and
// reads the payload reportUsage() sends: stripe_customer_id and value.
const meterIds = new Map();
const meterNames = [...new Set(plan.filter((r) => r.meter).map((r) => r.meter))];
if (meterNames.length > 0) {
  const listed = await stripe("GET", "/v1/billing/meters?status=active&limit=100");
  for (const m of listed?.data ?? []) meterIds.set(m.event_name, m.id);
  for (const name of meterNames) {
    if (meterIds.has(name)) {
      say(`meter    ${name}  exists   ${meterIds.get(name)}`);
      continue;
    }
    const created = await stripe("POST", "/v1/billing/meters", {
      display_name: name,
      event_name: name,
      default_aggregation: { formula: "sum" },
      customer_mapping: { type: "by_id", event_payload_key: "stripe_customer_id" },
      value_settings: { event_payload_key: "value" },
    });
    meterIds.set(name, created.id);
    say(`meter    ${name}  created  ${created.id}`);
  }
}

/** Whether an existing Stripe price already charges what `price` describes. */
function samePrice(current, price, productId) {
  if (!current) return false;
  if (current.currency !== currency) return false;
  if ((current.recurring?.interval ?? null) !== (price.interval ?? null)) return false;
  if (current.product !== productId && current.product?.id !== productId) return false;
  const amountOf = (o) => Number(o.unit_amount_decimal ?? o.unit_amount);
  if (price.meter === undefined) {
    return current.recurring?.usage_type !== "metered" && current.unit_amount === price.amount;
  }
  if (current.recurring?.usage_type !== "metered" || current.recurring?.meter !== meterIds.get(price.meter)) return false;
  if (!price.tiers) return current.billing_scheme === "per_unit" && amountOf(current) === price.amount;
  const tiers = current.tiers ?? [];
  return (
    current.billing_scheme === "tiered" &&
    current.tiers_mode === "graduated" &&
    tiers.length === price.tiers.length &&
    tiers.every((t, i) => (t.up_to ?? null) === price.tiers[i].upTo && amountOf(t) === price.tiers[i].amount && !t.flat_amount)
  );
}

/** The body that creates `price` (the caller adds lookup-key transfer). */
function priceBody(price, productId) {
  if (price.meter === undefined) {
    return {
      product: productId,
      currency,
      unit_amount: price.amount,
      ...(price.interval ? { recurring: { interval: price.interval } } : {}),
    };
  }
  return {
    product: productId,
    currency,
    recurring: { interval: price.interval, usage_type: "metered", meter: meterIds.get(price.meter) },
    ...(price.tiers
      ? {
          billing_scheme: "tiered",
          tiers_mode: "graduated",
          tiers: price.tiers.map((t) => ({ up_to: t.upTo ?? "inf", unit_amount_decimal: decimal(t.amount) })),
        }
      : { unit_amount_decimal: decimal(price.amount) }),
  };
}

const results = [];
for (const product of billing.products) {
  const productId = `${prefix}${product.key}`;
  let existing = await stripe("GET", `/v1/products/${encodeURIComponent(productId)}`);
  if (existing?.deleted) existing = null;

  if (!existing) {
    await stripe("POST", "/v1/products", {
      id: productId,
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      metadata: { stack_key: product.key },
    });
    say(`product  ${productId}  created`);
  } else {
    say(`product  ${productId}  exists`);
  }

  for (const price of product.prices) {
    const found = await stripe(
      "GET",
      `/v1/prices?lookup_keys[]=${encodeURIComponent(price.key)}&active=true&limit=1&expand[]=data.tiers`,
    );
    const current = found?.data?.[0];

    if (samePrice(current, price, productId)) {
      results.push({ ...price, id: current.id, action: "reused" });
      say(`price    ${price.key}  reused   ${current.id}`);
      continue;
    }

    const created = await stripe("POST", "/v1/prices", {
      ...priceBody(price, productId),
      lookup_key: price.key,
      ...(current ? { transfer_lookup_key: "true" } : {}),
    });
    if (current) {
      await stripe("POST", `/v1/prices/${encodeURIComponent(current.id)}`, { active: "false" });
      say(`price    ${price.key}  replaced ${created.id}  (was ${current.id}, archived; existing subscriptions keep it)`);
    } else {
      say(`price    ${price.key}  created  ${created.id}`);
    }
    results.push({ ...price, id: created.id, action: current ? "replaced" : "created" });
  }
}

const env = results.map((r) => `STRIPE_PRICE_${r.key.toUpperCase().replace(/-/g, "_")}=${r.id}`);
if (asJson) {
  console.log(JSON.stringify({ ok: true, dryRun: false, results, env }, null, 2));
} else {
  say("");
  say("Add to .env.local:");
  for (const line of env) say(`  ${line}`);
  say("");
  say("Still manual in the Stripe dashboard — this script cannot do them for you:");
  say("  - the webhook endpoint (/api/webhooks/stripe) and its signing secret (STRIPE_WEBHOOK_SECRET),");
  say("    subscribed to checkout.session.completed, customer.subscription.created/updated/deleted,");
  say("    invoice.paid and invoice.payment_failed");
  say("  - the customer portal configuration");
  say("  - checkout success/cancel redirect URLs, if you pin them per environment");
}
