"use client";

import { Row } from "@once-ui-system/core";
import type React from "react";
import { Onboarding1 } from "@/blocks/modules";
import { type BlockExampleDef, BlockPage } from "../BlockPage";

const examples: BlockExampleDef[] = [
  {
    id: "Onboarding1",
    files: ["Onboarding1.tsx"],
    render: () => (
      <Row fill center paddingY="l" background="page">
        <Onboarding1 />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="onboarding" examples={examples} />;

export default Docs;
