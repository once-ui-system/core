"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Features1,
  Features2,
  Features3,
  Features4,
  Features5,
  Features6,
  Features7,
  Features8,
  Features9,
  Features10,
  Features11,
  Features12,
  Features13,
  Features14,
  Features15,
  Features16,
  Features17,
  Features18,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Features1",
    files: ["Features1.tsx"],
    render: () => <Features1 />,
  },
  {
    id: "Features2",
    files: ["Features2.tsx"],
    render: () => <Features2 />,
  },
  {
    id: "Features3",
    files: ["Features3.tsx"],
    render: () => (
      <Column fillWidth fitHeight minHeight="100%" horizontal="center">
        <Features3 />
      </Column>
    ),
  },
  {
    id: "Features4",
    files: ["Features4.tsx"],
    render: () => (
      <Column fillWidth fitHeight minHeight="100%" horizontal="center">
        <Features4 maxWidth="m" />
      </Column>
    ),
  },
  {
    id: "Features5",
    files: ["Features5.tsx"],
    render: () => (
      <Column fillWidth fitHeight minHeight="100%" horizontal="center">
        <Features5 />
      </Column>
    ),
  },
  {
    id: "Features6",
    files: ["Features6.tsx"],
    render: () => (
      <Column fillWidth fitHeight minHeight="100%" horizontal="center">
        <Features6 paddingX="l" />
      </Column>
    ),
  },
  {
    id: "Features7",
    files: ["Features7.tsx"],
    render: () => (
      <Column fillWidth fitHeight minHeight="100%" horizontal="center">
        <Features7 />
      </Column>
    ),
  },
  {
    id: "Features8",
    files: ["Features8.tsx"],
    render: () => (
      <Column fillWidth fitHeight minHeight="100%" maxWidth="m" horizontal="center">
        <Features8 paddingX="l" />
      </Column>
    ),
  },
  {
    id: "Features9",
    files: ["Features9.tsx"],
    render: () => (
      <Column fill minHeight="100%" center>
        <Features9 paddingX="l" maxWidth="l" />
      </Column>
    ),
  },
  {
    id: "Features10",
    files: ["Features10.tsx"],
    render: () => (
      <Column fill minHeight="100%" center>
        <Features10 maxWidth="l" />
      </Column>
    ),
  },
  {
    id: "Features11",
    files: ["Features11.tsx"],
    render: () => (
      <Column fill minHeight="100%" center>
        <Features11 maxWidth="l" />
      </Column>
    ),
  },
  {
    id: "Features12",
    files: ["Features12.tsx"],
    render: () => (
      <Column fill minHeight="100%">
        <Features12 />
      </Column>
    ),
  },
  {
    id: "Features13",
    files: ["Features13.tsx"],
    render: () => (
      <Column fill center minHeight="100%">
        <Features13 />
      </Column>
    ),
  },
  {
    id: "Features14",
    files: ["Features14.tsx"],
    render: () => (
      <Column fill minHeight="100%" center>
        <Features14 />
      </Column>
    ),
  },
  {
    id: "Features15",
    files: ["Features15.tsx"],
    render: () => (
      <Column fill minHeight="100%" center>
        <Features15 />
      </Column>
    ),
  },
  {
    id: "Features16",
    files: ["Features16.tsx"],
    render: () => (
      <Column fill minHeight="100%" horizontal="center">
        <Features16 maxWidth="l" />
      </Column>
    ),
  },
  {
    id: "Features17",
    files: ["Features17.tsx"],
    render: () => (
      <Column fill minHeight="100%" center>
        <Features17 />
      </Column>
    ),
  },
  {
    id: "Features18",
    files: ["Features18.tsx"],
    render: () => (
      <Column fill minHeight="100%" center background="page">
        <Features18 paddingY="l" />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="features" examples={examples} />;

export default Docs;
