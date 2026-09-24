"use client";

import { Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Newsletter1,
  Newsletter2,
  Newsletter3,
  Newsletter4,
  Newsletter5,
  Newsletter6,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Newsletter1",
    files: ["Newsletter1.tsx"],
    render: () => (
      <Row fill center>
        <Newsletter1 />
      </Row>
    ),
  },
  {
    id: "Newsletter2",
    files: ["Newsletter2.tsx"],
    render: () => (
      <Row fill center>
        <Newsletter2 />
      </Row>
    ),
  },
  {
    id: "Newsletter3",
    files: ["Newsletter3.tsx"],
    render: () => (
      <Row fill center>
        <Newsletter3 maxWidth="xs" padding="xl" />
      </Row>
    ),
  },
  {
    id: "Newsletter4",
    files: ["Newsletter4.tsx"],
    render: () => (
      <Row fill center>
        <Newsletter4 maxWidth="xs" />
      </Row>
    ),
  },
  {
    id: "Newsletter5",
    files: ["Newsletter5.tsx"],
    render: () => (
      <Row fill center>
        <Newsletter5 maxWidth="l" />
      </Row>
    ),
  },
  {
    id: "Newsletter6",
    files: ["Newsletter6.tsx"],
    render: () => (
      <Row fill center>
        <Newsletter6 maxWidth="l" />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="newsletter" examples={examples} />;

export default Docs;
