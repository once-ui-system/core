"use client";

import { Button, Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Hero1,
  Hero2,
  Hero3,
  Hero4,
  Hero5,
  Hero6,
  Hero7,
  Hero8,
  Hero9,
  Hero10,
  Hero11,
  Hero12,
  Hero13,
  Hero14,
} from "@/blocks/modules";

const smokeVideo = "/videos/smoke.mp4";

const examples: BlockExampleDef[] = [
  {
    id: "Hero1",
    files: ["Hero1.tsx", "Background6.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero1 fitHeight paddingY="l" vertical="center" />
      </Row>
    ),
  },
  {
    id: "Hero2",
    files: ["Hero2.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden" background="brand-medium">
        <Hero2 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero3",
    files: ["Hero3.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero3 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero4",
    files: ["Hero4.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero4 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero5",
    files: ["Hero5.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden" center>
        <Hero5 padding="l" />
      </Row>
    ),
  },
  {
    id: "Hero6",
    files: ["Hero6.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero6 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero7",
    files: ["Hero7.tsx", "Book.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero7 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero8",
    files: ["Hero8.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero8 />
      </Row>
    ),
  },
  {
    id: "Hero9",
    files: ["Hero9.tsx"],
    render: () => (
      <Column fillWidth center overflowX="hidden" gap="64">
        <Row fillWidth>
          <Hero9 paddingY="l" />
        </Row>
        <Button
          href={smokeVideo}
          download="smoke.mp4"
          size="m"
          variant="secondary"
          prefixIcon="download"
        >
          Download Video
        </Button>
      </Column>
    ),
  },
  {
    id: "Hero10",
    files: ["Hero10.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero10 />
      </Row>
    ),
  },
  {
    id: "Hero11",
    files: ["Hero11.tsx"],
    render: () => (
      <Row fillWidth center overflowX="hidden">
        <Hero11 />
      </Row>
    ),
  },
  {
    id: "Hero12",
    files: ["Hero12.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero12 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero14",
    files: ["Hero14.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero14 paddingY="l" />
      </Row>
    ),
  },
  {
    id: "Hero13",
    files: ["Hero13.tsx"],
    render: () => (
      <Row fillWidth overflowX="hidden">
        <Hero13 paddingY="l" />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="hero" examples={examples} reloadButton />;

export default Docs;
