"use client";

import { Row, Text } from "@once-ui-system/core";
import { useEffect, useState } from "react";

// Rendered in the HTML; hidden if the server turns out to be configured.
export function DemoNotice({ initial }: { initial: boolean }) {
  const [demo, setDemo] = useState(initial);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => setDemo(!s.supabase))
      .catch(() => {});
  }, []);
  if (!demo) return null;
  return (
    <Row fillWidth center paddingY="4" paddingX="16" background="brand-alpha-weak">
      <Text variant="label-default-s">Demo mode: Supabase is not configured, so sign-in and data are sample only.</Text>
    </Row>
  );
}
