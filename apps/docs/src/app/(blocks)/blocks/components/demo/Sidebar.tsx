"use client";

import { Background, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Sidebar1,
  Sidebar2,
  Sidebar3,
  Sidebar4,
  Sidebar5,
  Sidebar6,
  Sidebar7,
  Sidebar8,
  Sidebar9,
} from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Sidebar9",
    files: ["Sidebar9.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar9 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar7",
    files: ["Sidebar7.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar7 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar6",
    files: ["Sidebar6.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar6 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar5",
    files: ["Sidebar5.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar5 background="transparent" />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar4",
    files: ["Sidebar4.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar4 background="transparent" radius="l" overflow="hidden" />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar3",
    files: ["Sidebar3.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar3 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar2",
    files: ["Sidebar2.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar2 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar1",
    files: ["Sidebar1.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar1 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
  {
    id: "Sidebar8",
    files: ["Sidebar8.tsx"],
    render: () => (
      <Row fill gap="12" background="page" padding="12">
        <Sidebar8 />
        <Background
          fill
          background="neutral-alpha-weak"
          border="neutral-alpha-medium"
          radius="m"
          lines={{ display: true, color: "neutral-alpha-weak" }}
        />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="sidebar" examples={examples} />;

export default Docs;
