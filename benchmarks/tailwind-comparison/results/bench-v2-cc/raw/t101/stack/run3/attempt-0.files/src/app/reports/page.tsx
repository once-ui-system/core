import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { projects, totalIssues } from "@/lib/data";

export const metadata = { title: "Reports" };

export default function Page() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Reports
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Open issues by project, {totalIssues} in total.
        </Text>
      </Column>
      <Column background="surface" border radius="s" padding="16" gap="12">
        <Heading as="h2" variant="heading-strong-m">
          Open issues by project
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="12" style={{ listStyle: "none" }}>
          {projects.map((project) => (
            <Row as="li" key={project.key} vertical="center" gap="12">
              <Text variant="code-default-s" onBackground="neutral-weak" style={{ width: "3rem" }}>
                {project.key}
              </Text>
              <Row fillWidth height="8" background="neutral-alpha-weak" radius="xs">
                <Row
                  height="8"
                  background="brand-solid-strong"
                  radius="xs"
                  style={{ width: `${(project.issues / max) * 100}%` }}
                />
              </Row>
              <Text variant="label-default-s" style={{ width: "2rem", textAlign: "right" }}>
                {project.issues}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}
