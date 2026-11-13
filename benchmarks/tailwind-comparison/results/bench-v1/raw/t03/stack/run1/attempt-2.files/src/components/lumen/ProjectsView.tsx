"use client";

import { Button, Column, Row, Tag, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { formatDate, projects } from "@/lib/data";
import type { Project, ProjectStatus } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsView() {
  const { openCreate } = useLumen();
  const params = useSearchParams();
  const openKey = params.get("open");
  const opened: Project | undefined = projects.find((p: Project) => p.key === openKey);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every product your team tracks in Lumen."
        actions={<Button size="s" prefixIcon="plus" label="Create project" onClick={openCreate} />}
      />

      {opened && (
        <Text role="status" variant="body-default-s" onBackground="brand-medium">
          Opened {opened.name} ({opened.key})
        </Text>
      )}

      <Column
        as="ul"
        fillWidth
        gap="12"
        margin="0"
        padding="0"
        style={{ listStyle: "none" }}
        aria-label="Projects"
      >
        {projects.map((p: Project) => {
          const isOpened = p.key === openKey;
          return (
            <Row
              as="li"
              key={p.key}
              background="page"
              border={isOpened ? "brand-alpha-strong" : true}
              borderWidth={isOpened ? 2 : 1}
              radius="l"
              padding="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              aria-current={isOpened ? "true" : undefined}
            >
              <Row gap="16" vertical="center" flex={1} minWidth={12}>
                <Row
                  center
                  width="40"
                  height="40"
                  radius="m"
                  background="neutral-alpha-weak"
                  aria-hidden="true"
                >
                  <Text variant="label-strong-xs">{p.key}</Text>
                </Row>
                <Column gap="2">
                  <Text variant="label-strong-m">{p.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Updated {formatDate(p.updated)}
                  </Text>
                </Column>
              </Row>
              <Row gap="16" vertical="center">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {p.issues} {p.issues === 1 ? "issue" : "issues"}
                </Text>
                <Tag scheme={statusScheme[p.status]} label={p.status} />
              </Row>
            </Row>
          );
        })}
      </Column>
    </>
  );
}
