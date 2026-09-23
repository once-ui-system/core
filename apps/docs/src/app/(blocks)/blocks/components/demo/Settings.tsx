"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Header1, Settings1, Settings2, Settings3, Sidebar1 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Settings3",
    files: ["Settings3.tsx"],
    render: () => (
      <Column fill background="page" overflowY="hidden">
        <Header1 avatar="/images/creators/lorant.jpg" authenticated />
        <Row fill padding="8" gap="8">
          <Sidebar1 background="transparent" m={{ hide: true }} />
          <Settings3 />
        </Row>
      </Column>
    ),
  },
  {
    id: "Settings1",
    files: ["Settings1.tsx"],
    render: () => (
      <Column fill background="page" overflowY="hidden">
        <Header1 avatar="/images/creators/lorant.jpg" authenticated />
        <Row fill padding="8" gap="8">
          <Sidebar1 background="transparent" m={{ hide: true }} />
          <Settings1 />
        </Row>
      </Column>
    ),
  },
  {
    id: "Settings2",
    files: ["Settings2.tsx"],
    render: () => (
      <Column fill background="page" overflowY="hidden">
        <Header1 avatar="/images/creators/lorant.jpg" authenticated />
        <Row fill padding="8" gap="8">
          <Sidebar1 background="transparent" m={{ hide: true }} />
          <Settings2 />
        </Row>
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="settings" examples={examples} />;

export default Docs;
