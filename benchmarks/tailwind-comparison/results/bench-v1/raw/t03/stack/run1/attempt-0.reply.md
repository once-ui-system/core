Final versions of the projects view (with the `?open=` highlight) and the route files.

```tsx src/components/lumen/ProjectsView.tsx
"use client";

import { Button, Column, Row, Tag, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { formatDate, projects } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

export function ProjectsView() {
  const { openCreate } = useLumen();
  const params = useSearchParams();
  const openKey = params.get("open");
  const opened = projects.find((p) => p.key === openKey);

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
        {projects.map((p) => {
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
```

```tsx src/app/page.tsx
import { LumenShell } from "@/components/lumen/LumenShell";
import { DashboardView } from "@/components/lumen/DashboardView";

export default function Page() {
  return (
    <LumenShell>
      <DashboardView />
    </LumenShell>
  );
}
```

```tsx src/app/(lumen)/layout.tsx
import { LumenShell } from "@/components/lumen/LumenShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <LumenShell>{children}</LumenShell>;
}
```

```tsx src/app/(lumen)/projects/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsView } from "@/components/lumen/ProjectsView";

export const metadata: Metadata = {
  title: "Projects · Lumen",
  description: "Every product your team tracks in Lumen.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsView />
    </Suspense>
  );
}
```

```tsx src/app/(lumen)/members/page.tsx
import type { Metadata } from "next";
import { MembersView } from "@/components/lumen/MembersView";

export const metadata: Metadata = {
  title: "Members · Lumen",
  description: "People with access to your Lumen workspace.",
};

export default function MembersPage() {
  return <MembersView />;
}
```