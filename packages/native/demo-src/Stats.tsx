import { useState } from "react";
import { ScrollView } from "react-native";
import {
  Banner,
  BarChart,
  Button,
  Column,
  ContextMenu,
  DropdownWrapper,
  Heading,
  InfoTip,
  LineChart,
  NumberInput,
  Option,
  Pagination,
  Row,
  Slider,
  Text,
  Timeline,
  User,
  useTheme,
} from "../src";

const WEEK = [
  { day: "Mon", latte: 42, tea: 18 },
  { day: "Tue", latte: 51, tea: 22 },
  { day: "Wed", latte: 38, tea: 30 },
  { day: "Thu", latte: 64, tea: 27 },
  { day: "Fri", latte: 72, tea: 41 },
  { day: "Sat", latte: 88, tea: 53 },
];

const MONTHS = {
  week: [
    { hour: "8", visits: 34 },
    { hour: "10", visits: 52 },
    { hour: "12", visits: 61 },
    { hour: "14", visits: 40 },
    { hour: "16", visits: 47 },
    { hour: "18", visits: 29 },
  ],
  month: [
    { hour: "8", visits: 28 },
    { hour: "10", visits: 44 },
    { hour: "12", visits: 70 },
    { hour: "14", visits: 52 },
    { hour: "16", visits: 38 },
    { hour: "18", visits: 21 },
  ],
};

/** An owner's dashboard for the second batch: charts, menus, sliders, Timeline and more. */
export function Stats() {
  const theme = useTheme();
  const [range, setRange] = useState<"week" | "month">("week");
  const [page, setPage] = useState(1);
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Banner>Saturday was your best day this month</Banner>
      <Column padding="20" gap="20">
        <Row vertical="center" horizontal="between">
          <User name="Morning Coffee" subline="Owner view" avatarProps={{ value: "MC" }} />
          <DropdownWrapper
            placement="bottom-end"
            selectedOption={range}
            onSelect={(v) => setRange(v as "week" | "month")}
            trigger={
              <Button
                variant="secondary"
                size="s"
                label={range === "week" ? "This week" : "This month"}
                suffixIcon="chevronDown"
              />
            }
            dropdown={
              <>
                <Option value="week" label="This week" />
                <Option value="month" label="This month" />
              </>
            }
          />
        </Row>

        <BarChart
          title="Cups sold"
          description="Tap a day for its numbers"
          height="18rem"
          data={WEEK}
          series={[
            { key: "latte", color: "orange" },
            { key: "tea", color: "cyan" },
          ]}
        />

        <LineChart
          title="Visits by hour"
          height="16rem"
          data={MONTHS[range]}
          series={[{ key: "visits", color: "yellow" }]}
        />

        <Column gap="16">
          <Row vertical="center" gap="8">
            <Heading textVariant="heading-strong-s">Today's goal</Heading>
            <InfoTip>Cups to sell before closing. Staff see it on the counter screen.</InfoTip>
          </Row>
          <Slider label="Cups" min={50} max={200} step={5} defaultValue={120} showValue />
          <NumberInput label="Baristas on shift" defaultValue={3} min={1} max={8} />
        </Column>

        <Column gap="12">
          <Heading textVariant="heading-strong-s">Order 0042</Heading>
          <ContextMenu
            dropdown={
              <>
                <Option value="refund" label="Refund" />
                <Option value="print" label="Print receipt" />
                <Option value="cancel" label="Cancel order" danger />
              </>
            }
          >
            <Timeline
              size="s"
              items={[
                { label: "Ordered", description: "8:02", state: "success", marker: "1" },
                { label: "Brewing", description: "About 4 minutes", state: "active", marker: "2" },
                { label: "Ready for pickup", marker: "3" },
              ]}
            />
          </ContextMenu>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Long-press the order for actions.
          </Text>
        </Column>

        <Pagination total={5} page={page} onPageChange={setPage} />
      </Column>
    </ScrollView>
  );
}
