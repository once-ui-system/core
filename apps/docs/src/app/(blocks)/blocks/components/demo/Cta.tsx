"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { Cta1, Cta2 } from "@/blocks/modules";
import { type BlockExampleDef, BlockPage } from "../BlockPage";

const examples: BlockExampleDef[] = [
  {
    id: "Cta1",
    files: ["Cta1.tsx"],
    render: () => (
      <Column fillWidth background="page">
        <Cta1 />
      </Column>
    ),
  },
  {
    id: "Cta2",
    files: ["Cta2.tsx"],
    render: () => (
      <Column fillWidth background="page">
        <Cta2 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="cta" examples={examples} bleed />;

export default Docs;
