import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { brand } from "@/resources/once-ui.config";

export const metadata: Metadata = pageMetadata("Privacy", `How ${brand.name} handles your data.`, "/privacy");

export default function PrivacyPage() {
  return (
    <Column gap="16">
      <Heading as="h1" variant="display-strong-m">
        Privacy
      </Heading>
      <Text variant="body-default-l">
        {brand.name} stores the account details you give us, the notes your team writes and the organizations you
        belong to. We use them to run the service, never to sell them, and we share them only with the infrastructure
        providers that run it. Questions about your data go to {brand.email}.
      </Text>
    </Column>
  );
}
