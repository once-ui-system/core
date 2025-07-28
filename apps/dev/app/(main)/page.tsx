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
  Dialog,
  AutoScroll,
  User,
  Table,
  ContextMenu,
  BlockQuote,
  RevealFx,
  DatePicker,
  DateInput,
  DateRangeInput,
  DateRange
} from "@once-ui-system/core";

export default function Home() {
  const [selectedEmoji, setSelectedEmoji] = React.useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const [dropdownEmoji, setDropdownEmoji] = React.useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRangeValue, setDateRangeValue] = useState<DateRange | null>(null);
  
  // DatePicker state to prevent unwanted scrolling
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  
  // Additional state for other DatePicker components
  const [standaloneDatePickerValue, setStandaloneDatePickerValue] = useState<Date | undefined>();
  const [dateInputValue, setDateInputValue] = useState<Date | undefined>();
  
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

  const handleDateRangeChange = (range: DateRange) => {
    setDateRangeValue(range);
  };

  return (
    <Column fill center padding="l">
      <Column maxWidth="s" horizontal="center" gap="l" align="center">
      <RevealFx fillWidth speed={500} direction="column" gap="l">
        <Media aspectRatio="16/9" src="/images/demo.jpg" />
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
        <Logo icon="/trademarks/icon-dark.svg" wordmark="/trademarks/type-dark.svg" href="https://once-ui.com" size="xs" brand={{copy: true, url: "https://once-ui.com"}} />
        <ContextMenu
          dropdown={
            <>
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
              <Option value="option3">Option 3</Option>
              <Option value="option4">Option 4</Option>
            </>
          }
          placement="bottom-start"
        >
          <Badge
            textVariant="code-default-s"
            border="neutral-alpha-medium"
            onBackground="neutral-strong"
            padding="s"
          >
            Right-click me to see the context menu
          </Badge>
        </ContextMenu>
        <Button type="button" disabled>asd</Button>
        <Button type="button" variant="secondary" disabled>asd</Button>
        <Button type="button" variant="tertiary" disabled>asd</Button>
        <Button type="button" variant="danger" disabled>asd</Button>
        </RevealFx>
        <DatePicker 
          id="date-input" 
          value={standaloneDatePickerValue}
          onChange={setStandaloneDatePickerValue}
          minDate={new Date("1950-01-01")} 
          maxDate={new Date()}
        />
        <DateInput 
          id="date-input" 
          placeholder="Date" 
          value={dateInputValue}
          onChange={setDateInputValue}
          minDate={new Date("1950-01-01")} 
          maxDate={new Date()}
        />
        
        {/* Test DatePicker with selected date and time picker */}
        <Column gap="16" fillWidth>
          <Text variant="heading-strong-m">DatePicker Arrow Navigation Test</Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Use arrow keys to navigate the calendar. The focus should start from the selected date.
            Press Enter to select a date. The highlighting should match the selected date.
          </Text>
          <DatePicker 
            value={datePickerValue} 
            onChange={setDatePickerValue}
            timePicker={true}
            minDate={new Date("2020-01-01")} 
            maxDate={new Date("2030-12-31")}
            // no autoFocus prop here, should default to false
          />
        </Column>

        <DateRangeInput
          id="date-range-input"
          placeholder="Select date range"
          value={dateRangeValue || undefined}
          onChange={setDateRangeValue}
          startLabel="Start Date"
          endLabel="End Date"
        />
        
        {/* Test DateInput with time picker */}
        <Column gap="16" fillWidth>
          <Text variant="heading-strong-m">DateInput Arrow Navigation Test</Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Click to open the date picker, then use arrow keys to navigate. Press Enter to select.
            Close and re-open to test that the selected date remains highlighted.
          </Text>
          <DateInput 
            id="date-input-test" 
            placeholder="Select date and time" 
            timePicker={true}
            minDate={new Date("2020-01-01")} 
            maxDate={new Date("2030-12-31")}
            onChange={(date) => console.log('DateInput selected:', date)}
          />
        </Column>
        <Table
          background="brand-strong"
          data={{
            headers: [
              { content: "Name", key: "name", sortable: true },
              { content: "Role", key: "role", sortable: true },
            ],
            rows: [
              ["Alice", "Engineer"],
              ["Bob", "Designer"],
              ["Carol", "Product"],
            ],
          }}
        />
        <DropdownWrapper
          closeAfterClick={false}
          trigger={<Button>Open</Button>}
          dropdown={
          <Column fillWidth padding="4" gap="2" minWidth={10}>
            <Option value="option1" label="Option 1"/>
            <Option value="option2" label="Option 2"/>
            <DropdownWrapper
              fillWidth
              placement="right-start"
              trigger={
                <Option value="option3" label="Option 3" hasSuffix={<Icon name="chevronRight" size="xs" onBackground="neutral-weak" />}/>
              } dropdown={
              <Column fillWidth padding="4" gap="2" minWidth={10}>
                <Option value="option4" label="Option 4"/>
                <Option value="option5" label="Option 5"/>
              </Column>
              }/>
            <Option value="option6" label="Option 6"/>
          </Column>
        }/>
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
            ><EmojiPickerDropdown onSelect={(emoji: string) => console.log(emoji)} trigger={<IconButton type="button" icon="smiley" size="m" variant="tertiary" />} /></Textarea>
          </Column>
          <Column fillWidth padding="16">
          </Column>

          <IconButton
          onClick={() => {
            console.log("click");
          }}
          variant="ghost"
          icon="eye"
          size="s"
          type="button"
        />

        <AutoScroll reverse>
          <IconButton icon="smiley" size="m" variant="tertiary" />
          <IconButton icon="smiley" size="m" variant="tertiary" />
          <IconButton icon="smiley" size="m" variant="tertiary" />
          <IconButton icon="smiley" size="m" variant="tertiary" />
          <IconButton icon="smiley" size="m" variant="tertiary" />
          <IconButton icon="smiley" size="m" variant="tertiary" />
        </AutoScroll>

          <AutoScroll reverse>
          <Column
            background="surface"
            radius="l"
            border="neutral-medium"
            vertical="space-between"
            marginRight="12"
            minWidth={20}
            fillWidth
          >
            <Flex padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-m">
                1
              </Text>
            </Flex>
            <Flex borderTop="neutral-medium" fillWidth paddingY="24" paddingX="32">
              <User
                  avatarProps={{ src: "" }}
                  name="John Doe"
                />
            </Flex>
          </Column>
          <Column
            background="surface"
            radius="l"
            border="neutral-medium"
            vertical="space-between"
            marginRight="12"
            minWidth={20}
            fillWidth
          >
            <Flex padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-m">
                2
              </Text>
            </Flex>
            <Flex borderTop="neutral-medium" fillWidth paddingY="24" paddingX="32">
              <User
                  avatarProps={{ src: "" }}
                  name="John Doe"
                />
            </Flex>
          </Column>
          <Column
            background="surface"
            radius="l"
            border="neutral-medium"
            vertical="space-between"
            marginRight="12"
            minWidth={20}
            fillWidth
          >
            <Flex padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-m">
                3
              </Text>
            </Flex>
            <Flex borderTop="neutral-medium" fillWidth paddingY="24" paddingX="32">
              <User
                  avatarProps={{ src: "" }}
                  name="John Doe"
                />
            </Flex>
          </Column>
          <Column
            background="surface"
            radius="l"
            border="neutral-medium"
            vertical="space-between"
            marginRight="12"
            minWidth={20}
            fillWidth
          >
            <Flex padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-m">
                4
              </Text>
            </Flex>
            <Flex borderTop="neutral-medium" fillWidth paddingY="24" paddingX="32">
              <User
                  avatarProps={{ src: "" }}
                  name="John Doe"
                />
            </Flex>
          </Column>
          <Column
            background="surface"
            radius="l"
            border="neutral-medium"
            vertical="space-between"
            marginRight="12"
            minWidth={20}
            fillWidth
          >
            <Flex padding="32" fillWidth>
              <Text wrap="balance" variant="heading-default-m">
                5
              </Text>
            </Flex>
            <Flex borderTop="neutral-medium" fillWidth paddingY="24" paddingX="32">
              <User
                  avatarProps={{ src: "" }}
                  name="John Doe"
                />
            </Flex>
          </Column>
        </AutoScroll>
          
          <Column fillWidth padding="16">
            <Text marginBottom="8">Custom Dropdown Example</Text>
            <DropdownWrapper
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
          <Button
            variant="secondary"
            onClick={() => setIsDialogOpen(true)}
          >
            Open Dialog
          </Button>
          <Select
  id="searchable-select"
  fillWidth
  label="Choose a country"
  value={selectedCountry}
  options={[
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "United Kingdom", value: "uk" },
    { label: "Australia", value: "au" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
    { label: "Japan", value: "jp" },
    { label: "Brazil", value: "br" }
  ]}
  onSelect={(value) => setSelectedCountry(value)}
/>  
<Dialog
isOpen={isDialogOpen}
title="Select a country"
onClose={() => setIsDialogOpen(false)}>
<Select
  id="searchable-select"
  fillWidth
  label="Choose a country"
  value={selectedCountry}
  options={[
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "United Kingdom", value: "uk" },
    { label: "Australia", value: "au" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
    { label: "Japan", value: "jp" },
    { label: "Brazil", value: "br" }
  ]}
  onSelect={(value) => setSelectedCountry(value)}
/>  
</Dialog>
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
        <BlockQuote>
          “The only way to do great work is to love what you do.” – Steve Jobs
        </BlockQuote>
      </Column>
    </Column>
  );
}
