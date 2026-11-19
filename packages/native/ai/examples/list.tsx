/**
 * Gold example: list
 * Target: a title, a search field, a filter, a FlatList of pressable rows
 * with a status tag on each, pull to refresh, a sheet with the record's details
 * and an empty state with the action that fills the list.
 */

import {
  Avatar,
  Button,
  Card,
  Column,
  Dialog,
  Heading,
  Icon,
  Input,
  Line,
  Row,
  SegmentedControl,
  Tag,
  Text,
  type Tone,
  useTheme,
} from "@once-ui-system/native";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl } from "react-native";

type Status = "ready" | "brewing" | "collected";

interface Order {
  id: string;
  customer: string;
  initials: string;
  items: string;
  total: string;
  status: Status;
}

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  ready: { label: "Ready", tone: "success" },
  brewing: { label: "Brewing", tone: "warning" },
  collected: { label: "Collected", tone: "neutral" },
};

const ORDERS: Order[] = [
  {
    id: "1042",
    customer: "Anna Kovács",
    initials: "AK",
    items: "Flat white, croissant",
    total: "€6.40",
    status: "ready",
  },
  {
    id: "1043",
    customer: "Bence Tóth",
    initials: "BT",
    items: "Oat latte",
    total: "€4.20",
    status: "brewing",
  },
  {
    id: "1044",
    customer: "Clara Weiss",
    initials: "CW",
    items: "Espresso ×2",
    total: "€5.00",
    status: "collected",
  },
];

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = STATUS[order.status];
  return (
    <Card
      direction="row"
      radius="none"
      border="transparent"
      background="transparent"
      paddingX="20"
      paddingY="12"
      gap="12"
      vertical="center"
      onPress={onPress}
    >
      <Avatar value={order.initials} size="m" />
      <Column flex={1} gap="2">
        <Text textVariant="label-strong-m" truncate>
          {order.customer}
        </Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak" truncate>
          #{order.id} · {order.items}
        </Text>
      </Column>
      <Column horizontal="end" gap="4">
        <Text textVariant="label-strong-s">{order.total}</Text>
        <Tag size="s" tone={status.tone} label={status.label} />
      </Column>
    </Card>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Column center gap="12" paddingX="20" paddingY="48">
      <Icon name="search" size="l" onBackground="neutral-weak" />
      <Text textVariant="body-default-m" onBackground="neutral-medium" align="center">
        No orders match your search.
      </Text>
      <Button variant="secondary" size="s" label="Clear search" onPress={onReset} />
    </Column>
  );
}

export function OrdersScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const orders = useMemo(
    () =>
      ORDERS.filter((order) => filter === "all" || order.status !== "collected").filter((order) =>
        `${order.customer} ${order.id}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [filter, query],
  );

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <Column fill background="page" safeArea={["top"]}>
      <Column paddingX="20" paddingTop="12" paddingBottom="16" gap="16">
        <Heading textVariant="heading-strong-xl">Orders</Heading>
        <Input
          label="Search orders"
          type="search"
          size="s"
          value={query}
          onValueChange={setQuery}
          prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
        />
        <SegmentedControl
          value={filter}
          onValueChange={(value) => setFilter(value as "open" | "all")}
          buttons={[
            { value: "open", label: "Open" },
            { value: "all", label: "All" },
          ]}
        />
      </Column>
      <Line />
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        renderItem={({ item }) => <OrderRow order={item} onPress={() => setSelected(item)} />}
        ItemSeparatorComponent={Line}
        ListEmptyComponent={<EmptyState onReset={() => setQuery("")} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.color("neutral-on-background-weak")}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Order #${selected.id}` : undefined}
        description={selected?.customer}
        footer={
          <Row gap="12" fillWidth>
            <Button variant="secondary" label="Close" fillWidth onPress={() => setSelected(null)} />
            <Button label="Mark collected" fillWidth onPress={() => setSelected(null)} />
          </Row>
        }
      >
        {selected && (
          <Column gap="8" paddingY="8">
            <Row horizontal="between">
              <Text onBackground="neutral-medium">{selected.items}</Text>
              <Text textVariant="label-strong-m">{selected.total}</Text>
            </Row>
            <Row>
              <Tag tone={STATUS[selected.status].tone} label={STATUS[selected.status].label} />
            </Row>
          </Column>
        )}
      </Dialog>
    </Column>
  );
}
