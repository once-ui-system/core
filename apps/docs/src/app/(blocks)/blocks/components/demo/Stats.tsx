"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { Stats1 } from "@/blocks/modules";
import { type BlockExampleDef, BlockPage } from "../BlockPage";

const examples: BlockExampleDef[] = [
  {
    id: "Stats1",
    files: ["Stats1.tsx"],
    render: () => (
      <Column fillWidth background="page">
        <Stats1 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="stats" examples={examples} bleed />;

export default Docs;
