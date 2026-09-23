"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Contact1, Contact2, Contact3, Contact4, Footer2, Header1, Header2 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Contact1",
    files: ["Contact1.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Contact1 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="m" paddingX="0" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Contact2",
    files: ["Contact2.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Header2 maxWidth="l" />
        <Row fillWidth padding="l" horizontal="center">
          <Contact2 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="l" paddingX="0" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Contact3",
    files: ["Contact3.tsx"],
    render: () => (
      <Row fill center padding="l" background="page">
        <Contact3 maxWidth="l" />
      </Row>
    ),
  },
  {
    id: "Contact4",
    files: ["Contact4.tsx"],
    render: () => (
      <Row fill center padding="l" background="page">
        <Contact4 maxWidth="l" />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="contact" examples={examples} />;

export default Docs;
