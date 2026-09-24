"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  About1,
  About2,
  About3,
  About4,
  About5,
  About6,
  About7,
  Footer2,
  Header1,
  Header2,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "About7",
    files: ["About7.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <About7 />
      </Column>
    ),
  },
  {
    id: "About6",
    files: ["About6.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <About6 />
      </Column>
    ),
  },
  {
    id: "About5",
    files: ["About5.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <About5 />
      </Column>
    ),
  },
  {
    id: "About1",
    files: ["About1.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <Header2 />
        <Row fillWidth padding="l" horizontal="center">
          <About1 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "About2",
    files: ["About2.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <About2 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "About3",
    files: ["About3.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <Header2 />
        <Row fillWidth padding="l" horizontal="center">
          <About3 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "About4",
    files: ["About4.tsx"],
    render: () => (
      <Column fillWidth fitHeight horizontal="center" background="page">
        <About4 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="about" examples={examples} />;

export default Docs;
