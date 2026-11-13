"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Button, Column, Heading, Icon, Input, Row, SegmentedControl, Select, Tag, Text } from "@once-ui-system/core";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLE_BY_ID,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { useWide } from "@/lib/useWide";
import { C } from "./ui";

const RSVP_TONE: Record<Rsvp, "success" | "warning" | "neutral" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: C.textWeak,
  padding: "8px 12px",
  borderBottom: `1px solid ${C.line}`,
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 14,
  borderBottom: `1px solid ${C.lineWeak}`,
  verticalAlign: "middle",
};

export function GuestsView() {
  const wide = useWide(1100);
  const { tableOf } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [scope, setScope] = useState("confirmed");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return GUESTS.filter((x) => {
      if (query && !x.name.toLowerCase().includes(query)) return false;
      if (party !== "all" && x.party !== party) return false;
      if (rsvp !== "all" && x.rsvp !== rsvp) return false;
      if (diet === "none" && x.diet) return false;
      if (diet !== "all" && diet !== "none" && x.diet !== diet) return false;
      return true;
    });
  }, [q, party, rsvp, diet]);

  const meals = useMemo(() => {
    const counted = GUESTS.filter((x) =>
      scope === "confirmed" ? x.rsvp === "yes" : x.rsvp !== "no",
    );
    const map = new Map<string, { total: number; seated: number }>();
    for (const x of counted) {
      const key = x.diet ?? STANDARD_MEAL;
      const cur = map.get(key) ?? { total: 0, seated: 0 };
      cur.total += 1;
      if (tableOf[x.id]) cur.seated += 1;
      map.set(key, cur);
    }
    const list = Array.from(map.entries()).map(([meal, v]) => ({ meal, ...v }));
    list.sort((a, b) => {
      if (a.meal === STANDARD_MEAL) return -1;
      if (b.meal === STANDARD_MEAL) return 1;
      return b.total - a.total || a.meal.localeCompare(b.meal);
    });
    return {
      list,
      total: counted.length,
      seated: counted.filter((x) => tableOf[x.id]).length,
      special: counted.filter((x) => x.diet).length,
    };
  }, [scope, tableOf]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const mealPanel = (
    <Column background="surface" border radius="l" padding="16" gap="12" flex="1" minWidth="0">
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-s">
          Meals for the caterer
        </Heading>
        <Button
          size="s"
          variant="secondary"
          prefixIcon="document"
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
        >
          Print
        </Button>
      </Row>
      <SegmentedControl
        fillWidth
        compact
        value={scope}
        onValueChange={setScope}
        buttons={[
          { value: "confirmed", label: "Confirmed" },
          { value: "expected", label: "If all reply yes" },
        ]}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Number of meals by menu
        </caption>
        <thead>
          <tr>
            <th scope="col" style={th}>
              Meal
            </th>
            <th scope="col" style={{ ...th, textAlign: "right" }}>
              Guests
            </th>
            <th scope="col" style={{ ...th, textAlign: "right" }}>
              Seated
            </th>
          </tr>
        </thead>
        <tbody>
          {meals.list.map((m) => (
            <tr key={m.meal}>
              <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 500 }}>
                {m.meal}
              </th>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{m.total}</td>
              <td style={{ ...td, textAlign: "right", color: C.textWeak }}>{m.seated}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" style={{ ...td, textAlign: "left", borderBottom: "none" }}>
              Total meals
            </th>
            <td style={{ ...td, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
              {meals.total}
            </td>
            <td style={{ ...td, textAlign: "right", color: C.textWeak, borderBottom: "none" }}>
              {meals.seated}
            </td>
          </tr>
        </tfoot>
      </table>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {meals.special} of {meals.total} meals need something other than the standard menu.
      </Text>
    </Column>
  );

  const listPanel = (
    <Column gap="12" flex="3" minWidth="0">
      <Column background="surface" border radius="l" padding="16" gap="12">
        <Row gap="12" wrap vertical="end">
          <Column flex="2" minWidth="14rem">
            <Input
              id="guest-search"
              label="Search guests"
              size="s"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
              prefix={<Icon name="search" size="xs" />}
            />
          </Column>
          <Column flex="1" minWidth="10rem">
            <Select
              id="filter-party"
              label="Party"
              size="s"
              value={party}
              onValueChange={(v) => setParty(String(v))}
              options={[
                { value: "all", label: "All parties" },
                ...PARTIES.map((p) => ({ value: p, label: p })),
              ]}
            />
          </Column>
          <Column flex="1" minWidth="10rem">
            <Select
              id="filter-rsvp"
              label="RSVP"
              size="s"
              value={rsvp}
              onValueChange={(v) => setRsvp(String(v))}
              options={[
                { value: "all", label: "Any RSVP" },
                ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({
                  value: r,
                  label: RSVP_LABEL[r],
                })),
              ]}
            />
          </Column>
          <Column flex="1" minWidth="10rem">
            <Select
              id="filter-diet"
              label="Diet"
              size="s"
              value={diet}
              onValueChange={(v) => setDiet(String(v))}
              options={[
                { value: "all", label: "Any diet" },
                { value: "none", label: "No dietary need" },
                ...DIETS.map((d) => ({ value: d, label: d })),
              ]}
            />
          </Column>
        </Row>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Text textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            Showing {rows.length} of {GUESTS.length} guests
          </Text>
          {filtersActive ? (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={clear}>
              Clear filters
            </Button>
          ) : null}
        </Row>
      </Column>

      <Column background="surface" border radius="l" overflowX="auto">
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
          <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Guest list
          </caption>
          <thead>
            <tr>
              <th scope="col" style={th}>
                Guest
              </th>
              <th scope="col" style={th}>
                Party
              </th>
              <th scope="col" style={th}>
                RSVP
              </th>
              <th scope="col" style={th}>
                Diet
              </th>
              <th scope="col" style={th}>
                Table
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => {
              const tid = tableOf[x.id];
              return (
                <tr key={x.id}>
                  <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 600 }}>
                    {x.name}
                  </th>
                  <td style={{ ...td, color: C.textWeak }}>{x.party}</td>
                  <td style={td}>
                    <Tag size="s" tone={RSVP_TONE[x.rsvp]} label={RSVP_LABEL[x.rsvp]} />
                  </td>
                  <td style={td}>
                    {x.diet ? <Tag size="s" tone="accent" label={x.diet} /> : <span style={{ color: C.textWeak }}>None</span>}
                  </td>
                  <td style={td}>
                    {tid ? (
                      TABLE_BY_ID[tid].name
                    ) : x.rsvp === "no" ? (
                      <span style={{ color: C.textWeak }}>Not coming</span>
                    ) : (
                      <span style={{ color: C.warning, fontWeight: 600 }}>Unseated</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...td, textAlign: "center", color: C.textWeak, padding: 32 }}>
                  No guest matches these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Column>
    </Column>
  );

  return (
    <>
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Guest list
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Search and filter every guest, see where they sit, and send the meal counts to the caterer.
        </Text>
      </Column>
      {wide ? (
        <Row gap="16" vertical="start">
          {listPanel}
          <Column flex="1" style={{ width: "24rem", maxWidth: "24rem", flexShrink: 0 }}>
            {mealPanel}
          </Column>
        </Row>
      ) : (
        <Column gap="16">
          {mealPanel}
          {listPanel}
        </Column>
      )}
    </>
  );
}
