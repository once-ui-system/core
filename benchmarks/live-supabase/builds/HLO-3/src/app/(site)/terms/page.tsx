import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { brand } from "@/resources/once-ui.config";

export const metadata: Metadata = pageMetadata("Terms", `The terms for using ${brand.name}.`, "/terms");

export default function TermsPage() {
  return (
    <Column gap="16">
      <Heading as="h1" variant="display-strong-m">
        Terms
      </Heading>
      <Text variant="body-default-l">
        By using {brand.name} you agree to use it for your own team's notes and to keep your sign-in details private.
        You are responsible for the content your members write, and you can remove an organization at any time. The
        service is provided as it is, and these terms can change with notice on this page.
      </Text>
    </Column>
  );
}
