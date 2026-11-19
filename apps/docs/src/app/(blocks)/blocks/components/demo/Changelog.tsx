"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { Changelog1, Footer1, Header1 } from "@/blocks/modules";
import { type BlockExampleDef, BlockPage } from "../BlockPage";

const examples: BlockExampleDef[] = [
  {
    id: "Changelog1",
    files: [{ file: "Changelog1.tsx", label: "Page" }],
    render: () => (
      <Column horizontal="center" fillWidth fitHeight background="page">
        <Header1 />
        <Changelog1 />
        <Footer1 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="changelog" examples={examples} />;

export default Docs;
