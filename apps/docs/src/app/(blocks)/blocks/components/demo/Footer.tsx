"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Footer1, Footer2, Footer3, Footer4, Footer5, Footer6 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Footer6",
    files: ["Footer6.tsx"],
    render: () => (
      <Column fillWidth background="page">
        <Column fillWidth minHeight={4} background="neutral-medium" borderBottom="surface" />
        <Footer6 />
      </Column>
    ),
  },
  {
    id: "Footer5",
    files: ["Footer5.tsx"],
    render: () => (
      <Column fillWidth background="page">
        <Column fillWidth minHeight={4} background="neutral-medium" borderBottom="surface" />
        <Footer5 />
      </Column>
    ),
  },
  {
    id: "Footer2",
    files: ["Footer2.tsx"],
    render: () => (
      <Column fill background="page" vertical="end">
        <Column fill bottomRadius="xl" background="neutral-medium" borderBottom="surface" />
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "Footer1",
    files: ["Footer1.tsx"],
    render: () => (
      <Column fill background="page" vertical="end">
        <Column fill bottomRadius="xl" background="neutral-medium" borderBottom="surface" />
        <Footer1 />
      </Column>
    ),
  },
  {
    id: "Footer3",
    files: ["Footer3.tsx"],
    render: () => (
      <Column fill background="page" vertical="end">
        <Column fill bottomRadius="xl" background="neutral-medium" borderBottom="surface" />
        <Footer3 />
      </Column>
    ),
  },
  {
    id: "Footer4",
    files: ["Footer4.tsx"],
    render: () => (
      <Column fillWidth background="page">
        <Column fillWidth minHeight={4} background="neutral-medium" borderBottom="surface" />
        <Footer4 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="footer" examples={examples} />;

export default Docs;
