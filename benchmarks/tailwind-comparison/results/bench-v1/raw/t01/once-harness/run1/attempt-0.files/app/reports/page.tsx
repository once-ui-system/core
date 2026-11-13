import type { Metadata } from "next";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, reportsList } from "@/lib/data";

export const metadata: Metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Saved analytics reports for your team, refreshed every morning."
      />
      <Column as="ul" gap="12">
        {reportsList.map((report) => (
          <Row
            as="li"
            key={report.id}
            background="surface"
            border
            radius="l"
            padding="20"
            horizontal="between"
            vertical="center"
            gap="16"
            wrap
          >
            <Column gap="4" flex={1}>
              <Heading as="h2" textVariant="heading-strong-s">
                {report.title}
              </Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {report.detail}
              </Text>
            </Column>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Updated {formatDate(report.updated)}
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
