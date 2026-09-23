"use client";

import { Background, Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Header1, Header2, Header3, Header4, Header5, Header6 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Header1",
    files: ["Header1.tsx"],
    render: () => (
      <Column fillWidth fitHeight gap="12" background="page" paddingBottom="12">
        <Column fillWidth gap="12">
          <Header1 />
          <Row fillWidth paddingX="12">
            <Background
              height={32}
              flex="3"
              background="neutral-alpha-weak"
              border="neutral-alpha-medium"
              radius="m"
              lines={{ display: true, color: "neutral-alpha-weak" }}
            />
          </Row>
        </Column>
        <Column fillWidth gap="12" borderTop="neutral-medium">
          <Header1 authenticated avatar="/images/creators/lorant.jpg" />
          <Row fillWidth paddingX="12">
            <Background
              height={32}
              flex="3"
              background="neutral-alpha-weak"
              border="neutral-alpha-medium"
              radius="m"
              lines={{ display: true, color: "neutral-alpha-weak" }}
            />
          </Row>
        </Column>
      </Column>
    ),
  },
  {
    id: "Header2",
    files: ["Header2.tsx"],
    render: () => (
      <Column fillWidth fitHeight gap="12" background="page" paddingBottom="12">
        <Column fillWidth gap="12">
          <Header2 />
          <Row fillWidth paddingX="12">
            <Background
              height={32}
              flex="3"
              background="neutral-alpha-weak"
              border="neutral-alpha-medium"
              radius="m"
              lines={{ display: true, color: "neutral-alpha-weak" }}
            />
          </Row>
        </Column>
        <Column fillWidth gap="12" borderTop="neutral-medium">
          <Header2 authenticated={true} />
          <Row fillWidth paddingX="12">
            <Background
              height={32}
              flex="3"
              background="neutral-alpha-weak"
              border="neutral-alpha-medium"
              radius="m"
              lines={{ display: true, color: "neutral-alpha-weak" }}
            />
          </Row>
        </Column>
      </Column>
    ),
  },
  {
    id: "Header3",
    files: ["Header3.tsx"],
    render: () => (
      <Column fill gap="12" background="page" paddingBottom="12">
        <Header3 />
        <Row fill paddingX="12">
          <Background
            fill
            background="neutral-alpha-weak"
            border="neutral-alpha-medium"
            radius="m"
            lines={{ display: true, color: "neutral-alpha-weak" }}
          />
        </Row>
      </Column>
    ),
  },
  {
    id: "Header4",
    files: ["Header4.tsx"],
    render: () => (
      <Column fill gap="12" background="page" paddingBottom="12">
        <Header4 cartCount={12} />
        <Row fill paddingX="12">
          <Background
            fill
            background="neutral-alpha-weak"
            border="neutral-alpha-medium"
            radius="m"
            lines={{ display: true, color: "neutral-alpha-weak" }}
          />
        </Row>
      </Column>
    ),
  },
  {
    id: "Header5",
    files: ["Header5.tsx"],
    render: () => (
      <Column fill gap="12" background="page" paddingBottom="12">
        <Header5 />
        <Row fill paddingX="12">
          <Background
            fill
            background="neutral-alpha-weak"
            border="neutral-alpha-medium"
            radius="m"
            lines={{ display: true, color: "neutral-alpha-weak" }}
          />
        </Row>
      </Column>
    ),
  },
  {
    id: "Header6",
    files: ["Header6.tsx"],
    render: () => (
      <Column fill gap="12" background="page" paddingBottom="12">
        <Header6 />
        <Row fill paddingX="12">
          <Background
            fill
            background="neutral-alpha-weak"
            border="neutral-alpha-medium"
            radius="m"
            lines={{ display: true, color: "neutral-alpha-weak" }}
          />
        </Row>
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="header" examples={examples} />;

export default Docs;
