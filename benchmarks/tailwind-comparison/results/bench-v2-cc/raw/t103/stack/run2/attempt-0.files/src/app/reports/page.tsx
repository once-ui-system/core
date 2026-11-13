import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Reports
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          The workspace holds {total} open issues across {projects.length} projects.
        </Text>
      </Column>
      <Column background="neutral-alpha-weak" border radius="m" padding="20" gap="8">
        <Heading as="h2" variant="heading-strong-s">
          Weekly digest
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customer app carries the most open issues (31). Reports will appear here once a week of data is collected.
        </Text>
      </Column>
    </>
  );
}
