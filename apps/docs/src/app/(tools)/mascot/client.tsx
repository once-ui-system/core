"use client";

import { MascotPanel } from "@once-ui-system/blocks";

/** The whole panel, remembering the design in this browser. */
export function MascotDesigner() {
  return (
    <MascotPanel
      storageKey="once-ui-mascot-designer"
      defaultValue={{ v: 1, mouth: "smile", accessory: ["sprout"] }}
    />
  );
}
