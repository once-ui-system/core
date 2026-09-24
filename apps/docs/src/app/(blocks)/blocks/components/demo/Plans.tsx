"use client";

import { Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Plans1,
  Plans2,
  Plans3,
  Plans4,
  Plans5,
  Plans6,
  Plans7,
  plans as plans5Data,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Plans1",
    files: ["Plans1.tsx"],
    render: () => <Plans1 />,
  },
  {
    id: "Plans2",
    files: ["Plans2.tsx"],
    render: () => (
      <Row maxWidth="s">
        <Plans2 />
      </Row>
    ),
  },
  {
    id: "Plans3",
    files: ["Plans3.tsx"],
    render: () => <Plans3 />,
  },
  {
    id: "Plans4",
    files: ["Plans4.tsx"],
    render: () => <Plans4 />,
  },
  {
    id: "Plans5",
    files: ["Plans5.tsx"],
    render: () => <Plans5 bundles={plans5Data} />,
  },
  {
    id: "Plans6",
    files: ["Plans6.tsx"],
    render: () => <Plans6 />,
  },
  {
    id: "Plans7",
    files: ["Plans7.tsx"],
    render: () => <Plans7 />,
  },
];

const Docs: React.FC = () => <BlockPage category="plans" examples={examples} />;

export default Docs;
