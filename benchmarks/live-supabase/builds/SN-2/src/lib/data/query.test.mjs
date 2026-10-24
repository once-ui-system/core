import assert from "node:assert/strict";
import { test } from "node:test";
import { ilikePattern, pageRange, parseTableQuery, queryInMemory, tableQueryToParams } from "./query.ts";

const spec = {
  sortable: ["email", "created_at"],
  filters: { role: ["owner", "admin", "member"] },
  defaultSort: { key: "created_at", direction: "asc" },
  defaultPerPage: 10,
  maxPerPage: 50,
};

test("keeps only what the spec allows", () => {
  const q = parseTableQuery(
    new URLSearchParams("page=3&perPage=500&sort=password&dir=desc&role=superuser&q=%20ada%20"),
    spec,
  );
  assert.deepEqual(q, {
    page: 3,
    perPage: 50,
    sort: { key: "created_at", direction: "asc" },
    q: "ada",
    filters: {},
  });
});

test("reads a valid query and round-trips it", () => {
  const params = new URLSearchParams("page=2&perPage=25&sort=email&dir=desc&role=admin&q=x");
  const q = parseTableQuery(params, spec);
  assert.deepEqual(q, { page: 2, perPage: 25, sort: { key: "email", direction: "desc" }, q: "x", filters: { role: "admin" } });
  assert.deepEqual(parseTableQuery(tableQueryToParams(q), spec), q);
});

test("garbage numbers fall back", () => {
  const q = parseTableQuery(new URLSearchParams("page=-1&perPage=abc"), spec);
  assert.equal(q.page, 1);
  assert.equal(q.perPage, 10);
});

test("page range is zero-based and inclusive", () => {
  assert.deepEqual(pageRange({ page: 1, perPage: 10 }), [0, 9]);
  assert.deepEqual(pageRange({ page: 3, perPage: 25 }), [50, 74]);
});

test("ilike pattern escapes wildcards and filter punctuation", () => {
  assert.equal(ilikePattern("50%_off"), "%50\\%\\_off%");
  assert.equal(ilikePattern("a,b(c)"), "%a b c %");
});

test("in-memory answers filter, search, sort and page like the database", () => {
  const rows = [
    { email: "c@x.io", role: "member", created_at: "2025-01-03" },
    { email: "a@x.io", role: "admin", created_at: "2025-01-01" },
    { email: "b@y.io", role: "member", created_at: "2025-01-02" },
    { email: null, role: "member", created_at: "2025-01-04" },
  ];
  const page = queryInMemory(
    rows,
    { page: 1, perPage: 2, sort: { key: "email", direction: "desc" }, q: "", filters: { role: "member" } },
    ["email"],
  );
  assert.equal(page.count, 3);
  assert.deepEqual(page.rows.map((r) => r.email), ["c@x.io", "b@y.io"]);

  const searched = queryInMemory(rows, { page: 1, perPage: 10, sort: null, q: "X.IO", filters: {} }, ["email"]);
  assert.deepEqual(searched.rows.map((r) => r.email), ["c@x.io", "a@x.io"]);
});
