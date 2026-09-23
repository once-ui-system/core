"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Bento1, Bento2, Bento3, Bento4 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Bento1",
    files: ["Bento1.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center">
        <Bento1 />
      </Column>
    ),
  },
  {
    id: "Bento2",
    files: ["Bento2.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center">
        <Bento2 />
      </Column>
    ),
  },
  {
    id: "Bento3",
    files: ["Bento3.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center">
        <Bento3 />
      </Column>
    ),
  },
  {
    id: "Bento4",
    files: ["Bento4.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <Bento4 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="bento" examples={examples} />;

export default Docs;
