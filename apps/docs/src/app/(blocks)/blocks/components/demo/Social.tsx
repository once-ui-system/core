"use client";

import { Column, Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Chat1, Entry1, Feed1, Feed2, Feed3, Feed4, Forum1, Profile1, Profile2 } from "@/blocks/modules";

const FORMAT_TIME_SOURCE = `import { formatDistance } from "date-fns";

export const formatShortRelativeTime = (date: Date | number): string => {
  const distance = formatDistance(date, new Date(), { includeSeconds: true });

  const match = distance.match(/(\\d+)/);
  const number = match ? match[0] : '';

  let unit = '';
  if (distance.includes('second')) unit = 's';
  else if (distance.includes('minute')) unit = 'm';
  else if (distance.includes('hour')) unit = 'h';
  else if (distance.includes('day')) unit = 'd';
  else if (distance.includes('month')) unit = 'mo';
  else if (distance.includes('year')) unit = 'y';

  return number + unit;
};`;

const examples: BlockExampleDef[] = [
  {
    id: "Profile2",
    files: [{ file: "Profile2.tsx", label: "Profile2" }],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Profile2 />
      </Column>
    ),
  },
  {
    id: "Feed4",
    files: ["Feed4.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Feed4 />
      </Column>
    ),
  },
  {
    id: "Profile1",
    files: [
      { file: "Profile1.tsx", label: "Profile1" },
      { file: "Sidebar3.tsx", label: "Sidebar3" },
    ],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Profile1 />
      </Column>
    ),
  },
  {
    id: "Entry1",
    files: [
      { file: "Entry1.tsx", label: "Entry1" },
      { file: "MediaPost2.tsx", label: "MediaPost2" },
      { file: "Sidebar3.tsx", label: "Sidebar3" },
    ],
    render: () => (
      <Column fillWidth fitHeight style={{ minHeight: "100%" }} background="page">
        <Row flex={1} center>
          <Entry1 />
        </Row>
      </Column>
    ),
  },
  {
    id: "Feed1",
    files: [
      "Feed1.tsx",
      { file: "MediaPost1.tsx", label: "MediaPost1" },
      { file: "Sidebar3.tsx", label: "Sidebar3" },
      "Comments.tsx",
      "Comment.tsx",
      { code: FORMAT_TIME_SOURCE, label: "FormatTime", language: "ts" },
    ],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Feed1 />
      </Column>
    ),
  },
  {
    id: "Feed2",
    files: ["Feed2.tsx"],
    render: () => (
      <Column fillWidth fitHeight background="page">
        <Feed2 />
      </Column>
    ),
  },
  {
    id: "Feed3",
    files: ["Feed3.tsx"],
    render: () => (
      <Column fill background="page">
        <Feed3 />
      </Column>
    ),
  },
  {
    id: "Chat1",
    files: [
      "Chat1.tsx",
      { file: "Sidebar4.tsx", label: "Sidebar4" },
      { file: "Sidebar5.tsx", label: "Sidebar5" },
      { file: "Feed3.tsx", label: "Feed3" },
      { file: "Table1.tsx", label: "Table1" },
      { file: "chat1content.ts", label: "Content" },
    ],
    render: () => (
      <Column fill background="page">
        <Chat1 />
      </Column>
    ),
  },
  {
    id: "Forum1",
    files: [
      "Forum1.tsx",
      { file: "Header1.tsx", label: "Header1" },
      { file: "Footer1.tsx", label: "Footer1" },
      { file: "forum1content.ts", label: "Content" },
    ],
    render: () => (
      <Column fillWidth fitHeight style={{ minHeight: "100%" }} background="page">
        <Forum1 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="social" examples={examples} />;

export default Docs;
