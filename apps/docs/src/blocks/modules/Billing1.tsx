"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  IconButton,
  ProgressBar,
  Row,
  Table,
  Tag,
  Text,
} from "@once-ui-system/core";

const plan = {
  name: "Team",
  price: "$48",
  period: "per month, billed yearly",
  renews: "Renews on Jan 12, 2027",
  seats: { used: 7, total: 10 },
  card: { brand: "Visa", last4: "4242", expires: "08/28" },
};

const usage = [
  { label: "AI generations", used: 8420, limit: 10000, unit: "" },
  { label: "Storage", used: 34, limit: 50, unit: " GB" },
  { label: "Bandwidth", used: 412, limit: 500, unit: " GB" },
];

type Invoice = { id: string; date: string; amount: string; status: "Paid" | "Due" };

const invoices: Invoice[] = [
  { id: "INV-0142", date: "Nov 12, 2026", amount: "$48.00", status: "Due" },
  { id: "INV-0131", date: "Oct 12, 2026", amount: "$48.00", status: "Paid" },
  { id: "INV-0120", date: "Sep 12, 2026", amount: "$48.00", status: "Paid" },
  { id: "INV-0109", date: "Aug 12, 2026", amount: "$36.00", status: "Paid" },
];

const percent = (used: number, limit: number) => Math.round((used / limit) * 100);

/**
 * A billing page: the current plan with its seats and card, usage against
 * each limit (warning once a meter passes 80%), and the invoice history.
 */
export const Billing1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" padding="l" {...flex}>
      <Column maxWidth="l" gap="32">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", vertical: "start" }}
        >
          <Column gap="4">
            <Heading as="h1" textVariant="heading-strong-xl">
              Billing
            </Heading>
            <Text onBackground="neutral-weak">Your plan, usage and invoices.</Text>
          </Column>
          <Row gap="8">
            <Button variant="secondary" size="s" href="#">
              Compare plans
            </Button>
            <Button size="s" href="#">
              Upgrade
            </Button>
          </Row>
        </Row>

        <Row fillWidth gap="16" m={{ direction: "column" }}>
          <Column flex={2} background="surface" border radius="l" padding="24" gap="24">
            <Row horizontal="between" vertical="start" gap="16">
              <Column gap="8">
                <Row gap="8" vertical="center">
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    Current plan
                  </Text>
                  <Tag size="s" tone="brand">
                    {plan.name}
                  </Tag>
                </Row>
                <Row gap="8" style={{ alignItems: "baseline" }}>
                  <Heading as="p" textVariant="display-strong-s">
                    {plan.price}
                  </Heading>
                  <Text onBackground="neutral-weak">{plan.period}</Text>
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {plan.renews}
                </Text>
              </Column>
              <IconButton icon="moreHorizontal" variant="tertiary" aria-label="Plan options" />
            </Row>
            <Column gap="8" paddingTop="20" borderTop>
              <Row horizontal="between" textVariant="label-default-s">
                <Text>Seats</Text>
                <Text onBackground="neutral-weak">
                  {plan.seats.used} of {plan.seats.total} used
                </Text>
              </Row>
              <ProgressBar
                value={plan.seats.used}
                max={plan.seats.total}
                showLabel={false}
                size="s"
              />
            </Column>
          </Column>

          <Column
            flex={1}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            vertical="between"
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              Payment method
            </Text>
            <Row gap="12" vertical="center">
              <Row background="neutral-alpha-weak" radius="m" padding="8" border>
                <Icon name="payment" size="s" />
              </Row>
              <Column>
                <Text textVariant="body-strong-s">
                  {plan.card.brand} ending {plan.card.last4}
                </Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Expires {plan.card.expires}
                </Text>
              </Column>
            </Row>
            <Button variant="secondary" size="s" fillWidth href="#">
              Update card
            </Button>
          </Column>
        </Row>

        <Column gap="16">
          <Heading as="h2" textVariant="heading-strong-l">
            Usage this period
          </Heading>
          <Grid columns={3} gap="16" m={{ columns: 1 }}>
            {usage.map((meter) => {
              const share = percent(meter.used, meter.limit);
              const high = share >= 80;
              return (
                <Column
                  key={meter.label}
                  background="surface"
                  border
                  radius="l"
                  padding="20"
                  gap="12"
                >
                  <Row horizontal="between" vertical="center">
                    <Text textVariant="label-default-s">{meter.label}</Text>
                    {high && (
                      <Tag size="s" tone="warning" prefixIcon="warning">
                        {share}%
                      </Tag>
                    )}
                  </Row>
                  <Text textVariant="heading-strong-m">
                    {meter.used.toLocaleString("en-US")}
                    {meter.unit}
                    <Text as="span" textVariant="body-default-s" onBackground="neutral-weak">
                      {" "}
                      / {meter.limit.toLocaleString("en-US")}
                      {meter.unit}
                    </Text>
                  </Text>
                  <ProgressBar
                    value={meter.used}
                    max={meter.limit}
                    showLabel={false}
                    size="s"
                    barBackground={high ? "warning-strong" : "brand-strong"}
                  />
                </Column>
              );
            })}
          </Grid>
        </Column>

        <Column gap="16">
          <Heading as="h2" textVariant="heading-strong-l">
            Invoices
          </Heading>
          <Table<Invoice>
            rows={invoices}
            columns={[
              { key: "id", header: "Invoice", cell: (row) => row.id },
              { key: "date", header: "Date", cell: (row) => row.date },
              { key: "amount", header: "Amount", align: "right", cell: (row) => row.amount },
              {
                key: "status",
                header: "Status",
                cell: (row) => (
                  <Tag size="s" tone={row.status === "Paid" ? "success" : "warning"}>
                    {row.status}
                  </Tag>
                ),
              },
              {
                key: "download",
                header: "",
                align: "right",
                cell: (row) => (
                  <IconButton
                    icon="download"
                    variant="tertiary"
                    size="s"
                    aria-label={`Download ${row.id}`}
                    href="#"
                  />
                ),
              },
            ]}
          />
        </Column>
      </Column>
    </Column>
  );
};
