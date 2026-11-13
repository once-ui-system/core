import { Column, Heading, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Reports · Lumen" };

const reports = [
  { title: "Weekly issue throughput", body: "Issues opened and closed per project, delivered every Monday." },
  { title: "Release health", body: "Crash-free sessions and regressions for each shipped build." },
  { title: "Team workload", body: "Open issues per assignee, to spot overloaded teammates early." },
];

export default function ReportsPage() {
  return (
    <Column gap="32">
      <PageHeader
        title="Reports"
        description="Scheduled summaries for your team."
      />
      <Column as="ul" gap="12" padding="0" margin="0">
        {reports.map((r) => (
          <Column
            as="li"
            key={r.title}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="4"
          >
            <Heading as="h2" textVariant="heading-strong-s">
              {r.title}
            </Heading>
            <Text onBackground="neutral-weak" textVariant="body-default-s">
              {r.body}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
