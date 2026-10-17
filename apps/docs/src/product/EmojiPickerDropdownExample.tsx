"use client";

import React, { useState } from "react";
import {
  Button,
  EmojiPicker,
  IconButton,
  Row,
  Text,
} from "@once-ui-system/core";

export function BasicEmojiPickerDropdown() {
  const [selectedEmoji, setSelectedEmoji] = useState("");
  
  return (
    <Row gap="16" vertical="center">
      <EmojiPicker
        trigger={<Button label="Select Emoji" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
      />
      {selectedEmoji && (
        <Text textVariant="heading-default-xl">
          Selected: {selectedEmoji}
        </Text>
      )}
    </Row>
  );
}

export function IconButtonEmojiPickerDropdown() {
  const [selectedEmoji, setSelectedEmoji] = useState("");
  
  return (
    <Row gap="16" vertical="center">
      <EmojiPicker
        trigger={<IconButton icon="smiley" variant="secondary" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
      />
      {selectedEmoji && (
        <Text textVariant="heading-default-xl">
          {selectedEmoji}
        </Text>
      )}
    </Row>
  );
}

export function CustomColumnsEmojiPickerDropdown() {
  const [selectedEmoji, setSelectedEmoji] = useState("");
  
  return (
    <Row gap="16" vertical="center">
      <EmojiPicker
        trigger={<Button label="Select Emoji (10 columns)" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        columns="10"
      />
      {selectedEmoji && (
        <Text textVariant="heading-default-xl">
          {selectedEmoji}
        </Text>
      )}
    </Row>
  );
}

export function PlacementEmojiPickerDropdown() {
  const [selectedEmoji, setSelectedEmoji] = useState("");
  
  return (
    <Row gap="16" wrap vertical="center">
      <EmojiPicker
        trigger={<Button label="Top" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        placement="top"
      />
      <EmojiPicker
        trigger={<Button label="Bottom" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        placement="bottom"
      />
      <EmojiPicker
        trigger={<Button label="Left" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        placement="left"
      />
      <EmojiPicker
        trigger={<Button label="Right" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        placement="right"
      />
      {selectedEmoji && (
        <Text textVariant="heading-default-xl">
          {selectedEmoji}
        </Text>
      )}
    </Row>
  );
}

export function CustomBackgroundEmojiPickerDropdown() {
  const [selectedEmoji, setSelectedEmoji] = useState("");
  
  return (
    <Row gap="16" vertical="center">
      <EmojiPicker
        trigger={<Button label="Custom Background" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        background="neutral-weak"
      />
      {selectedEmoji && (
        <Text textVariant="heading-default-xl">
          {selectedEmoji}
        </Text>
      )}
    </Row>
  );
}

export function ControlledEmojiPickerDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  
  return (
    <Row gap="16" vertical="center">
      <EmojiPicker
        trigger={<Button label="Controlled Dropdown" />}
        onSelect={(emoji) => setSelectedEmoji(emoji)}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
      <Button 
        variant="secondary" 
        label={isOpen ? "Close" : "Open"} 
        onClick={() => setIsOpen(!isOpen)}
      />
      {selectedEmoji && (
        <Text textVariant="heading-default-xl">
          {selectedEmoji}
        </Text>
      )}
    </Row>
  );
}
