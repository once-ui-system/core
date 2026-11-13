"use client";

import { sectionSchemas } from "@once-ui-system/blocks";
import { Column } from "@once-ui-system/core";
import { SiteEditor } from "@once-ui-system/site-editor";
import { adapter, chrome } from "./demo";

const sections = Object.values(sectionSchemas);

/** The site editor kit on a demo site kept in this browser. */
export default function SiteEditorDemo() {
  return (
    <Column position="fixed" top="0" left="0" fill zIndex={2} background="page">
      <SiteEditor adapter={adapter} sections={sections} chrome={chrome} exitHref="/" />
    </Column>
  );
}
