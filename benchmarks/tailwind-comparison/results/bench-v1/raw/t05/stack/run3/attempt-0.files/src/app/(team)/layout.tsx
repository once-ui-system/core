import { Column, VisuallyHidden } from "@once-ui-system/core";
import { TeamHeader } from "@/components/team/TeamHeader";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <TeamHeader />
      {children}
    </Column>
  );
}
