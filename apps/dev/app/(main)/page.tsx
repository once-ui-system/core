"use client";

import React, { useState } from "react";
import {
  Heading,
  Text,
  Button,
  Column,
  Badge,
  Logo,
  Line,
  LetterFx,
  StylePanel,
  Carousel,
  Media,
  EmojiPicker,
  EmojiPickerDropdown,
  Flex,
  OgCard,
  Icon,
  Textarea,
  Row,
  IconButton,
  Select,
  Option,
  DropdownWrapper,
} from "@once-ui-system/core";

export default function Home() {
  const [selectedEmoji, setSelectedEmoji] = React.useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const [dropdownEmoji, setDropdownEmoji] = React.useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [comment, setComment] = useState("");
  
  // Custom dropdown state
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  
  // Options for the custom dropdown
  const customOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
    { label: "Option 4", value: "option4" },
  ];

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };
  
  const handleDropdownEmojiSelect = (emoji: string) => {
    setDropdownEmoji(emoji);
  };

  return (
    <Column fill center padding="l">
      <Column maxWidth="s" horizontal="center" gap="l" align="center">
        <Badge
          textVariant="code-default-s"
          border="neutral-alpha-medium"
          onBackground="neutral-medium"
          vertical="center"
          gap="16"
        >
          <Logo wordmark="/trademarks/type-dark.svg" href="https://once-ui.com" size="xs" />
          <Line vert background="neutral-alpha-strong" />
          <Text marginX="4">
            <LetterFx trigger="instant">An ecosystem, not a UI kit</LetterFx>
          </Text>
        </Badge>
        <Heading variant="display-strong-xl" marginTop="24">
          Presence that doesn&apos;t beg for attention
        </Heading>
        <Text
          variant="heading-default-xl"
          onBackground="neutral-weak"
          wrap="balance"
          marginBottom="16"
        >
          Build with clarity, speed, and quiet confidence
        </Text>
        <Button
          id="docs"
          href="https://docs.once-ui.com/once-ui/quick-start"
          data-border="rounded"
          weight="default"
          prefixIcon="copy"
          arrowIcon
        >
          Explore docs
        </Button>
        
        {/* EmojiPicker Example */}
        <Column gap="32" align="center" fillWidth>
          <Column gap="16" align="center" fillWidth>
            <Heading variant="heading-strong-l">Standard Emoji Picker</Heading>
            <Flex gap="16" align="center">
              <Button 
                variant="secondary"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {selectedEmoji ? selectedEmoji : "Pick Emoji"}
              </Button>
              {selectedEmoji && (
                <Text variant="heading-default-xl">
                  Selected: {selectedEmoji}
                </Text>
              )}
            </Flex>
            {showEmojiPicker && (
              <EmojiPicker 
                onSelect={handleEmojiSelect} 
                onClose={() => setShowEmojiPicker(false)} 
              />
            )}
          </Column>
          
          <Column gap="16" align="center" fillWidth>
            <Heading variant="heading-strong-l">Emoji Picker Dropdown</Heading>
            <Flex gap="16" align="center">
              <EmojiPickerDropdown
                trigger={
                  <Button variant="secondary" tabIndex={0}>
                    <Flex gap="8" align="center">
                      {dropdownEmoji ? dropdownEmoji : <Icon name="smiley" />}
                      <Text>Add Emoji</Text>
                    </Flex>
                  </Button>
                }
                onSelect={handleDropdownEmojiSelect}
                placement="bottom-start"
              />
              {dropdownEmoji && (
                <Text variant="heading-default-xl">
                  Selected: {dropdownEmoji}
                </Text>
              )}
            </Flex>
          </Column>
        </Column>
        <Column gap="8" fillWidth>
            <Textarea
              id="comment-input"
              placeholder="Add a comment..."
              lines="auto"
              hasSuffix={
                <Row
                  style={{ opacity: 1 }}
                  transition="micro-medium">
                  <IconButton
                    style={{
                      marginRight: "-0.25rem"
                    }}
                    icon="send"
                    size="m"
                    variant="primary" 
                  />
                </Row>
              }
            ><EmojiPickerDropdown onSelect={(emoji) => console.log(emoji)} trigger={<IconButton icon="smiley" size="m" variant="tertiary" />} /></Textarea>
          </Column>
          <Column fillWidth padding="16">
            <Select
              fillWidth
              id="basic-select"
              label="Choose a country"
              value={selectedCountry}
              onSelect={setSelectedCountry}
              options={[
                { label: "United States", value: "us" },
                { label: "Canada", value: "ca" },
                { label: "United Kingdom", value: "uk" },
                { label: "Australia", value: "au" }
              ]}
            />
          </Column>
          
          <Column fillWidth padding="16">
            <Text marginBottom="8">Custom Dropdown Example</Text>
            <DropdownWrapper
              minWidth={12}
              isOpen={isCustomDropdownOpen}
              onOpenChange={setIsCustomDropdownOpen}
              trigger={
                <Button 
                  variant="secondary" 
                  suffixIcon="chevronDown"
                >
                  {selectedOption ? customOptions.find(opt => opt.value === selectedOption)?.label : "Select an option"}
                </Button>
              }
              dropdown={
                <Column padding="4" gap="2">
                  {customOptions.map((option) => (
                    <Option
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      onClick={() => {
                        setSelectedOption(option.value);
                        setIsCustomDropdownOpen(false);
                      }}
                    />
                  ))}
                </Column>
              }
            />
          </Column>
        <OgCard 
          url="https://once-ui.com" 
          serviceConfig={{
            fetchOgUrl: '/api/og/fetch',
            proxyOgUrl: '/api/og/proxy'
          }}
        />
        <Carousel
          indicator="thumbnail"
          items={[
            { slide: <Media radius="l" src="/images/demo.jpg" /> },
            { slide: <Column fill center background="neutral-medium">Any React node</Column> },
            { slide: <Column fill center background="neutral-medium">Some other react node</Column> }
          ]}
        />
        <StylePanel/>
      </Column>
    </Column>
  );
}
