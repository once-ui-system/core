import { Row } from "@once-ui-system/core";
import { InviteClient } from "./client";

export const metadata = {
  title: "Invitation | Acme Notes",
  description: "Accept your invitation to join an organization on Acme Notes.",
  // A link that carries a capability is nobody's search result.
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ token: string }> };

/**
 * Where an invitation link lands. Outside `/app/` on purpose: nothing but
 * tenant slugs lives directly under it (see ORG_BASE in src/lib/orgs/types.ts).
 */
export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  return (
    <Row background="page" fill center padding="24" minHeight="100vh">
      <InviteClient token={token} />
    </Row>
  );
}
