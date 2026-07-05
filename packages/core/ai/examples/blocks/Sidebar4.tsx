"use client";

import { Column, Row, Media, Fade, Scroller, Text, Line, ToggleButton, IconButton, Avatar } from "@once-ui-system/core";
import { sidebar } from "./content/chat1content";
import { useState } from "react";

export const Sidebar4: React.FC<React.ComponentProps<typeof Column> & {
  activeItem?: string;
  onSelectItem?: (label: string) => void;
}> = ({ activeItem, onSelectItem, ...flex }) => {
  const [activeRoom, setActiveRoom] = useState<string | null>("👋 ┃ intro");

  return (
    <Column fillHeight maxWidth={18} background="surface" {...flex}>
      <Row fillWidth aspectRatio="2/1">
        <Media src="/images/blocks/vibe-coding-dark.jpg" fill sizes="240px"/>
        <Fade position="absolute" top="0" to="bottom" fillWidth height={6} opacity={70}/>
        <Row fillWidth paddingY="12" paddingX="24" position="absolute" top="0" textVariant="label-strong-s" horizontal="center" align="center">
          Design Engineers Club
        </Row>
      </Row>
      <Scroller fillHeight direction="column">
        <Column fillWidth padding="8">
          <Column fillWidth gap="2">
            {(sidebar.find((s) => s.items)?.items ?? []).map((item, idx) => {
              const selected = activeRoom === null && !!activeItem && item.label === activeItem;
              return (
                <ToggleButton
                  key={idx}
                  fillWidth
                  horizontal="start"
                  selected={selected}
                  onClick={() => {
                    setActiveRoom(null);
                    onSelectItem?.(item.label);
                  }}
                >
                  {item.label}
                </ToggleButton>
              );
            })}
          </Column>
          <Line background="neutral-alpha-weak" marginY="12"/>
          <Column fillWidth gap="24">
            {sidebar.filter((s) => s.title).map((section, sIdx) => (
              <Column key={sIdx} fillWidth gap="2">
                <Text
                  variant="label-default-s"
                  onBackground="neutral-weak"
                  marginLeft="16"
                  marginTop="4"
                  marginBottom="8"
                >
                  {section!.title as string}
                </Text>
                {(section.rooms ?? []).map((room, rIdx) => {
                  const selected = room.label === activeRoom;
                  return (
                    <ToggleButton
                      key={rIdx}
                      fillWidth
                      horizontal="start"
                      selected={selected}
                      onClick={() => {
                        setActiveRoom(room.label);
                        onSelectItem?.(""); // clear top-level selection
                      }}
                    >
                      <Text weight="strong" onBackground={selected ? undefined : "neutral-weak"}>
                        {room.label}
                      </Text>
                    </ToggleButton>
                  );
                })}
              </Column>
            ))}
          </Column>
        </Column>
      </Scroller>
      <Row fillWidth padding="8">
        <Row fillWidth vertical="center" padding="12" radius="l" gap="16" background="neutral-alpha-weak">
          <Avatar src="/images/creators/lorant.jpg" statusIndicator={{color: "green"}}/>
          <Column fillWidth gap="2">
            <Text variant="label-strong-s" truncate>Lorant</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" truncate>Coding something...</Text>
          </Column>
          <IconButton icon="settings" variant="secondary" tooltip="User settings"/>
        </Row>
      </Row>
    </Column>
  )
}