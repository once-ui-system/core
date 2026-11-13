import { Column } from "@once-ui-system/core";
import { Wizard } from "@/components/onboarding/Wizard";

export const metadata = {
  title: "Get started with Lumen",
  description: "Set up your Lumen account and workspace in four quick steps.",
};

export default function Page() {
  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <Wizard />
    </Column>
  );
}
