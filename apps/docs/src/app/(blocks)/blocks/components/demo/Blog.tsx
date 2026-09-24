"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Blog1, Blog2, Blog3, Blog4, Footer1, Header1, Post1 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Blog1",
    files: [{ file: "Blog1.tsx", label: "Page" }, "Newsletter1.tsx"],
    render: () => (
      <Column horizontal="center" fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Blog1 />
        </Row>
        <Footer1 />
      </Column>
    ),
  },
  {
    id: "Post1",
    files: [{ file: "Post1.tsx", label: "Page" }],
    render: () => (
      <Column horizontal="center" fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Post1 />
        </Row>
        <Footer1 />
      </Column>
    ),
  },
  {
    id: "Blog2",
    files: [{ file: "Blog2.tsx", label: "Page" }],
    render: () => (
      <Column horizontal="center" fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Blog2 />
        </Row>
        <Footer1 />
      </Column>
    ),
  },
  {
    id: "Blog3",
    files: [{ file: "Blog3.tsx", label: "Page" }],
    render: () => (
      <Column horizontal="center" fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Blog3 />
        </Row>
        <Footer1 />
      </Column>
    ),
  },
  {
    id: "Blog4",
    files: [{ file: "Blog4.tsx", label: "Page" }],
    render: () => (
      <Column horizontal="center" fillWidth fitHeight background="page">
        <Header1 />
        <Row fillWidth padding="l" horizontal="center">
          <Blog4 />
        </Row>
        <Footer1 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="blog" examples={examples} />;

export default Docs;
