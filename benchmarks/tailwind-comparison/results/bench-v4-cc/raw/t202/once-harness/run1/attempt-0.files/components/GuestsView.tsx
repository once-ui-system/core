"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  TABLE_BY_ID,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { dietTone, dotBg, toneOf } from "@/lib/theme";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  whiteSpace: "nowrap",
  borderBottom: "1px solid color-mix(in srgb, currentColor 16%, transparent)",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "top",
  borderBottom: "1px solid color-mix(in srgb, currentColor 8%, transparent)",
};

const RSVP_TONE: Record<Rsvp, "success" | "warning" | "neutral"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "neutral",
};

const STANDARD = "Standard menu";

export function GuestsView() {
  const { locations } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [mealScope, setMealScope] = useState("yes");

  const tableName = (g: Guest): string | null => {
    const loc = locations[g.id];
    return loc ? TABLE_BY_ID[loc.tableId].name : null;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (!needle) return true;
      const loc = locations[g.id];
      const hay = [g.name, g.party, g.diet ?? "", loc ? TABLE_BY_ID[loc.tableId].name : "unseated"]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, party, rsvp, diet, locations]);

  const meals = useMemo(() => {
    const inScope = GUESTS.filter((g) => (mealScope === "yes" ? g.rsvp === "yes" : g.rsvp !== "no"));
    const map = new Map<string, Guest[]>();
    for (const g of inScope) {
      const key = g.diet ?? STANDARD;
      map.set(key, [...(map.get(key) ?? []), g]);
    }
    const rows = Array.from(map.entries()).sort((a, b) => {
      if (a[0] === STANDARD) return -1;
      if (b[0] === STANDARD) return 1;
      return b[1].length - a[1].length || a[0].localeCompare(b[0]);
    });
    return { rows, total: inScope.length };
  }, [mealScope]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Guest list
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {GUESTS.length} guests invited. Tables follow the seating plan.
          </Text>
        </Column>
        <Button
          variant="secondary"
          size="s"
          prefixIcon="document"
          onClick={() => window.print()}
        >
          Print for caterer
        </Button>
      </Row>

      <Panel
        title="Meals for the caterer"
        subtitle="One count per menu, including dietary needs"
        action={
          <Row maxWidth="24rem">
            <SegmentedControl
              compact
              value={mealScope}
              onValueChange={setMealScope}
              buttons={[
                { value: "yes", label: "Attending" },
                { value: "all", label: "Plus maybe and no reply" },
              ]}
            />
          </Row>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <VisuallyHidden as="caption">Meal counts</VisuallyHidden>
            <thead>
              <tr>
                <th scope="col" style={th}>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    Meal
                  </Text>
                </th>
                <th scope="col" style={{ ...th, textAlign: "right" }}>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    Meals
                  </Text>
                </th>
                <th scope="col" style={th}>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    Who, and where they sit
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {meals.rows.map(([meal, list]) => (
                <tr key={meal}>
                  <th scope="row" style={{ ...td, textAlign: "left", whiteSpace: "nowrap" }}>
                    <Text textVariant="label-strong-s">{meal}</Text>
                  </th>
                  <td style={{ ...td, textAlign: "right" }}>
                    <Text textVariant="label-strong-s">{list.length}</Text>
                  </td>
                  <td style={td}>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {meal === STANDARD
                        ? "Everyone without a dietary need"
                        : list.map((g) => `${g.name} (${tableName(g) ?? "no table yet"})`).join(", ")}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" style={{ ...td, textAlign: "left" }}>
                  <Text textVariant="label-strong-s">Total</Text>
                </th>
                <td style={{ ...td, textAlign: "right" }}>
                  <Text textVariant="label-strong-s">{meals.total}</Text>
                </td>
                <td style={td} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>

      <Panel title="Everyone invited">
        <Row gap="12" wrap vertical="end">
          <Row flex={1} minWidth="14rem">
            <Input
              id="guest-search"
              label="Search guests"
              placeholder="Search by name, party, diet or table"
              size="xs"
              value={q}
              onValueChange={setQ}
              prefix={undefined}
            />
          </Row>
          <Row minWidth="11rem" flex={1}>
            <Select
              id="filter-party"
              label="Party"
              size="xs"
              value={party}
              onValueChange={(v) => setParty(String(v))}
              options={[
                { value: "all", label: "All parties" },
                ...PARTIES.map((p) => ({ value: p, label: p })),
              ]}
            />
          </Row>
          <Row minWidth="10rem" flex={1}>
            <Select
              id="filter-rsvp"
              label="RSVP"
              size="xs"
              value={rsvp}
              onValueChange={(v) => setRsvp(String(v))}
              options={[
                { value: "all", label: "Any RSVP" },
                ...(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => ({
                  value: r,
                  label: RSVP_LABEL[r],
                })),
              ]}
            />
          </Row>
          <Row minWidth="11rem" flex={1}>
            <Select
              id="filter-diet"
              label="Diet"
              size="xs"
              value={diet}
              onValueChange={(v) => setDiet(String(v))}
              options={[
                { value: "all", label: "Any diet" },
                { value: "none", label: "No dietary need" },
                ...DIETS.map((d) => ({ value: d, label: d })),
              ]}
            />
          </Row>
        </Row>
        <Row gap="8" vertical="center" horizontal="between" wrap role="status" aria-live="polite">
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Showing {filtered.length} of {GUESTS.length} guests
          </Text>
          {filtersActive ? (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={clear}>
              Clear filters
            </Button>
          ) : null}
        </Row>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <VisuallyHidden as="caption">Guest list</VisuallyHidden>
            <thead>
              <tr>
                {["Guest", "Party", "RSVP", "Diet", "Table"].map((h) => (
                  <th key={h} scope="col" style={th}>
                    <Text textVariant="label-default-xs" onBackground="neutral-weak">
                      {h}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const t = tableName(g);
                return (
                  <tr key={g.id}>
                    <th scope="row" style={{ ...td, textAlign: "left" }}>
                      <Text textVariant="label-strong-s">{g.name}</Text>
                    </th>
                    <td style={td}>
                      <Row gap="8" vertical="center">
                        <Row width={10} height={10} radius="full" background={dotBg(toneOf(g.party))} />
                        <Text textVariant="body-default-s">{g.party}</Text>
                      </Row>
                    </td>
                    <td style={td}>
                      <Tag size="s" tone={RSVP_TONE[g.rsvp]} label={RSVP_LABEL[g.rsvp]} />
                    </td>
                    <td style={td}>
                      {g.diet ? (
                        <Tag size="s" tone={dietTone(g.diet)} label={g.diet} />
                      ) : (
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          None
                        </Text>
                      )}
                    </td>
                    <td style={td}>
                      {t ? (
                        <Text textVariant="label-default-s">{t}</Text>
                      ) : (
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          {g.rsvp === "no" ? "Not coming" : "Not seated"}
                        </Text>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <Column center padding="24" gap="8">
            <Text textVariant="label-strong-s">No guests match</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Try a different search or clear the filters.
            </Text>
          </Column>
        ) : null}
      </Panel>
    </>
  );
}
