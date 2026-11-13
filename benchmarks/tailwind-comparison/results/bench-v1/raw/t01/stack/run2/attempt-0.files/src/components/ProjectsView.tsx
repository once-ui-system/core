import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsView() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in Acme Labs.
        </Text>
      </Column>

      <Column
        background="surface"
        border
        radius="l"
        overflowX="auto"
        fillWidth
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "32rem",
            textAlign: "left",
          }}
        >
          <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Projects in your workspace
          </caption>
          <thead>
            <tr>
              {["Key", "Name", "Status", "Issues", "Updated"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--neutral-alpha-medium)",
                    textAlign: heading === "Issues" ? "right" : "left",
                  }}
                >
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {heading}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.key}>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Text variant="code-default-s">{project.key}</Text>
                </td>
                <th scope="row" style={{ padding: "0.75rem 1rem", fontWeight: "inherit", textAlign: "left" }}>
                  <Text variant="label-strong-s">{project.name}</Text>
                </th>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Tag scheme={statusScheme[project.status]} size="s" label={project.status} />
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  <Text variant="body-default-s">{project.issues}</Text>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Column>
    </Column>
  );
}
