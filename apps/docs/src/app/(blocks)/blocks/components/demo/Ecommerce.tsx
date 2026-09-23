"use client";

import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Checkout1, Checkout2, Store1, Store2 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Checkout2",
    files: ["Checkout2.tsx"],
    render: () => <Checkout2 />,
  },
  {
    id: "Store2",
    files: ["Store2.tsx"],
    render: () => <Store2 />,
  },
  {
    id: "Store1",
    files: [
      "Store1.tsx",
      { file: "Header4.tsx", label: "Header4" },
      { file: "Hero5.tsx", label: "Hero5" },
      { file: "Footer2.tsx", label: "Footer2" },
    ],
    render: () => <Store1 />,
  },
  {
    id: "Checkout1",
    files: ["Checkout1.tsx", { file: "Header4.tsx", label: "Header4" }],
    render: () => <Checkout1 />,
  },
];

const Docs: React.FC = () => <BlockPage category="ecommerce" examples={examples} />;

export default Docs;
