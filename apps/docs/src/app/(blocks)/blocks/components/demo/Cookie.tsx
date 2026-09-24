"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Cookie1, Cookie2, Cookie3, Cookie4 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Cookie1",
    files: ["Cookie1.tsx"],
    render: () => (
      <Column fill padding="8" horizontal="center" background="page">
        <Row maxWidth="m" fillHeight background="surface" radius="xl" />
        <Cookie1 position="absolute" left="24" bottom="24" />
      </Column>
    ),
  },
  {
    id: "Cookie2",
    files: ["Cookie2.tsx"],
    render: () => (
      <Column fill padding="8" horizontal="center" background="page">
        <Row maxWidth="m" fillHeight background="surface" radius="xl" />
        <Cookie2 position="absolute" left="24" bottom="24" />
      </Column>
    ),
  },
  {
    id: "Cookie3",
    files: ["Cookie3.tsx"],
    render: () => (
      <Column fill padding="8" horizontal="center" background="page">
        <Row maxWidth="m" fillHeight background="surface" radius="xl" />
        <Cookie3 position="absolute" left="0" right="0" bottom="0" />
      </Column>
    ),
  },
  {
    id: "Cookie4",
    files: ["Cookie4.tsx"],
    render: () => (
      <Column fill padding="8" horizontal="center" vertical="center" background="page">
        <Row maxWidth="m" fillHeight background="surface" radius="xl" />
        <Cookie4 position="absolute" />
      </Column>
    ),
  },
];

const Docs: React.FC = () => (
  <BlockPage category="cookie" examples={examples} previewHeight="fixed" />
);

export default Docs;
