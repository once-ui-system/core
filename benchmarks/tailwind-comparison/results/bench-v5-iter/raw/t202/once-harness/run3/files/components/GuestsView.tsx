"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  Input,
  Row,
  Select,
  Table,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GUESTS, RSVP_LABEL, TABLES, type Guest, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/PlanContext";

const STANDARD = "Standard menu";
const RSVP_TONE: Record<Rsvp, "success" | "warning" | "info" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "info",
  no: "danger",
};
const TABLE_NAME: Record<string, string> = Object.fromEntries(TABLES.map((t) => [t.id, t.name]));

type GuestRow = Guest & { tableName: string | null };
type MealRow = { meal: string; confirmed: number; possible: number };

const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)));
const DIETS = Array.from(new Set(GUESTS.map((x) => x.diet).filter((d): d is string => d !== null)));

const PARTY_OPTIONS = [
  { value: "all", label: "All parties" },
  ...PARTIES.map((p) => ({ value: p, label: p })),
];
const RSVP_OPTIONS = [
  { value: "all", label: "Any RSVP" },
  ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] })),
];
const DIET_OPTIONS = [
  { value: "all", label: "Any diet" },
  { value: "none", label: "No dietary need" },
  ...DIETS.map((d) => ({ value: d, label: d })),
];

export function GuestsView() {
  const { assign } = usePlan();
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const rows: GuestRow[] = useMemo(
    () =>
      GUESTS.map((x) => {
        const seat = assign[x.id];
        return { ...x, tableName: seat ? (TABLE_NAME[seat.table] ?? seat.table) : null };
      }),
    [assign],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (party !== "all" && r.party !== party) return false;
      if (rsvp !== "all" && r.rsvp !== rsvp) return false;
      if (diet === "none" && r.diet) return false;
      if (diet !== "all" && diet !== "none" && r.diet !== diet) return false;
      return true;
    });
  }, [rows, query, party, rsvp, diet]);

  const meals: MealRow[] = useMemo(() => {
    const map = new Map<string, MealRow>();
    for (const x of GUESTS) {
      if (x.rsvp === "no") continue;
      const meal = x.diet ?? STANDARD;
      const row = map.get(meal) ?? { meal, confirmed: 0, possible: 0 };
      if (x.rsvp === "yes") row.confirmed += 1;
      else row.possible += 1;
      map.set(meal, row);
    }
    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.meal === STANDARD) return -1;
      if (b.meal === STANDARD) return 1;
      return b.confirmed - a.confirmed || a.meal.localeCompare(b.meal);
    });
    return list;
  }, []);

  const confirmedTotal = meals.reduce((s, m) => s + m.confirmed, 0);
  const possibleTotal = meals.reduce((s, m) => s + m.possible, 0);
  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";

  const clear = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const copyMeals = async () => {
    const text = [
      "Meal counts for the caterer (confirmed / maybe or awaiting reply)",
      ...meals.map((m) => `${m.meal}: ${m.confirmed} / ${m.possible}`),
      `Total: ${confirmedTotal} / ${possibleTotal}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      addToast({ tone: "success", message: "Meal counts copied" });
    } catch {
      addToast({ tone: "warning", message: "Copying is not available in this browser" });
    }
  };

  return (
    <Column fillWidth maxWidth="xl" paddingX="16" paddingY="24" gap="20">
      <PageHeader title="Guest list" />

      <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="16" style={{ minWidth: 0 }}>
          <Column background="surface" border radius="l" padding="16" gap="12">
            <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="12" fillWidth>
              <Input
                id="guest-search"
                label="Search guests"
                size="xs"
                value={query}
                onValueChange={setQuery}
              />
              <Select
                id="filter-party"
                label="Party"
                size="xs"
                options={PARTY_OPTIONS}
                value={party}
                onValueChange={(v) => setParty(String(v))}
              />
              <Select
                id="filter-rsvp"
                label="RSVP"
                size="xs"
                options={RSVP_OPTIONS}
                value={rsvp}
                onValueChange={(v) => setRsvp(String(v))}
              />
              <Select
                id="filter-diet"
                label="Diet"
                size="xs"
                options={DIET_OPTIONS}
                value={diet}
                onValueChange={(v) => setDiet(String(v))}
              />
            </Grid>
            <Row gap="12" vertical="center" wrap>
              <Text role="status" aria-live="polite" textVariant="body-default-s" onBackground="neutral-weak">
                Showing {filtered.length} of {GUESTS.length} guests
              </Text>
              {filtersOn ? (
                <Button variant="tertiary" size="s" prefixIcon="close" onClick={clear}>
                  Clear filters
                </Button>
              ) : null}
            </Row>
          </Column>

          <Table<GuestRow>
            aria-label="Guest list"
            rows={filtered}
            getRowId={(r) => r.id}
            stickyHeader
            defaultSort={{ key: "name", direction: "asc" }}
            emptyState={
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                No guests match these filters.
              </Text>
            }
            columns={[
              {
                key: "name",
                header: "Guest",
                sortable: true,
                sort: (a, b) => a.name.localeCompare(b.name),
                cell: (r) => <Text textVariant="label-strong-s">{r.name}</Text>,
              },
              {
                key: "party",
                header: "Party",
                sortable: true,
                sort: (a, b) => a.party.localeCompare(b.party),
                hide: { s: true },
                cell: (r) => <Text textVariant="body-default-s">{r.party}</Text>,
              },
              {
                key: "rsvp",
                header: "RSVP",
                sortable: true,
                sort: (a, b) => a.rsvp.localeCompare(b.rsvp),
                cell: (r) => <Tag size="s" tone={RSVP_TONE[r.rsvp]} label={RSVP_LABEL[r.rsvp]} />,
              },
              {
                key: "diet",
                header: "Diet",
                sortable: true,
                sort: (a, b) => (a.diet ?? "").localeCompare(b.diet ?? ""),
                cell: (r) =>
                  r.diet ? (
                    <Tag size="s" tone="warning" label={r.diet} />
                  ) : (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      None
                    </Text>
                  ),
              },
              {
                key: "table",
                header: "Table",
                sortable: true,
                sort: (a, b) => (a.tableName ?? "~").localeCompare(b.tableName ?? "~"),
                cell: (r) =>
                  r.tableName ? (
                    <Text textVariant="body-default-s">{r.tableName}</Text>
                  ) : r.rsvp === "no" ? (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      Not needed
                    </Text>
                  ) : (
                    <Tag size="s" tone="neutral" label="Not seated" />
                  ),
              },
            ]}
          />
        </Column>

        <Column gap="12" m={{ fillWidth: true }} style={{ width: "24rem", flexShrink: 0 }}>
          <Column background="surface" border radius="l" padding="16" gap="12">
            <Row vertical="center" gap="8">
              <Heading as="h2" textVariant="heading-strong-m" flex={1}>
                Meals for the caterer
              </Heading>
              <Button variant="secondary" size="s" prefixIcon="copy" onClick={copyMeals}>
                Copy
              </Button>
            </Row>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Confirmed guests, with maybes and unanswered invitations counted separately. Declined
              guests are left out.
            </Text>
            <Table<MealRow>
              aria-label="Meal counts"
              rows={meals}
              getRowId={(r) => r.meal}
              compact
              columns={[
                {
                  key: "meal",
                  header: "Meal",
                  cell: (r) => <Text textVariant="label-strong-s">{r.meal}</Text>,
                },
                {
                  key: "confirmed",
                  header: "Confirmed",
                  align: "right",
                  cell: (r) => <Text textVariant="label-strong-s">{r.confirmed}</Text>,
                },
                {
                  key: "possible",
                  header: "Maybe",
                  align: "right",
                  cell: (r) => (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {r.possible}
                    </Text>
                  ),
                },
              ]}
            />
            <Row
              fillWidth
              paddingX="12"
              paddingY="8"
              radius="m"
              background="brand-alpha-weak"
              vertical="center"
              gap="8"
            >
              <Text textVariant="label-strong-s" flex={1}>
                Total meals
              </Text>
              <Text textVariant="label-strong-s">{confirmedTotal} confirmed</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                + {possibleTotal} maybe
              </Text>
            </Row>
          </Column>
        </Column>
      </Row>
    </Column>
  );
}
