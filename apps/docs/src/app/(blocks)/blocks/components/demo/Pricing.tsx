"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Footer2, Header1, Pricing1, Pricing2, Pricing3, Pricing4 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Pricing1",
    files: [
      { file: "Pricing1.tsx", label: "Page" },
      "Background1.tsx",
      { file: "Faq3.tsx", label: "FAQ" },
      { file: "Testimonial4.tsx", label: "Testimonials" },
      "Plans3.tsx",
    ],
    render: () => (
      <Column fillWidth fitHeight center background="page">
        <Header1 />
        <Row fillWidth paddingX="l" paddingY="xl">
          <Pricing1 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "Pricing2",
    files: [{ file: "Pricing2.tsx", label: "Page" }],
    render: () => (
      <Column fillWidth fitHeight center background="page">
        <Header1 />
        <Row fillWidth paddingX="l" paddingY="xl">
          <Pricing2 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "Pricing3",
    files: [
      { file: "Pricing3.tsx", label: "Page" },
      { file: "Plans5.tsx", label: "Bundles" },
    ],
    render: () => (
      <Column fillWidth fitHeight center background="page">
        <Header1 />
        <Row fillWidth paddingX="l" paddingY="xl">
          <Pricing3 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
  {
    id: "Pricing4",
    files: [{ file: "Pricing4.tsx", label: "Page" }],
    render: () => (
      <Column fillWidth fitHeight center background="page">
        <Header1 />
        <Row fillWidth paddingX="l" paddingY="xl">
          <Pricing4 />
        </Row>
        <Footer2 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="pricing" examples={examples} />;

export default Docs;
