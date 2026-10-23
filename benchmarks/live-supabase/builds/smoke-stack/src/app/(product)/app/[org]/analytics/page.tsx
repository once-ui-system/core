import { Column, Heading, Row, Schema, Text, Background, Tag, Meta, BlobFx } from "@once-ui-system/core";
import { LineChart, RadialGauge, BarChart, PieChart } from "@once-ui-system/core/data";
import { baseURL, product } from "@/resources";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { requireOrgFeature } from "@/lib/billing/server";
import { UpgradeNotice } from "../components/UpgradeNotice";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.analytics.title,
    description: product.analytics.description,
    baseURL: baseURL,
    path: orgPath(org, "/analytics"),
    image: product.analytics.image,
    robots: product.analytics.robots,
    alternates: product.analytics.alternates,
  });
}

export default async function Analytics({ params }: PageProps) {
  const { org } = await params;

  // A plan feature with the billing slice; the [org] layout already checked membership.
  if (isSupabaseConfigured()) {
    const gate = await requireOrgFeature(org, "analytics");
    if (!gate.ok && gate.status === 402) return <UpgradeNotice org={org} feature="Analytics" />;
  }

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.analytics.title}
        description={product.analytics.description}
        path={orgPath(org, "/analytics")}
      />
      <Column fillWidth gap="8" paddingX="16">
        <Row vertical="center" fillWidth horizontal="between" gap="8" wrap>
          <Heading variant="display-strong-s">
            Analytics
          </Heading>
        </Row>
      </Column>
      <Row fillWidth gap="8" m={{direction: "column-reverse"}}>
        <Row flex={3}>
          <LineChart
            data-viz-style="sequential"
            style={{height: "auto"}}
            axis="x"
            title={<Row gap="4" vertical="center">Revenue: <Text marginRight="8" onBackground="neutral-weak">$24,345</Text><Tag scheme="success" prefixIcon="trendUp">12.5%</Tag></Row>}
            date={{
              start: new Date("2024-12-31"),
              end: new Date("2025-01-31"),
              format: "MMM dd",
              selector: true,
              dual: true,
              presets: {
                display: true,
                granularity: "week"
              },
            }}
            grid="y"
            series={[
              { key: "Current period", color: "aqua" },
              { key: "Previous period", color: "pink" }
            ]}
            data={[
              { date: "2025-01-01", "Current period": 4654, "Previous period": 1365 },
              { date: "2025-01-02", "Current period": 1575, "Previous period": 3457 },
              { date: "2025-01-03", "Current period": 5557, "Previous period": 4355 },
              { date: "2025-01-04", "Current period": 6525, "Previous period": 5252 },
              { date: "2025-01-05", "Current period": 5534, "Previous period": 6453 },
              { date: "2025-01-06", "Current period": 4375, "Previous period": 3347 },
              { date: "2025-01-07", "Current period": 5456, "Previous period": 2245 },
              { date: "2025-01-08", "Current period": 5425, "Previous period": 2142 },
              { date: "2025-01-09", "Current period": 2412, "Previous period": 1041 },
              { date: "2025-01-10", "Current period": 4375, "Previous period": 1137 },
              { date: "2025-01-11", "Current period": 3345, "Previous period": 7234 },
              { date: "2025-01-12", "Current period": 5123, "Previous period": 1312 },
              { date: "2025-01-13", "Current period": 6912, "Previous period": 4291 },
              { date: "2025-01-14", "Current period": 8654, "Previous period": 3165 },
              { date: "2025-01-15", "Current period": 4234, "Previous period": 2023 },
              { date: "2025-01-16", "Current period": 3423, "Previous period": 1142 },
              { date: "2025-01-17", "Current period": 2312, "Previous period": 231 },
              { date: "2025-01-18", "Current period": 1234, "Previous period": 3423 }
            ]}
          />
        </Row>
        <Column flex={1} radius="xl" border overflow="hidden">
        <BlobFx data-solid="color" position="absolute" top="0" left="0" fill translateY="60%" />
          <Column fill center gap="8" padding="40">
            <Row textVariant="label-default-xs" onBackground="brand-medium" align="center" marginBottom="20">16d left</Row>
            <RadialGauge
              width={280}
              height={280}
              value={42}
              unit="%"
              line={{
                count: 48,
                width: 2,
                length: 24,
              }}
            />
            <Text variant="label-default-s" onBackground="neutral-weak" align="center" marginTop="24">Monthly target</Text>
            <Text variant="heading-strong-l" align="center">$27,000</Text>
          </Column>
        </Column>
      </Row>

      <Row fillWidth gap="8" m={{direction: "column"}}>
        <LineChart
          data-viz-style="sequential"
          axis="x"
          height={24}
          title={<Row gap="4" vertical="center">Customers: <Text onBackground="neutral-weak" marginRight="8">1,248</Text><Tag scheme="danger" prefixIcon="trendDown">1.75%</Tag></Row>}
          date={{
            start: new Date("2024-12-31"),
            end: new Date("2025-01-31"),
            format: "dd",
            selector: true,
            dual: true,
            presets: {
              display: true,
              granularity: "week"
            },
          }}
          grid="y"
          series={[
            { key: "Current period", color: "aqua" },
            { key: "Previous period", color: "pink" }
          ]}
          data={[
            { date: "2025-01-01", "Current period": 264, "Previous period": 365 },
            { date: "2025-01-02", "Current period": 355, "Previous period": 157 },
            { date: "2025-01-03", "Current period": 757, "Previous period": 755 },
            { date: "2025-01-04", "Current period": 255, "Previous period": 252 },
            { date: "2025-01-05", "Current period": 954, "Previous period": 453 },
            { date: "2025-01-06", "Current period": 1475, "Previous period": 347 },
            { date: "2025-01-07", "Current period": 646, "Previous period": 945 },
            { date: "2025-01-08", "Current period": 565, "Previous period": 142 },
            { date: "2025-01-09", "Current period": 442, "Previous period": 241 },
            { date: "2025-01-10", "Current period": 435, "Previous period": 437 },
            { date: "2025-01-11", "Current period": 235, "Previous period": 534 },
            { date: "2025-01-12", "Current period": 513, "Previous period": 312 },
            { date: "2025-01-13", "Current period": 292, "Previous period": 291 },
            { date: "2025-01-14", "Current period": 864, "Previous period": 865 },
            { date: "2025-01-15", "Current period": 824, "Previous period": 423 },
            { date: "2025-01-16", "Current period": 393, "Previous period": 12 },
            { date: "2025-01-17", "Current period": 232, "Previous period": 91 },
            { date: "2025-01-18", "Current period": 124, "Previous period": 523 }
          ]}
        />
        <Row fillWidth>
          <BarChart
            data-viz-style="sequential"
            height={24}
            title="Revenue by product category"
            description="January 2025"
            axis="none"
            date={{
              start: new Date("2024-12-31"),
              end: new Date("2025-01-31"),
              format: "MMM dd",
              selector: true,
              dual: true,
              presets: {
                display: true,
                granularity: "week"
              },
            }}
            legend={{
              position: "bottom-center"
            }}
            series={[
              { key: "Software", color: "aqua" },
              { key: "Services", color: "pink" },
              { key: "Hardware", color: "indigo" }
            ]}
            data={[
              { label: "Jan 2025", "Software": 14500, "Services": 6200, "Hardware": 3645 }
            ]}
          />
        </Row>
      </Row>
      <Row fillWidth gap="8" m={{direction: "column"}}>
        <LineChart
          data-viz-style="sequential"
          axis="x"
          height={24}
          title={<Row gap="4" vertical="center">Conversion rate: <Text onBackground="neutral-weak" marginRight="8">3.2%</Text><Tag scheme="success" prefixIcon="trendUp">8.3%</Tag></Row>}
          date={{
            start: new Date("2024-12-31"),
            end: new Date("2025-01-31"),
            format: "dd",
            selector: true,
            dual: true,
            presets: {
              display: true,
              granularity: "week"
            },
          }}
          grid="y"
          series={[
            { key: "Current period", color: "aqua" },
            { key: "Previous period", color: "pink" }
          ]}
          data={[
            { date: "2025-01-01", "Current period": 2.8, "Previous period": 2.4 },
            { date: "2025-01-02", "Current period": 3.1, "Previous period": 2.7 },
            { date: "2025-01-03", "Current period": 3.5, "Previous period": 3.2 },
            { date: "2025-01-04", "Current period": 2.9, "Previous period": 2.8 },
            { date: "2025-01-05", "Current period": 4.2, "Previous period": 3.5 },
            { date: "2025-01-06", "Current period": 3.8, "Previous period": 3.1 },
            { date: "2025-01-07", "Current period": 3.3, "Previous period": 2.9 },
            { date: "2025-01-08", "Current period": 3.6, "Previous period": 3.0 },
            { date: "2025-01-09", "Current period": 2.7, "Previous period": 2.5 },
            { date: "2025-01-10", "Current period": 3.9, "Previous period": 3.3 },
            { date: "2025-01-11", "Current period": 3.2, "Previous period": 2.8 },
            { date: "2025-01-12", "Current period": 4.1, "Previous period": 3.7 },
            { date: "2025-01-13", "Current period": 3.4, "Previous period": 3.1 },
            { date: "2025-01-14", "Current period": 3.7, "Previous period": 3.4 },
            { date: "2025-01-15", "Current period": 3.0, "Previous period": 2.6 },
            { date: "2025-01-16", "Current period": 3.5, "Previous period": 3.2 },
            { date: "2025-01-17", "Current period": 2.9, "Previous period": 2.7 },
            { date: "2025-01-18", "Current period": 3.3, "Previous period": 3.0 }
          ]}
        />
        <PieChart
          data-viz-style="sequential"
          height={24}
          title="Traffic sources"
          date={{
            start: new Date("2024-12-31"),
            end: new Date("2025-01-31"),
            format: "MMM dd",
            selector: true,
            dual: true,
            presets: {
              display: true,
              granularity: "week"
            },
          }}
          legend={{
            display: true,
            position: "bottom-center",
          }}
          ring={{ inner: 50, outer: 70 }}
          series={{
            key: "value",
          }}
          data={[
            { name: "Organic Search", value: 42 },
            { name: "Direct", value: 28 },
            { name: "Social Media", value: 18 },
            { name: "Referral", value: 12 }
          ]}
        />
      </Row>
    </>
  );
}