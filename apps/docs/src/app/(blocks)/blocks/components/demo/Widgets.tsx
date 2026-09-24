"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Achievements,
  AudioPlayer,
  BankCard,
  Book,
  Comments,
  DesignEngineersClub1,
  DesignEngineersClub2,
  FundingGauge1,
  Globe1,
  Goal1,
  MusicPlayer,
  StatusBar,
} from "@/blocks/modules";

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
    id: "Globe1",
    files: ["Globe1.tsx"],
    render: () => (
      <Column fill center overflow="hidden">
        <Globe1 width={1920} height={1080} />
      </Column>
    ),
  },
  {
    id: "Comments",
    files: [
      "Comments.tsx",
      "Comment.tsx",
      { code: FORMAT_TIME_SOURCE, label: "FormatTime", language: "ts" },
    ],
    render: () => (
      <Column fillWidth horizontal="center" overflowY="auto">
        <Comments maxWidth="s" />
      </Column>
    ),
  },
  {
    id: "MusicPlayer",
    files: [
      "MusicPlayer.tsx",
      { file: "MusicPlayer.module.scss", label: "Styles", language: "scss" },
    ],
    render: () => (
      <Column fill center>
        <MusicPlayer />
      </Column>
    ),
  },
  {
    id: "BankCard",
    files: ["BankCard.tsx"],
    render: () => (
      <Column fill center overflowY="auto">
        <BankCard maxWidth="l" />
      </Column>
    ),
  },
  {
    id: "DesignEngineersClub1",
    files: [
      { file: "DesignEngineersClub1.tsx", label: "Card" },
      { file: "DesignEngineersClub1.module.scss", label: "Styles", language: "scss" },
    ],
    render: () => (
      <Column fill center overflowY="auto">
        <DesignEngineersClub1 maxWidth="m" />
      </Column>
    ),
  },
  {
    id: "DesignEngineersClub2",
    files: [{ file: "DesignEngineersClub2.tsx", label: "Card" }],
    render: () => (
      <Column fill center overflowY="auto">
        <DesignEngineersClub2 maxWidth="m" />
      </Column>
    ),
  },
  {
    id: "AudioPlayer",
    files: [
      "AudioPlayer.tsx",
      { file: "AudioPlayer.module.css", label: "Styles", language: "css" },
    ],
    render: () => (
      <Column fill center overflow="hidden">
        <AudioPlayer
          maxWidth="s"
          audio="/audio/study-everything.mp3"
          chapters={[
            { start: 0, title: "The nature of knowledge" },
            { start: 104, title: "Everything is connected" },
            {
              start: 256,
              title: "The strength of your ideas equals to the diversity of your inputs",
            },
            { start: 560, title: "Talent is sensitivity cultivated over time" },
            { start: 736, title: "In the age of AI, curiosity is the new superpower" },
            {
              start: 852,
              title: "Learning is easy when you don't try to reinvent what we already know",
            },
            {
              start: 1090,
              title: "Learning is finding balance within ourselves regardless of the noise",
            },
          ]}
        />
      </Column>
    ),
  },
  {
    id: "Book",
    files: ["Book.tsx", { file: "Book.module.css", label: "Styles", language: "css" }],
    render: () => (
      <Column fill center gap="40">
        <Book
          src="/images/og/home.jpg"
          alt="Once UI Principles book"
          maxWidth={20}
          aspectRatio={16 / 9}
        />
        <Book
          src="/images/fashion/cover-01.jpg"
          alt="Once UI Principles book"
          maxWidth={20}
          aspectRatio={1}
        />
      </Column>
    ),
  },
  {
    id: "Goal1",
    files: [{ file: "Goal1.tsx", label: "Goal1" }],
    render: () => (
      <Column fill center overflowY="auto">
        <Goal1 />
      </Column>
    ),
  },
  {
    id: "StatusBar",
    files: ["StatusBar.tsx"],
    render: () => (
      <Column fill center overflowY="auto">
        <StatusBar />
      </Column>
    ),
  },
  {
    id: "Achievements",
    files: ["Achievements.tsx"],
    render: () => (
      <Column fill center overflowY="auto">
        <Achievements />
      </Column>
    ),
  },
  {
    id: "FundingGauge1",
    files: ["FundingGauge1.tsx"],
    render: () => (
      <Column fill center background="page" overflowY="auto" padding="l">
        <FundingGauge1 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="widgets" examples={examples} />;

export default Docs;
