"use client";

import { Sections } from "@once-ui-system/blocks";
import { Column } from "@once-ui-system/core";
import { PreviewRoot, PreviewSection } from "@once-ui-system/site-editor";
import { useEffect, useState } from "react";
import { adapter, SiteFooter, SiteHeader } from "../demo";

/**
 * The demo site as a visitor gets it. Inside the editor the draft arrives over
 * the bridge; opened on its own, it shows what is saved in this browser.
 */
export default function SitePreview() {
  const [saved, setSaved] = useState<ReturnType<typeof adapter.read> | null>(null);
  useEffect(() => setSaved(adapter.read()), []);
  if (!saved) return null;
  const pageId = new URLSearchParams(window.location.search).get("page") ?? "home";

  return (
    <Column position="fixed" top="0" left="0" fill overflowY="auto" zIndex={2} background="page">
      <PreviewRoot initial={{ pageId, page: saved.content[pageId], style: saved.style }}>
        {({ page, style }) => (
          <>
            <SiteHeader props={style?.header} pages={saved.pages} />
            <Column fillWidth flex={1} paddingX="24" gap="64" paddingY="48" horizontal="center">
              {page.sections.map((section) => (
                <PreviewSection key={section.id} id={section.id}>
                  <Sections items={[section]} />
                </PreviewSection>
              ))}
            </Column>
            <SiteFooter props={style?.footer} />
          </>
        )}
      </PreviewRoot>
    </Column>
  );
}
