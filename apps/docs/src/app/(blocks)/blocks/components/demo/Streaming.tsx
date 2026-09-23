"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Streaming1, Streaming2, Streaming3 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Streaming3",
    files: ["Streaming3.tsx", "Footer2.tsx", "Header3.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Streaming3 />
      </Column>
    ),
  },
  {
    id: "Streaming1",
    files: ["Streaming1.tsx", "Footer2.tsx", "Header3.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Streaming1 />
      </Column>
    ),
  },
  {
    id: "Streaming2",
    files: ["Streaming2.tsx", "Footer2.tsx", "Header3.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Streaming2 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="streaming" examples={examples} />;

export default Docs;
