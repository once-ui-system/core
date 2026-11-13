import { Column, VisuallyHidden } from "@once-ui-system/core";
import { DeskHeader } from "./DeskHeader";

export function DeskShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth minHeight="100vh">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <DeskHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" s={{ paddingY: "16" }}>
        <Column fillWidth maxWidth={80} gap="24">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
