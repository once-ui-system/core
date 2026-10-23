#!/usr/bin/env node
// Live checks for SPEC section 8, run against `next start` on a real local
// Supabase (migrations applied) and stripe-mock. No dependencies.
//   BASE=http://localhost:3000 SB_URL=… ANON=… SERVICE=… WHSEC=… DB_URL=… \
//   STRIPE_LOG=/tmp/stripe.log node live-gate.mjs [results.json]
import { createHmac } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const { BASE, SB_URL, ANON, SERVICE, WHSEC, DB_URL, STRIPE_LOG } = process.env;
const out = process.argv[2];
const results = [];
function check(ok, label, detail) {
  results.push({ label, ok: !!ok, ...(ok ? {} : { detail: String(detail ?? "").slice(0, 600) }) });
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${ok || detail === undefined ? "" : `  -- ${String(detail).slice(0, 600)}`}`);
}
const psql = (sql) =>
  execFileSync("psql", ["-X", "-qtA", "-v", "ON_ERROR_STOP=1", DB_URL, "-c", sql], { encoding: "utf8" }).trim();

// Users straight from GoTrue (email confirmation is off on a local Supabase).
async function user(tag) {
  const email = `${tag}-${Date.now()}@example.com`;
  const password = `Bench-${tag}-pass-1!`;
  const r = await fetch(`${SB_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: ANON, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const s = await r.json();
  if (!s.access_token) throw new Error(`signup ${tag}: ${r.status} ${JSON.stringify(s).slice(0, 300)}`);
  // The cookie @supabase/ssr writes: sb-<first host label>-auth-token, base64-<base64url JSON>,
  // split into .0, .1 … chunks past 3180 characters.
  const name = `sb-${new URL(SB_URL).hostname.split(".")[0]}-auth-token`;
  const value = `base64-${Buffer.from(JSON.stringify(s)).toString("base64url")}`;
  const chunks = value.length <= 3180 ? [[name, value]] : value.match(/.{1,3180}/g).map((c, i) => [`${name}.${i}`, c]);
  const cookie = chunks.map(([k, v]) => `${k}=${v}`).join("; ");
  return { email, id: s.user.id, token: s.access_token, cookie };
}

async function api(u, method, path, body) {
  const headers = { accept: "application/json" };
  if (u) {
    headers.cookie = u.cookie;
    headers.authorization = `Bearer ${u.token}`;
  }
  if (body !== undefined) headers["content-type"] = "application/json";
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: r.status, json, text: text.slice(0, 400) };
}
// Some apps wrap payloads ({ org: {…} }, { data: […] }); accept one level of wrapping.
const unwrap = (j, want) => {
  if (!j || typeof j !== "object") return j;
  if (want(j)) return j;
  for (const v of Object.values(j)) if (v && typeof v === "object" && want(v)) return v;
  return j;
};
const isOrg = (o) => o && !Array.isArray(o) && ("slug" in o || "plan" in o);
const isList = (a) => Array.isArray(a);

function sign(payload, secret, t = Math.floor(Date.now() / 1000)) {
  const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${sig}`;
}
function event(orgId) {
  return JSON.stringify({
    id: `evt_bench_${Date.now()}`,
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_test_bench_${Date.now()}`,
        object: "checkout.session",
        mode: "subscription",
        status: "complete",
        payment_status: "paid",
        customer: "cus_bench",
        subscription: "sub_bench",
        client_reference_id: orgId,
        metadata: { org_id: orgId },
      },
    },
  });
}
async function webhook(payload, signature) {
  const r = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(signature ? { "stripe-signature": signature } : {}) },
    body: payload,
  });
  return r.status;
}

try {
  // 1. Schema: RLS on every public table.
  const tables = psql("select tablename from pg_tables where schemaname='public' order by 1").split("\n").filter(Boolean);
  const noRls = psql("select tablename from pg_tables where schemaname='public' and not rowsecurity order by 1")
    .split("\n")
    .filter(Boolean);
  check(tables.length > 0, "migrations created public tables", tables.join(","));
  check(noRls.length === 0, "RLS on every public table", `without RLS: ${noRls.join(",")}`);

  // 2. Gating.
  const anonApp = await fetch(`${BASE}/app`, { redirect: "manual" });
  const loc = anonApp.headers.get("location") ?? "";
  check([301, 302, 303, 307, 308].includes(anonApp.status) && /\/auth/.test(loc), "signed out /app redirects to /auth", `${anonApp.status} ${loc}`);
  const anonApi = await api(null, "POST", "/api/orgs", { name: "Nope" });
  check(anonApi.status === 401, "signed out POST /api/orgs is 401", `${anonApi.status} ${anonApi.text}`);

  const owner = await user("owner");
  const member = await user("member");
  const stranger = await user("stranger");
  const signedIn = await fetch(`${BASE}/app`, { headers: { cookie: owner.cookie }, redirect: "manual" });
  const sloc = signedIn.headers.get("location") ?? "";
  check(signedIn.status === 200 || ([307, 302, 303, 308].includes(signedIn.status) && !/\/auth/.test(sloc)), "signed in /app is not sent to /auth", `${signedIn.status} ${sloc}`);

  // 3. Organizations.
  const created = await api(owner, "POST", "/api/orgs", { name: "Bench Team A" });
  const org = unwrap(created.json, isOrg) ?? {};
  check(created.status === 201 && org.slug && org.id, "POST /api/orgs 201 {id, slug}", `${created.status} ${created.text}`);
  if (!org.slug) throw new Error("no org to continue with");
  const s = encodeURIComponent(org.slug);

  const got = await api(owner, "GET", `/api/orgs/${s}`);
  const g = unwrap(got.json, isOrg) ?? {};
  check(got.status === 200 && g.plan === "free" && g.role === "owner", "GET /api/orgs/{org}: plan free, role owner", `${got.status} ${got.text}`);

  // 4. Invitations.
  const inv = await api(owner, "POST", `/api/orgs/${s}/invitations`, { email: member.email, role: "member" });
  const invj = unwrap(inv.json, (o) => o && "token" in o) ?? {};
  // The token, or the last segment of the invite url.
  const token = invj.token ?? (typeof inv.json?.url === "string" ? inv.json.url.split("?")[0].split("/").filter(Boolean).pop() : undefined);
  check(inv.status === 201 && token, "owner creates an invitation (201 {token})", `${inv.status} ${inv.text}`);
  const acc = await api(member, "POST", `/api/invitations/${encodeURIComponent(token ?? "x")}`);
  check(acc.status === 200, "invitee accepts (200)", `${acc.status} ${acc.text}`);
  const mem = await api(owner, "GET", `/api/orgs/${s}/members`);
  const list = unwrap(mem.json, isList);
  const row = Array.isArray(list) ? list.find((m) => m.user_id === member.id || m.email === member.email) : null;
  check(mem.status === 200 && row && row.role === "member", "members list shows the invitee as member", `${mem.status} ${mem.text}`);
  const memInv = await api(member, "POST", `/api/orgs/${s}/invitations`, { role: "member" });
  check(memInv.status === 403, "a member cannot invite (403)", `${memInv.status} ${memInv.text}`);

  // 5. Tenancy: another team's user, through the app and straight at the database.
  const other = await api(stranger, "POST", "/api/orgs", { name: "Bench Team B" });
  check(other.status === 201, "second team created", `${other.status} ${other.text}`);
  const sm = await api(stranger, "GET", `/api/orgs/${s}/members`);
  const so = await api(stranger, "GET", `/api/orgs/${s}`);
  check([403, 404].includes(sm.status) && [403, 404].includes(so.status), "other team gets 403/404 on team A's org and members", `${so.status} ${sm.status} ${sm.text}`);
  const leaks = [];
  for (const t of tables) {
    const r = await fetch(`${SB_URL}/rest/v1/${encodeURIComponent(t)}?select=*`, {
      headers: { apikey: ANON, authorization: `Bearer ${stranger.token}` },
    });
    const body = await r.text();
    if (r.ok && (body.includes(org.id) || body.includes(owner.id) || body.includes(member.email) || body.includes(owner.email))) leaks.push(t);
  }
  check(leaks.length === 0, "other team reads none of team A's rows through Supabase (RLS)", `leaking tables: ${leaks.join(",")}`);
  const anonLeaks = [];
  for (const t of tables) {
    const r = await fetch(`${SB_URL}/rest/v1/${encodeURIComponent(t)}?select=*`, { headers: { apikey: ANON } });
    const body = await r.text();
    if (r.ok && body.includes(org.id)) anonLeaks.push(t);
  }
  check(anonLeaks.length === 0, "anonymous key reads none of team A's rows", `leaking tables: ${anonLeaks.join(",")}`);

  // 6. Billing.
  const before = STRIPE_LOG ? readFileSync(STRIPE_LOG, "utf8").length : 0;
  const mco = await api(member, "POST", `/api/orgs/${s}/billing/checkout`);
  check(mco.status === 403, "a member cannot start checkout (403)", `${mco.status} ${mco.text}`);
  const co = await api(owner, "POST", `/api/orgs/${s}/billing/checkout`);
  const coj = unwrap(co.json, (o) => o && "url" in o) ?? {};
  const log = STRIPE_LOG ? readFileSync(STRIPE_LOG, "utf8").slice(before) : "";
  check(co.status === 200 && typeof coj.url === "string" && coj.url.length > 0, "owner starts checkout: 200 {url}", `${co.status} ${co.text}`);
  check(/checkout\/sessions/.test(log), "checkout session created on Stripe (stripe-mock saw it)", log.slice(-400) || "no stripe-mock request");

  const payload = event(org.id);
  const bad = await webhook(payload, sign(payload, "whsec_wrong"));
  const none = await webhook(payload, null);
  const afterBad = unwrap((await api(owner, "GET", `/api/orgs/${s}`)).json, isOrg) ?? {};
  check(bad === 400 && none === 400 && afterBad.plan === "free", "webhook rejects bad or missing signatures (400), plan stays free", `bad=${bad} none=${none} plan=${afterBad.plan}`);
  const good = await webhook(payload, sign(payload, WHSEC));
  const after = await api(owner, "GET", `/api/orgs/${s}`);
  const a = unwrap(after.json, isOrg) ?? {};
  check(good >= 200 && good < 300 && a.plan === "team", "signed checkout.session.completed moves the org to team", `webhook=${good} plan=${a.plan}`);
} catch (e) {
  check(false, "gate ran to the end", e.stack ?? e);
}

// A run that stops early counts every check it never reached as failed.
const TOTAL = 20;
const pass = results.filter((r) => r.ok && r.label !== "gate ran to the end").length;
console.log(`pass=${pass} fail=${TOTAL - pass}`);
if (out) writeFileSync(out, JSON.stringify({ pass, total: TOTAL, results }, null, 2));
