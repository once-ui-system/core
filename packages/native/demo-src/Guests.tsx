import { ScrollView } from "react-native";
import { Column, Heading, Table, Tag, Text, useTheme } from "../src";

const GUESTS = [
  ["Anna Kovács", "12", "Oct 18", "Gold"],
  ["Bence Szabó", "4", "Oct 20", "Silver"],
  ["Dóra Nagy", "9", "Oct 12", "Gold"],
  ["Gergő Tóth", "1", "Oct 19", "New"],
  ["Hanna Varga", "6", "Oct 2", "Silver"],
  ["Imre Kiss", "3", "Sep 28", "New"],
  ["Júlia Molnár", "15", "Oct 20", "Gold"],
];

const TONE = { Gold: "warning", Silver: "neutral", New: "brand" } as const;

/** A guest list: Table with search, sort, a column that hides on phones, actions and pages. */
export function Guests() {
  const theme = useTheme();
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="16" safeArea={["top"]}>
        <Column gap="4">
          <Heading textVariant="heading-strong-l">Guests</Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Loyalty members, by visits
          </Text>
        </Column>
        <Table
          searchable
          searchPlaceholder="Search guests"
          paginated
          defaultPageSize={5}
          pageSizeOptions={[5, 10]}
          actions={[{ icon: "moreHorizontal", label: "More", onClick: () => {} }]}
          data={{
            headers: [
              { content: "Guest", key: "name", sortable: true },
              { content: "Visits", key: "visits", sortable: true, width: "96px", align: "right" },
              { content: "Last visit", key: "last", hide: { s: true } },
              { content: "Tier", key: "tier", width: "88px" },
            ],
            rows: GUESTS.map(([name, visits, last, tier]) => [
              name,
              visits,
              last,
              <Tag key="tier" size="s" tone={TONE[tier as keyof typeof TONE]} label={tier} />,
            ]),
          }}
        />
      </Column>
    </ScrollView>
  );
}
