import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <Column gap="16">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Reports
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          Saved reports for the workspace.
        </Text>
      </Column>
      <Column as="ul" padding="0" margin="0" background="surface" border radius="m">
        {reports.map((report) => (
          <Row as="li" key={report.name} padding="12" gap="12" vertical="center" wrap borderBottom>
            <Text textVariant="label-strong-s" flex={1}>
              {report.name}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {report.cadence}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {report.owner}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
