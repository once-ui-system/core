"use client";

import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Login1, Login2, Login3, Login4, Login5 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Login5",
    files: ["Login5.tsx"],
    render: () => <Login5 />,
  },
  {
    id: "Login1",
    files: ["Login1.tsx", "Background3.tsx"],
    render: () => <Login1 />,
  },
  {
    id: "Login2",
    files: ["Login2.tsx"],
    render: () => <Login2 />,
  },
  {
    id: "Login3",
    files: ["Login3.tsx", "Background4.tsx"],
    render: () => <Login3 />,
  },
  {
    id: "Login4",
    files: ["Login4.tsx"],
    render: () => <Login4 />,
  },
];

const Docs: React.FC = () => <BlockPage category="authentication" examples={examples} />;

export default Docs;
