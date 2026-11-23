"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { Billing1 } from "@/blocks/modules";
import { type BlockExampleDef, BlockPage } from "../BlockPage";

const examples: BlockExampleDef[] = [
  {
    id: "Billing1",
    files: ["Billing1.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page" paddingY="l">
        <Billing1 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="billing" examples={examples} />;

export default Docs;
