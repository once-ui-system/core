"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  Select,
  Tag,
  Text,
} from "@once-ui-system/core";
import { DIETS, GUESTS, PARTIES, TABLE_BY_ID, type Guest, type Rsvp } from "@/lib/data";
import { RSVP_LABEL, RSVP_TONE, initials, mealOf } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

type SortKey = "name" | "party" | "rsvp" | "table";

const RSVP_ORDER: Record<Rsvp, number> = { yes: 0, maybe: 1, pending: 2, no: 3 };

function one(v: string | string[]): string {
  return Array.isArray(v) ? (v[0] ?? "all") : v;
}

const cellStyle = { padding: "10px 12px", textAlign: "left" as const, verticalAlign: "middle" as const };
const rowLine = { borderTop: "1px solid var(--neutral-alpha-weak)" };

export function GuestsView() {
  const { tableOf } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });

  const tableLabel = (g: Guest): string => {
    const t = tableOf[g.id];
    return t ? TABLE_BY_ID[t].name : g.rsvp === "no" ? "Declined" : "Not seated";
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = GUESTS.filter((g) => {
      if (q && !`${g.name} ${g.party} ${g.diet ?? ""}`.toLowerCase().includes(q)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (seating === "seated" && !tableOf[g.id]) return false;
      if (seating === "unseated" && (tableOf[g.id] || g.rsvp === "no")) return false;
      return true;
    });
    const value = (g: Guest): string | number => {
      if (sort.key === "name") return g.name;
      if (sort.key === "party") return g.party;
      if (sort.key === "rsvp") return RSVP_ORDER[g.rsvp];
      return tableLabel(g);
    };
    return list.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return c * sort.dir || a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, party, rsvp, diet, seating, sort, tableOf]);

  const meals = useMemo(() => {
    const map = new Map<string, { confirmed: number; seated: number; open: number }>();
    for (const g of GUESTS) {
      if (g.rsvp === "no") continue;
      const key = mealOf(g);
      const row = map.get(key) ?? { confirmed: 0, seated: 0, open: 0 };
      if (g.rsvp === "yes") {
        row.confirmed += 1;
        if (tableOf[g.id]) row.seated += 1;
      } else {
        row.open += 1;
      }
      map.set(key, row);
    }
    const keys = Array.from(map.keys()).sort((a, b) =>
      a === "Standard" ? -1 : b === "Standard" ? 1 : a.localeCompare(b),
    );
    return keys.map((k) => ({ meal: k, ...(map.get(k) as { confirmed: number; seated: number; open: number }) }));
  }, [tableOf]);

  const totals = meals.reduce(
    (a, m) => ({ confirmed: a.confirmed + m.confirmed, seated: a.seated + m.seated, open: a.open + m.open }),
    { confirmed: 0, seated: 0, open: 0 },
  );
  const special = totals.confirmed - (meals.find((m) => m.meal === "Standard")?.confirmed ?? 0);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const header = (key: SortKey, label: string) => (
    <th
      scope="col"
      style={cellStyle}
      aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <Row
        as="button"
        type="button"
        gap="4"
        vertical="center"
        cursor="interactive"
        onClick={() => toggleSort(key)}
        aria-label={`Sort by ${label}`}>
        <Text textVariant="label-strong-s" onBackground="neutral-weak">
          {label}
        </Text>
        {sort.key === key ? <Icon name={sort.dir === 1 ? "arrowDown" : "arrowUp"} size="xs" /> : null}
      </Row>
    </th>
  );

  return (
    <Column fillWidth maxWidth="96rem" paddingX="16" paddingY="16" gap="16">
      <Row gap="16" vertical="end" wrap>
        <Column gap="4" flex={1}>
          <Heading as="h1" textVariant="display-strong-xs">
            Guest list
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {GUESTS.length} invited · {totals.confirmed} attending · {GUESTS.filter((g) => g.rsvp === "no").length} declined ·{" "}
            {totals.open} awaiting an answer
          </Text>
        </Column>
        <Button variant="secondary" prefixIcon="document" onClick={() => window.print()}>
          Print for the caterer
        </Button>
      </Row>

      <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} minWidth={0} gap="12" m={{ width: "100%" }}>
          <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
            <Grid columns="5" m={{ columns: "3" }} s={{ columns: "1" }} gap="12" fillWidth>
              <Input
                id="guest-search"
                label="Search guests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefix={<Icon name="search" size="s" />}
              />
              <Select
                id="filter-party"
                label="Party"
                value={party}
                onValueChange={(v) => setParty(one(v))}
                options={[{ value: "all", label: "All parties" }, ...PARTIES.map((p) => ({ value: p, label: p }))]}
              />
              <Select
                id="filter-rsvp"
                label="RSVP"
                value={rsvp}
                onValueChange={(v) => setRsvp(one(v))}
                options={[
                  { value: "all", label: "Any RSVP" },
                  ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] })),
                ]}
              />
              <Select
                id="filter-diet"
                label="Diet"
                value={diet}
                onValueChange={(v) => setDiet(one(v))}
                options={[
                  { value: "all", label: "Any diet" },
                  { value: "none", label: "No dietary need" },
                  ...DIETS.map((d) => ({ value: d, label: d })),
                ]}
              />
              <Select
                id="filter-seating"
                label="Seating"
                value={seating}
                onValueChange={(v) => setSeating(one(v))}
                options={[
                  { value: "all", label: "Seated or not" },
                  { value: "seated", label: "Seated" },
                  { value: "unseated", label: "Needs a seat" },
                ]}
              />
            </Grid>
            <Row gap="8" vertical="center">
              <Text textVariant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
                Showing {rows.length} of {GUESTS.length} guests
              </Text>
              {query || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all" ? (
                <Button
                  variant="tertiary"
                  size="s"
                  onClick={() => {
                    setQuery("");
                    setParty("all");
                    setRsvp("all");
                    setDiet("all");
                    setSeating("all");
                  }}>
                  Clear filters
                </Button>
              ) : null}
            </Row>
          </Column>

          <Column background="surface" border radius="l" fillWidth overflowX="auto">
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Guests with party, RSVP, dietary need and table
              </caption>
              <thead>
                <tr>
                  {header("name", "Guest")}
                  {header("party", "Party")}
                  {header("rsvp", "RSVP")}
                  <th scope="col" style={cellStyle}>
                    <Text textVariant="label-strong-s" onBackground="neutral-weak">
                      Meal
                    </Text>
                  </th>
                  {header("table", "Table")}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr style={rowLine}>
                    <td colSpan={5} style={{ ...cellStyle, padding: 24 }}>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        No guest matches these filters.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  rows.map((g) => {
                    const t = tableOf[g.id];
                    return (
                      <tr key={g.id} style={rowLine}>
                        <td style={cellStyle}>
                          <Row gap="12" vertical="center">
                            <Avatar size="s" value={initials(g.name)} />
                            <Text textVariant="label-strong-s">{g.name}</Text>
                          </Row>
                        </td>
                        <td style={cellStyle}>
                          <Text textVariant="body-default-s">{g.party}</Text>
                        </td>
                        <td style={cellStyle}>
                          <Tag tone={RSVP_TONE[g.rsvp]} size="s" label={RSVP_LABEL[g.rsvp]} />
                        </td>
                        <td style={cellStyle}>
                          {g.diet ? (
                            <Tag tone="accent" size="s" label={g.diet} />
                          ) : (
                            <Text textVariant="body-default-s" onBackground="neutral-weak">
                              Standard
                            </Text>
                          )}
                        </td>
                        <td style={cellStyle}>
                          {t ? (
                            <Text textVariant="label-strong-s">{TABLE_BY_ID[t].name}</Text>
                          ) : (
                            <Text textVariant="body-default-s" onBackground={g.rsvp === "yes" ? "warning-strong" : "neutral-weak"}>
                              {tableLabel(g)}
                            </Text>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Column>
        </Column>

        <Column width="26rem" m={{ width: "100%", maxWidth: "100%" }} background="surface" border radius="l" padding="16" gap="12">
          <Column gap="2">
            <Heading as="h2" textVariant="heading-strong-m">
              Meals for the caterer
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Confirmed guests only. Guests who have not answered are counted separately.
            </Text>
          </Column>
          <Row gap="12" wrap>
            <Tag tone="brand" size="m" label={`${totals.confirmed} meals`} />
            <Tag tone="accent" size="m" label={`${special} special`} />
          </Row>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Meal counts
              </caption>
              <thead>
                <tr>
                  {["Meal", "Confirmed", "Seated", "Not confirmed"].map((h, i) => (
                    <th key={h} scope="col" style={{ ...cellStyle, padding: "6px 8px", textAlign: i === 0 ? "left" : "right" }}>
                      <Text textVariant="label-default-xs" onBackground="neutral-weak">
                        {h}
                      </Text>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meals.map((m) => (
                  <tr key={m.meal} style={rowLine}>
                    <th scope="row" style={{ ...cellStyle, padding: "8px" }}>
                      <Text textVariant="label-default-s">{m.meal}</Text>
                    </th>
                    {[m.confirmed, m.seated, m.open].map((n, i) => (
                      <td key={i} style={{ ...cellStyle, padding: "8px", textAlign: "right" }}>
                        <Text textVariant={i === 0 ? "label-strong-s" : "body-default-s"} onBackground={n === 0 ? "neutral-weak" : "neutral-strong"}>
                          {n}
                        </Text>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--neutral-alpha-medium)" }}>
                  <th scope="row" style={{ ...cellStyle, padding: "8px" }}>
                    <Text textVariant="label-strong-s">Total</Text>
                  </th>
                  {[totals.confirmed, totals.seated, totals.open].map((n, i) => (
                    <td key={i} style={{ ...cellStyle, padding: "8px", textAlign: "right" }}>
                      <Text textVariant="label-strong-s">{n}</Text>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Column>
      </Row>
    </Column>
  );
}
