import { Column } from "@once-ui-system/core/components/Column";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import { reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <Column fillWidth gap="24">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Reports
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Scheduled summaries for your team.
        </Text>
      </Column>
      <Column gap="16">
        {reports.map((report) => (
          <Column key={report.title} background="surface" border radius="l" padding="24" gap="8">
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <Heading as="h2" textVariant="heading-strong-s">
                {report.title}
              </Heading>
              <Tag label={report.cadence} size="s" />
            </Row>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              {report.detail}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
