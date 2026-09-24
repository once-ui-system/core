"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Waitlist1, Waitlist2, Waitlist3 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Waitlist1",
    files: ["Waitlist1.tsx", "Background6.tsx"],
    render: () => (
      <Column fill background="page">
        <Waitlist1 />
      </Column>
    ),
  },
  {
    id: "Waitlist2",
    files: ["Waitlist2.tsx"],
    render: () => (
      <Row fill center padding="l" background="page">
        <Waitlist2 />
      </Row>
    ),
  },
  {
    id: "Waitlist3",
    files: ["Waitlist3.tsx"],
    render: () => (
      <Row fill center padding="l" background="page">
        <Waitlist3 />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="waitlist" examples={examples} reloadButton />;

export default Docs;
