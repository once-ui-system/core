"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Careers1,
  Careers2,
  Careers3,
  Careers4,
  Footer2,
  Header1,
  Header2,
  Role1,
  Role2,
  Role3,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Careers4",
    files: ["Careers4.tsx"],
    render: () => (
      <Column
        fillWidth
        fitHeight
        background="page"
        horizontal="center"
        style={{ minHeight: "100%" }}
      >
        <Header2 maxWidth="l" />
        <Row fillWidth horizontal="center" flex={1}>
          <Careers4 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="l" paddingX="0" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Role3",
    files: ["Role3.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page" horizontal="center">
        <Header2 maxWidth="l" />
        <Row fillWidth horizontal="center">
          <Role3 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="l" paddingX="0" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Careers1",
    files: ["Careers1.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Careers1 />
        </Row>
        <Row fillWidth borderTop="neutral-medium" horizontal="center" paddingX="l">
          <Footer2 maxWidth="m" borderX="neutral-medium" paddingX="l" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Role1",
    files: ["Role1.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Role1 />
        </Row>
        <Row fillWidth borderTop="neutral-medium" horizontal="center" paddingX="l">
          <Footer2 maxWidth="m" borderX="neutral-medium" paddingX="l" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Careers2",
    files: ["Careers2.tsx"],
    render: () => (
      <Column
        fillWidth
        fitHeight
        background="page"
        horizontal="center"
        style={{ minHeight: "100%" }}
      >
        <Header2 maxWidth="l" />
        <Row fillWidth horizontal="center" flex={1}>
          <Careers2 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="l" paddingX="0" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Role2",
    files: ["Role2.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page" horizontal="center">
        <Header2 maxWidth="l" />
        <Row fillWidth horizontal="center">
          <Role2 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="l" paddingX="0" />
        </Row>
      </Column>
    ),
  },
  {
    id: "Careers3",
    files: ["Careers3.tsx"],
    render: () => (
      <Column
        fillWidth
        fitHeight
        background="page"
        horizontal="center"
        style={{ minHeight: "100%" }}
      >
        <Header2 maxWidth="l" />
        <Row fillWidth horizontal="center" flex={1}>
          <Careers3 />
        </Row>
        <Row fillWidth paddingX="l" horizontal="center">
          <Footer2 maxWidth="l" paddingX="0" />
        </Row>
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="careers" examples={examples} />;

export default Docs;
