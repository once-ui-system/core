"use client";

import React, { useEffect, useState } from "react";
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
  DateRange,
  Grid,
  AccordionGroup,
  Accordion,
  Kbar,
  Spinner,
  BarChart,
  CodeBlock,
  ListItem,
  List,
  ProgressBar,
  LineChart,
  CountFx,
  Input,
  Feedback,
  MasonryGrid,
  TagInput,
  Avatar,
} from "@once-ui-system/core";

export default function Home() {
  const [selectedEmoji, setSelectedEmoji] = React.useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const [dropdownEmoji, setDropdownEmoji] = React.useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRangeValue, setDateRangeValue] = useState<DateRange | null>(null);
  const [value, setValue] = useState(0);
  const [value2, setValue2] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setValue(23);
    }, 2000);
    
    setTimeout(() => {
      setValue2(9999);
    }, 6000);
  }, []);
  
  // DatePicker state to prevent unwanted scrolling
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  
  // Additional state for other DatePicker components
  const [standaloneDatePickerValue, setStandaloneDatePickerValue] = useState<Date | undefined>();
  const [dateInputValue, setDateInputValue] = useState<Date | undefined>();
  
  // Custom dropdown state
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState("");
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  
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

  const handleMultiSelectChange = (values: string | string[]) => {
    if (Array.isArray(values)) {
      setSelectedOption(values);
    } else {
      setSelectedOption([values]);
    }
  };

  return (
    <Column fill center padding="l" gap="l" maxWidth="m">
      <Flex hide l={{hide: false}}>hide by default, show on l</Flex>
      <Flex hide m={{hide: false}}>hide by default, show on m</Flex>
      <Flex hide s={{hide: false}}>hide by default, show on s</Flex>
      <Flex hide xs={{hide: false}}>hide by default, show on xs</Flex>
      <Feedback icon title="Feedback" description="This is a feedback"></Feedback>

      <Column maxWidth="s">
        <Media src="/images/cover-01.jpg" caption="Caption" radius="xl" />
      </Column>
      
      <Row fillWidth height={56}>
        <Carousel
          fill
          play={{auto: true, interval: 5000, controls: false, progress: false}}
          items={[
            {slide: "/images/movies/01.jpg" },
          ]} />
      </Row>

      <Avatar size="xl" src="/images/cover-01.jpg" />

      <TagInput
        label="Tag Input"
        id="tag-input"
        value={selectedOption}
        onChange={handleMultiSelectChange}
      />
      
      <Row height={32} fillWidth background="danger-medium">
      <Carousel
          play={{auto: true, interval: 3000, controls: true, progress: true}}
          indicator={false}
          controls={true}
          items={[
            { slide: "/images/demo.jpg", alt: "demo" },
            { slide: "/images/cover-01.jpg", alt: "Demo" },
            { slide: "/images/cover-02.jpg", alt: "Demo" },
            { slide: "/images/cover-03.jpg", alt: "Demo" },
            { slide: "/images/cover-04.jpg", alt: "Demo" },
          ]}
        />
      </Row>
      
      <MasonryGrid
       padding="l"
       radius="l"
       background="neutral-medium"
        columns={6}
        m={{columns: 2}}
      >
          {...[16, 6, 4, 6, 16, 12, 7, 24, 4, 12, 6, 2, 24, 17, 12, 5, 9, 6, 20, 11].map((height, index) => (
              <Flex
                  key={index}
                  background="overlay"
                  radius="l"
                  border="neutral-alpha-medium"
                  fill
                  center
                  height={height}
              >{index}
              </Flex>
          ))}
      </MasonryGrid>

      <Select
        id="multiselect-example"
        options={customOptions}
        value={selectedOption}
        onSelect={handleMultiSelectChange}
        multiple
        placeholder="Select multiple options"
      />
      <Input
        id="shimmer"
        value={selectedOption}
        placeholder="Shimmer"
        readOnly
      />
      <Row horizontal="between" fillWidth>
      <Row fillWidth><CountFx variant="display-strong-xl" value={value} speed={13000} effect="wheel" easing="ease-out" /></Row>
      <Row fillWidth><CountFx variant="display-strong-xl" value={value} speed={3000} effect="smooth" easing="ease-out" /></Row>
      <Row fillWidth><CountFx variant="display-strong-xl" value={value} speed={3000} effect="simple" easing="ease-out" /></Row>
      <Row fillWidth><CountFx variant="display-strong-xl" value={value2} speed={3000} effect="smooth" easing="ease-out" /></Row>
      </Row>
      <ProgressBar value={value} />
      <BarChart
        title="Daily Time Spent on Activities"
        axis="x"
        barWidth="xl"
        legend={{
          position: "bottom-center",
        }}
        series={[
          { key: "Reading", color: "aqua" },
          { key: "Sports", color: "yellow" },
          { key: "Doomscrolling", color: "orange" }
        ]}
        data={[
          { label: "Minutes per day", "Reading": 16, "Sports": 36, "Doomscrolling": 128 },
        ]}
      />
      <LineChart
        title="Cost of College vs. Income"
        axis="x"
        date={{
          format: "yyyy"
        }}
        series={[
          { key: "Median Household Income", color: "cyan" },
          { key: "College Tuition", color: "magenta" }
        ]}
        data={[
          { date: new Date("1980-01-01"), "Median Household Income": 22340, "College Tuition": 3040 },
          { date: new Date("1990-01-01"), "Median Household Income": 31056, "College Tuition": 6371 },
          { date: new Date("2000-01-01"), "Median Household Income": 41824, "College Tuition": 13467 },
          { date: new Date("2010-01-01"), "Median Household Income": 49341, "College Tuition": 18462 },
          { date: new Date("2020-01-01"), "Median Household Income": 52357, "College Tuition": 25320 },
        ]}
      />
      <CodeBlock
        codes={[
          {
            code:
      `function calculateTotal(items) {
      let total = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        total += item.price * item.quantity;
      }

      return total;
      }`,
            language: "javascript",
            highlight: "2,4-6",
            label: "Highlight"
          },
          {
            code:
      `function calculateTotal(items) {
      let total = 12321;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        total += item.price * item.quantity;
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        total += item.price * item.quantity;
      }

      return total;
      }`,
            language: "javascript",
            label: "Highlight 2"
          }
        ]}
      />

      <Grid
        maxWidth="s"
        borderX="neutral-medium"
        cursor={<Spinner/>}
        zIndex={10} columns="4"
        radius="xl"
        style={{
          backgroundColor: "var(--brand-background-medium)",
        }}
        m={{columns: "2"}}
        s={{
          hide: true,
          position: "sticky",
          top: "0",
          style: {
            backgroundColor: "var(--neutral-background-strong)"
          }
        }}
        gap="l"
        fillWidth>
        <Column padding="l">
          <Text>Hello</Text>
        </Column>
        <Column padding="l">
          <Text>Hello</Text>
        </Column>
        <Column padding="l">
          <Text>Hello</Text>
        </Column>
        <Column padding="l">
          <Text>Hello</Text>
        </Column>
      </Grid>

      <List as="ul" maxWidth="s" gap="8">
        <ListItem>Hello this is a really long list item that should wrap around the container and not break the layout
          <List as="ul" maxWidth="s">
            <ListItem>
              Hello this is a really long list item that should wrap around the container and not break the layout
            </ListItem>
          </List>
        </ListItem>
        <ListItem>Just another example of a really long list item that should wrap around the container and not break the layout</ListItem>
        <ListItem>This is a short list item that should not wrap around the container and not break the layout</ListItem>
        <ListItem>And another one that should wrap around the container and not break the layout</ListItem>
      </List>

      <Kbar
        items={[
          {
            id: 'home',
            name: 'Home',
            section: 'Navigation',
            shortcut: ['H'],
            keywords: 'home main start',
            href: '/',
            icon: 'home'
          },
          {
            id: 'docs',
            name: 'Documentation',
            section: 'Navigation',
            shortcut: ['D', 'A'],
            keywords: 'docs guide help',
            href: '/docs',
            icon: 'chevronRight'
          }]}
        >
        <Button prefixIcon="command">Search</Button>
      </Kbar>

      <Column fillWidth>
        <Accordion title="Example" open>
          <Text onBackground="neutral-weak">
            Example content
          </Text>
        </Accordion>
        <Accordion title="Example">
          <Text onBackground="neutral-weak">
            Example content
          </Text>
        </Accordion>
      </Column>

      <AccordionGroup
        items={[
          {
            title: "First Item",
            content:
              <Text onBackground="neutral-weak">
                Content for the first item
              </Text>
          },
          {
            title: "Second Item",
            content:
              <Text onBackground="neutral-weak">
                Content for the second item
              </Text>
          },
          {
            title: "Third Item",
            content:
              <Text onBackground="neutral-weak">
                Content for the third item
              </Text>
          }
        ]}
      />

      <Row fillWidth horizontal="between" xs={{direction: "column", horizontal: "end", vertical: "start", style: {backgroundColor: "red"}}}>
        <Column fitWidth>
          <Text>Hello 1</Text>
        </Column>
        <Column fitWidth>
          <Text>Hello 2</Text>
        </Column>
        <Column fitWidth>
          <Text>Hello 3</Text>
        </Column>
      </Row>
      <Column maxWidth="s" horizontal="center" gap="l" align="center">
      <RevealFx fillWidth speed={500} direction="column" gap="l">
        <Media 
          cursor={<Row fill center><Line width={100}/><Line position="absolute" vert height={100}/></Row>}
          radius="xl" aspectRatio="16/9" src="/images/demo.jpg" s={{aspectRatio: "4/3"}} caption="This is a caption" />
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
              <Option value="option1" hasPrefix={<Icon name="chevronLeft"/>} onBackground="brand-weak"><Text>Option 1</Text></Option>
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
            vertical="between"
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
            vertical="between"
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
            vertical="between"
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
            vertical="between"
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
            vertical="between"
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
                  {selectedDropdownOption ? customOptions.find(opt => opt.value === selectedDropdownOption)?.label : "Select an option"}
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
                        setSelectedDropdownOption(option.value);
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
        favicon={false}
          url="https://once-ui.com"
          size="l"
        />
        <StylePanel/>
        <BlockQuote>
          “The only way to do great work is to love what you do.” – Steve Jobs
        </BlockQuote>
      </Column>
    </Column>
  );
}
