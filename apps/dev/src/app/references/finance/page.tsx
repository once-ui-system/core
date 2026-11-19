"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Avatar,
  Button,
  Column,
  Grid,
  Icon,
  IconButton,
  Nav,
  NavItem,
  NavSection,
  Row,
  SegmentedControl,
  SmartLink,
  StatTile,
  StatusIndicator,
  StyleScope,
  Tag,
  Text,
} from "@once-ui-system/core";
import {
  BarChart,
  Heatmap,
  LineChart,
  PieChart,
  Sparkline,
  Swatch,
} from "@once-ui-system/core/data";
import { useState } from "react";

/**
 * Reference rebuild: a finance overview (stat tiles, a comparison line chart,
 * a donut with its table, a waterfall, a cohort heatmap and AI insight cards).
 * Core components, data module and props only; the look is the StyleScope.
 */

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const growth = months.map((month, i) => ({
  month,
  thisYear: Math.round(104000 + i * 8800 + Math.sin(i / 1.6) * 3200),
  lastYear: Math.round(62000 + i * 4300),
}));

// Plans are identities, not amounts: three distinct data hues in fixed order.
const planColors = ["aqua", "yellow", "blue"] as const;

const plans = [
  { name: "Pro", value: 96900, share: "52.6%" },
  { name: "Scale", value: 49020, share: "26.6%" },
  { name: "Starter", value: 38400, share: "20.8%" },
];

// A waterfall drawn as stacked bars: an invisible base lifts each step.
const movement = [
  { step: "New", base: 0, up: 18400, down: 0, net: 0 },
  { step: "Expand", base: 18400, up: 6200, down: 0, net: 0 },
  { step: "Contract", base: 22500, up: 0, down: 2100, net: 0 },
  { step: "Churn", base: 14900, up: 0, down: 7600, net: 0 },
  { step: "Net", base: 0, up: 0, down: 0, net: 14860 },
];

const cohortRows = [
  [100, 94, 91, 88, 86, 85],
  [100, 95, 91, 89, 87, 85],
  [100, 93, 89, 86, 84, 82],
  [100, 95, 92, 90, 88, 86],
  [100, 96, 93, 90, 89, 87],
  [100, 94, 90, 88, 87],
  [100, 96, 93, 91],
  [100, 95, 92],
  [100, 97],
  [100],
];
const cohorts = cohortRows.map((row, i) => {
  const out: { label: string; [k: string]: string | number | undefined } = { label: months[i] };
  row.forEach((v, m) => {
    // Heatmap scales from 0 to the max, so 82–100% would all draw dark.
    // Shift the values to the 80–100 band and add 80 back when writing them;
    // a Heatmap `domain` prop (3.1) replaces this.
    out[`m${m}`] = v - 80;
  });
  return out;
});

const insights: {
  icon: IconName;
  title: string;
  body: React.ReactNode;
  value: string;
  tone: "danger" | "success";
  action: string;
}[] = [
  {
    icon: "warning",
    title: "Churn led by Pro",
    body: (
      <>
        <Text onBackground="neutral-strong">7 of 11</Text> Pro cancels followed a failed payment.
      </>
    ),
    value: "−$3,400 MRR",
    tone: "danger",
    action: "Recover",
  },
  {
    icon: "people",
    title: "Seat expansion ready",
    body: (
      <>
        <Text onBackground="neutral-strong">14 Scale accounts</Text> are above 90% of seats.
      </>
    ),
    value: "+$4,200 potential",
    tone: "success",
    action: "View accounts",
  },
  {
    icon: "trendUp",
    title: "Strongest cohort start",
    body: (
      <>
        September kept <Text onBackground="neutral-strong">97%</Text> at M1, best this year.
      </>
    ),
    value: "+2 pts vs avg",
    tone: "success",
    action: "Compare",
  },
];

function PanelTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <Row
      fillWidth
      vertical="center"
      horizontal="between"
      paddingX="20"
      paddingTop="16"
      paddingBottom="12"
      gap="8"
    >
      <Text
        textVariant="label-strong-xs"
        onBackground="neutral-weak"
        style={{ letterSpacing: "0.08em" }}
      >
        {children.toUpperCase()}
      </Text>
      {action}
    </Row>
  );
}

const usd = (v: number) => `$${v.toLocaleString("en-US")}`;
const usdK = (v: number) => `$${Math.round(v / 1000)}k`;

export default function FinanceReference() {
  const [period, setPeriod] = useState("month");

  return (
    <StyleScope
      style={{ width: "100%" }}
      config={{
        theme: "light",
        neutral: "slate",
        brand: "custom",
        brandSeed: "#1A8A7A",
        accent: "custom",
        accentSeed: "#1A8A7A",
        solid: "contrast",
        border: "playful",
        pageBackground: "#f6f8f8",
        surfaceBackground: "#ffffff",
      }}
    >
      <Row
        marginX="auto"
        maxWidth="100rem"
        background="page"
        border
        radius="xl"
        overflow="hidden"
        shadow="l"
      >
        {/* Sidebar */}
        <Column width="17rem" borderRight paddingX="12" paddingY="16" gap="16">
          <Row background="surface" border radius="l" padding="8" gap="12" vertical="center">
            <Row solid="neutral-strong" radius="m" width={36} height={36} center>
              <Icon name="trendUp" size="s" onSolid="neutral-strong" />
            </Row>
            <Column fillWidth gap="2">
              <Text textVariant="label-strong-m">Fjell</Text>
              <Text textVariant="label-default-xs" onBackground="neutral-weak">
                Northwind · Finance
              </Text>
            </Column>
            <Icon name="chevronUpDown" size="s" onBackground="neutral-weak" />
          </Row>

          <Nav variant="subtle" density="compact" rail={false} gap="2">
            <NavItem icon="search" label="Search" onClick={() => {}} />
            <NavItem
              icon="inbox"
              truncate={false}
              label={
                <Row width="12rem" horizontal="between" vertical="center">
                  Inbox
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    3
                  </Text>
                </Row>
              }
              href="#"
            />
          </Nav>
          <Nav variant="subtle" density="compact" rail={false} gap="2" borderTop paddingTop="12">
            <NavItem icon="grid" label="Overview" href="#" selected />
            <NavItem icon="trendUp" label="Revenue" href="#" />
            <NavItem
              icon="people"
              truncate={false}
              label={
                <Row width="12rem" horizontal="between" vertical="center">
                  Customers
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    1,096
                  </Text>
                </Row>
              }
              href="#"
            />
            <NavItem icon="layers" label="Plans" href="#" />
            <NavItem icon="table" label="Cohorts" href="#" />
            <NavItem
              icon="personRemove"
              truncate={false}
              label={
                <Row width="12rem" horizontal="between" vertical="center">
                  Churn
                  <Row gap="4" vertical="center">
                    <StatusIndicator tone="danger" size="s" />
                    <Text textVariant="label-default-s" onBackground="danger-medium">
                      23
                    </Text>
                  </Row>
                </Row>
              }
              href="#"
            />
            <NavItem icon="report" label="Reports" href="#" />
          </Nav>
          <Nav variant="subtle" density="compact" rail={false} gap="2" borderTop paddingTop="12">
            <NavSection label="Views">
              <NavItem icon="folder" label="Board packs" href="#" />
              <NavItem icon="folder" label="Pro churn watch" href="#" />
              <NavItem icon="folder" label="EMEA expansion" href="#" />
              <NavItem icon="plus" label="Create view" onClick={() => {}} />
            </NavSection>
          </Nav>

          <Column flex={1} />

          <Column background="surface" border radius="l" padding="16" gap="12">
            <Row gap="12" vertical="center">
              <Row background="brand-alpha-weak" radius="m" width="32" height="32" center>
                <Icon name="sparkle" size="s" onBackground="brand-strong" />
              </Row>
              <Column gap="2">
                <Text textVariant="label-strong-s">Fjell AI</Text>
                <Text textVariant="label-default-xs" onBackground="neutral-weak">
                  3 new revenue insights
                </Text>
              </Column>
            </Row>
            <Text textVariant="body-default-s" onBackground="neutral-medium">
              Ask why revenue moved and get the accounts behind it.
            </Text>
            <Button
              fillWidth
              size="s"
              prefixIcon="sparkle"
              suffixIcon="arrowRight"
              label="Run AI insights"
            />
          </Column>

          <Nav variant="subtle" density="compact" rail={false} gap="2">
            <NavItem icon="settings" label="Settings" href="#" />
            <NavItem icon="help" label="Help & docs" href="#" />
          </Nav>
          <Row borderTop paddingTop="12" paddingX="4" gap="12" vertical="center">
            <Avatar size="m" value="MR" statusIndicator={{ tone: "success" }} />
            <Column fillWidth gap="2">
              <Text textVariant="label-strong-s">Mira Rask</Text>
              <Text textVariant="label-default-xs" onBackground="neutral-weak">
                Head of Finance
              </Text>
            </Column>
            <Icon name="chevronUpDown" size="s" onBackground="neutral-weak" />
          </Row>
        </Column>

        {/* Main */}
        <Column fill>
          <Row paddingX="24" paddingY="12" vertical="center" horizontal="between" borderBottom>
            <Row gap="8" vertical="center">
              <Icon name="grid" size="s" onBackground="neutral-weak" />
              <Text textVariant="label-default-m" onBackground="neutral-weak">
                Northwind
              </Text>
              <Text onBackground="neutral-weak">/</Text>
              <Text textVariant="label-strong-m">Overview</Text>
            </Row>
            <Row gap="8" vertical="center">
              <Button variant="secondary" size="s" prefixIcon="sparkle" label="3 new AI insights" />
              <IconButton
                variant="secondary"
                icon="bell"
                tooltip="Notifications"
                onClick={() => {}}
              />
              <IconButton variant="secondary" icon="dark" tooltip="Theme" onClick={() => {}} />
            </Row>
          </Row>

          <Column padding="24" gap="16">
            <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
              <Column gap="4">
                <Text as="h1" textVariant="display-strong-xs">
                  Welcome back, Mira
                </Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  October 1 – 31, 2026 · compared with September
                </Text>
              </Column>
              <Row gap="8">
                <Button variant="secondary" size="s" prefixIcon="calendar" label="Oct 2026" />
                <Button variant="secondary" size="s" prefixIcon="arrowsRightLeft" label="vs 2025" />
                <Button variant="secondary" size="s" prefixIcon="filter" label="Filter" />
                <Button size="s" prefixIcon="download" label="Export report" />
              </Row>
            </Row>

            <Grid columns="4" gap="12" m={{ columns: "2" }}>
              <StatTile
                label="MRR"
                value="$184,320"
                delta={{ label: "8.8%", direction: "up", tone: "success" }}
                hint="vs $169,460 in Sep"
                chart={
                  <Sparkline
                    data={growth}
                    valueKey="thisYear"
                    variant="area"
                    color="brand"
                    height={36}
                    showLast
                  />
                }
              />
              <StatTile
                label="Net new MRR"
                value="$14,860"
                delta={{ label: "12%", direction: "up", tone: "success" }}
                hint="vs September"
              />
              <StatTile
                label="Churn rate"
                value="2.1%"
                delta={{ label: "0.4 pts", direction: "up", tone: "danger" }}
                hint="23 accounts"
              />
              <StatTile
                label="Net revenue retention"
                value="108%"
                delta={{ label: "2 pts", direction: "up", tone: "success" }}
                hint="trailing 12 months"
              />
            </Grid>

            <Grid columns="3" gap="12" m={{ columns: "1" }}>
              <Column
                style={{ gridColumn: "span 2" }}
                background="surface"
                border
                radius="l"
                overflow="hidden"
              >
                <PanelTitle
                  action={
                    <Row gap="8" vertical="center">
                      <SegmentedControl
                        compact
                        fillWidth={false}
                        value={period}
                        onValueChange={setPeriod}
                        buttons={[
                          { value: "day", label: "Day" },
                          { value: "month", label: "Month" },
                          { value: "year", label: "Year" },
                        ]}
                      />
                      <Button
                        variant="secondary"
                        size="s"
                        suffixIcon="arrowUpRight"
                        label="View report"
                      />
                    </Row>
                  }
                >
                  MRR growth
                </PanelTitle>
                <Column paddingX="20" paddingBottom="16" gap="8">
                  <Row gap="8" style={{ alignItems: "baseline" }}>
                    <Text textVariant="display-strong-xs">+$70,320</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      since January
                    </Text>
                  </Row>
                  <LineChart
                    height="16rem"
                    data={growth}
                    xKey="month"
                    curve="monotone"
                    variant="outline"
                    yDomain={[40000, 200000]}
                    grid="y"
                    border={false}
                    legend={{ display: true, position: "top-right" }}
                    valueFormat={usdK}
                    series={[
                      { key: "thisYear", label: "2026", color: "brand", format: usd },
                      { key: "lastYear", label: "2025", color: "neutral-medium", format: usd },
                    ]}
                  />
                </Column>
              </Column>

              <Column background="surface" border radius="l" overflow="hidden">
                <PanelTitle
                  action={
                    <Button variant="secondary" size="s" suffixIcon="arrowUpRight" label="Plans" />
                  }
                >
                  Revenue by plan
                </PanelTitle>
                <Column paddingX="20" paddingBottom="16" gap="12">
                  <PieChart
                    height="12rem"
                    border={false}
                    ring={{ inner: 66, outer: 80 }}
                    variant="flat"
                    legend={{ display: false }}
                    valueFormat={usd}
                    series={{ key: "value", label: "MRR" }}
                    data={plans.map((p, i) => ({
                      name: p.name,
                      value: p.value,
                      color: planColors[i],
                    }))}
                  />
                  <Column>
                    {plans.map((p, i) => (
                      <Row key={p.name} paddingY="8" gap="8" vertical="center" borderTop={i > 0}>
                        <Swatch size="s" variant="flat" color={`var(--data-${planColors[i]})`} />
                        <Text textVariant="body-default-s" style={{ flex: 1 }}>
                          {p.name}
                        </Text>
                        <Text textVariant="label-strong-s">{usd(p.value)}</Text>
                        <Row width="48" horizontal="end">
                          <Text textVariant="label-default-s" onBackground="neutral-weak">
                            {p.share}
                          </Text>
                        </Row>
                      </Row>
                    ))}
                  </Column>
                </Column>
              </Column>
            </Grid>

            <Grid columns="3" gap="12" m={{ columns: "1" }}>
              <Column background="surface" border radius="l" overflow="hidden">
                <PanelTitle
                  action={
                    <IconButton
                      variant="secondary"
                      size="s"
                      icon="moreHorizontal"
                      tooltip="More"
                      onClick={() => {}}
                    />
                  }
                >
                  MRR movement
                </PanelTitle>
                <Column paddingX="20" paddingBottom="16" gap="8">
                  <Row gap="8" style={{ alignItems: "baseline" }}>
                    <Text textVariant="display-strong-xs">+$14,860</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      net new in October
                    </Text>
                  </Row>
                  <BarChart
                    height="16rem"
                    data={movement}
                    xKey="step"
                    stack
                    variant="flat"
                    barWidth="m"
                    yDomain={[0, 30000]}
                    grid="y"
                    border={false}
                    legend={{ display: false }}
                    valueFormat={usdK}
                    series={[
                      { key: "base", label: "Base", color: "transparent" },
                      { key: "up", label: "Added", color: "emerald" },
                      { key: "down", label: "Lost", color: "red" },
                      { key: "net", label: "Net", color: "cyan" },
                    ]}
                  />
                </Column>
              </Column>

              <Column background="surface" border radius="l" overflow="hidden">
                <PanelTitle>Cohort retention</PanelTitle>
                <Column paddingX="20" paddingBottom="16">
                  <Heatmap
                    data={cohorts}
                    columns={["m0", "m1", "m2", "m3", "m4", "m5"].map((key, i) => ({
                      key,
                      label: `M${i}`,
                    }))}
                    color="brand"
                    valueFormat={(v) => `${v + 80}%`}
                    legend={{ display: true, less: "Low", more: "High" }}
                    aria-label="Cohort retention by signup month"
                  />
                </Column>
              </Column>

              <Column background="surface" border radius="l" overflow="hidden">
                <PanelTitle
                  action={
                    <IconButton
                      variant="secondary"
                      size="s"
                      icon="chat"
                      tooltip="Ask"
                      onClick={() => {}}
                    />
                  }
                >
                  AI insights
                </PanelTitle>
                <Column paddingX="20" paddingBottom="8">
                  {insights.map((ins, i) => (
                    <Row key={ins.title} gap="12" paddingY="16" borderTop={i > 0}>
                      <Icon name={ins.icon} size="s" onBackground="neutral-medium" />
                      <Column fillWidth gap="4">
                        <Text textVariant="label-strong-m">{ins.title}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {ins.body}
                        </Text>
                        <Row fillWidth horizontal="between" vertical="center" paddingTop="8">
                          <Tag size="s" tone={ins.tone} label={ins.value} />
                          <SmartLink href="#" suffixIcon="arrowRight">
                            <Text textVariant="label-strong-s" onBackground="brand-strong">
                              {ins.action}
                            </Text>
                          </SmartLink>
                        </Row>
                      </Column>
                    </Row>
                  ))}
                </Column>
              </Column>
            </Grid>
          </Column>
        </Column>
      </Row>
    </StyleScope>
  );
}
