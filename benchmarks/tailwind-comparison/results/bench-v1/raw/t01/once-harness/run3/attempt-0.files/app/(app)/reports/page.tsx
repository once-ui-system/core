import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Reports · Lumen" };

const reports = [
  {
    title: "Weekly issue throughput",
    summary: "Issues opened versus closed across all active projects.",
    cadence: "Weekly",
  },
  {
    title: "Feature adoption",
    summary: "How many accounts used each shipped feature in the last 30 days.",
    cadence: "Monthly",
  },
  {
    title: "Cycle time by project",
    summary: "Median time from first commit to a closed issue, per project.",
    cadence: "Weekly",
  },
];

export default function ReportsPage() {
  return (
    <Column gap="24">
      <PageHeader title="Reports" description="Scheduled summaries your team can open or share." />
      <Grid columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="ul" padding="0" margin="0">
        {reports.map((report) => (
          <Column
            as="li"
            key={report.title}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="12"
          >
            <Heading as="h2" textVariant="heading-strong-m">
              {report.title}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {report.summary}
            </Text>
            <Row>
              <Tag label={report.cadence} size="s" />
            </Row>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
