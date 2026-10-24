import { Button, Column } from "@once-ui-system/core";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Column as="main" fill minHeight="100vh" center paddingX="16" paddingY="48">
      <Column maxWidth="s" gap="24">
        <Button variant="tertiary" href="/" label="Acme Notes" size="s" />
        {children}
      </Column>
    </Column>
  );
}
