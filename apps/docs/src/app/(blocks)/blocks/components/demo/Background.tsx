"use client";

import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Background1,
  Background2,
  Background3,
  Background4,
  Background5,
  Background6,
  Background7,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Background1",
    files: ["Background1.tsx"],
    render: () => <Background1 />,
  },
  {
    id: "Background2",
    files: ["Background2.tsx"],
    render: () => <Background2 />,
  },
  {
    id: "Background3",
    files: ["Background3.tsx"],
    render: () => <Background3 />,
  },
  {
    id: "Background4",
    files: ["Background4.tsx"],
    render: () => <Background4 />,
  },
  {
    id: "Background5",
    files: ["Background5.tsx"],
    render: () => <Background5 />,
  },
  {
    id: "Background6",
    files: ["Background6.tsx"],
    render: () => <Background6 />,
  },
  {
    id: "Background7",
    files: ["Background7.tsx"],
    render: () => <Background7 />,
  },
];

const Docs: React.FC = () => (
  <BlockPage category="background" examples={examples} previewHeight="fixed" />
);

export default Docs;
