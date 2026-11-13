import type { Metadata } from "next";
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { TeamClient } from "@/components/team/TeamClient";
import { TeamHeader } from "@/components/team/TeamHeader";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description:
    "Manage who has access to your Lumen workspace: invite people, change roles and review member status.",
};

export default function Page() {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <TeamHeader />
      <TeamClient />
    </Column>
  );
}
