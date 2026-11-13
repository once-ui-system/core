import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import {
  Accordion,
  Breadcrumbs,
  Checkbox,
  CodeBlock,
  ContextMenu,
  DateInput,
  DatePicker,
  Dialog,
  Drawer,
  DropdownWrapper,
  Feedback,
  FormErrorSummary,
  Icon,
  InfoTip,
  Line,
  NavGroup,
  NavItem,
  Option,
  OTPInput,
  Pagination,
  ProgressBar,
  RadioButton,
  RadioGroup,
  RangeSlider,
  Reaction,
  Reactions,
  SegmentedControl,
  Select,
  Slider,
  Spinner,
  Switch,
  Tab,
  TabList,
  Table,
  TabPanel,
  Tabs,
  Tag,
  Text,
  ThemeProvider,
  Toast,
  User,
} from "../src";
import { List, ListItem } from "../src/components/List";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

const found = (...ids: string[]) => {
  for (const id of ids) expect(screen.getByTestId(id)).toBeTruthy();
};

// Maestro and Detox find elements by `testID`: every component takes one.
describe("testID", () => {
  it("lands on simple components", async () => {
    await wrap(
      <>
        <Tag label="Go" href="https://once-ui.com" testID="tag-link" />
        <Tag label="Soy" onPress={() => {}} testID="tag-button" />
        <Feedback title="Saved" testID="feedback" />
        <FormErrorSummary errors={[{ message: "Name is required" }]} testID="summary" />
        <Icon name="check" decorative={false} testID="icon" />
        <Line testID="line" />
        <ProgressBar value={40} testID="progress" />
        <Spinner testID="spinner" />
        <Tag label="Beta" testID="tag" />
        <User name="Anna" testID="user" />
        <Toast tone="info" testID="toast">
          Copied
        </Toast>
        <Reaction value="heart" emoji="❤️" testID="reaction" />
        <List>
          <ListItem testID="item">
            <Text>Block content</Text>
          </ListItem>
        </List>
      </>,
    );
    found(
      "tag-link",
      "tag-button",
      "feedback",
      "summary",
      "icon",
      "line",
      "progress",
      "spinner",
      "tag",
      "user",
      "toast",
      "reaction",
      "item",
    );
    expect(screen.getByTestId("tag-link").props.accessibilityRole).toBe("link");
    expect(screen.getByTestId("progress").props.accessibilityRole).toBe("progressbar");
    expect(screen.getByTestId("item").props.role).toBe("listitem");
  });

  it("lands on the element a test taps", async () => {
    await wrap(
      <>
        <Checkbox label="Agree" testID="checkbox" />
        <Switch label="Wi-Fi" testID="switch" />
        <Slider label="Volume" testID="slider" />
        <RangeSlider label="Price" testID="range" />
        <InfoTip testID="info">A tip</InfoTip>
        <Accordion title="More" defaultOpen testID="accordion">
          <Text>Body</Text>
        </Accordion>
        <NavGroup label="Settings" defaultOpen testID="group">
          <NavItem label="Profile" />
        </NavGroup>
      </>,
    );
    found("checkbox", "switch", "slider", "range", "range-start", "range-end", "info");
    expect(screen.getByTestId("checkbox").props.accessibilityRole).toBe("checkbox");
    expect(screen.getByTestId("switch").props.accessibilityRole).toBe("switch");
    expect(screen.getByTestId("slider").props.accessibilityRole).toBe("adjustable");
    expect(screen.getByTestId("accordion").props.accessibilityRole).toBe("button");
    found("accordion-content", "group", "group-content");
    await fireEvent.press(screen.getByTestId("info"));
    found("info-tip");
  });

  it("derives item IDs for composites", async () => {
    await wrap(
      <>
        <SegmentedControl
          testID="segments"
          onValueChange={() => {}}
          buttons={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
          ]}
        />
        <RadioGroup
          testID="milk"
          options={[
            { value: "whole", label: "Whole" },
            { value: "oat", label: "Oat" },
          ]}
        >
          <RadioButton value="soy" label="Soy" />
          <RadioButton value="rice" label="Rice" testID="own" />
        </RadioGroup>
        <Tabs testID="tabs" defaultValue="a">
          <TabList>
            <Tab value="a" label="A" />
            <Tab value="b" label="B" testID="tab-own" />
          </TabList>
          <TabPanel value="a">
            <Text>Panel A</Text>
          </TabPanel>
        </Tabs>
        <OTPInput length={4} testID="otp" />
        <Breadcrumbs
          testID="crumbs"
          maxItems={2}
          items={[
            { label: "Home", onPress: () => {} },
            { label: "Docs", href: "/docs" },
            { label: "Page" },
          ]}
        />
        <Pagination testID="pages" total={5} showFirstLast perPageOptions={[10, 20]} />
        <Reactions
          testID="reactions"
          options={[{ value: "heart", emoji: "❤️" }]}
          counts={{ heart: 2 }}
        />
        <Table
          testID="table"
          searchable
          paginated
          data={{
            headers: [{ content: "Name", key: "name", sortable: true }],
            rows: [["Anna"], ["Ben"]],
          }}
          actions={[{ icon: "close", label: "Remove", onClick: () => {} }]}
        />
        <DatePicker testID="calendar" value={new Date(2026, 10, 2)} />
        <CodeBlock testID="code" reloadButton codes={[{ code: "a", language: "ts", label: "A" }]} />
      </>,
    );
    found("segments", "segments-day", "segments-week");
    found("milk", "milk-whole", "milk-oat", "milk-soy", "own");
    found("tabs", "tabs-a", "tab-own");
    expect(screen.getByTestId("tabs-a").props.accessibilityRole).toBe("tab");
    found("otp", "otp-0", "otp-1", "otp-2", "otp-3");
    found("crumbs", "crumbs-0", "crumbs-2", "crumbs-more");
    await fireEvent.press(screen.getByTestId("crumbs-more"));
    found("crumbs-1");
    found("pages", "pages-1", "pages-5", "pages-first", "pages-previous", "pages-next");
    found("pages-last", "pages-per-page");
    found("reactions", "reactions-heart", "reactions-add");
    found("table", "table-search", "table-sort-name", "table-row-0", "table-row-1");
    found("table-row-0-close", "table-pagination");
    found("calendar", "calendar-previous", "calendar-next", "calendar-2026-11-02");
    found("code", "code-copy", "code-reload");
  });

  it("lands on overlay panels while they are open", async () => {
    await wrap(
      <>
        <Dialog open onClose={() => {}} title="Edit" testID="dialog">
          <Text>Body</Text>
        </Dialog>
        <Drawer open onClose={() => {}} title="Menu" testID="drawer">
          <Text>Body</Text>
        </Drawer>
        <DropdownWrapper
          open
          testID="dropdown"
          trigger={<Text>Open</Text>}
          dropdown={<Option value="a" label="A" testID="dropdown-a" />}
        />
        <ContextMenu open testID="context" dropdown={<Option value="b" label="B" />}>
          <Text>Hold</Text>
        </ContextMenu>
      </>,
    );
    found("dialog", "drawer", "dropdown", "dropdown-a", "context");
    expect(screen.getByTestId("dialog").props.role).toBe("dialog");
    expect(screen.getByTestId("dropdown").props.role).toBe("menu");
  });

  it("opens a Select and a DateInput from their test IDs", async () => {
    await wrap(
      <>
        <Select
          label="Milk"
          testID="select"
          searchable
          options={[
            { value: "oat", label: "Oat" },
            { value: "soy", label: "Soy", testID: "soy-own" },
          ]}
        />
        <DateInput label="Date" testID="date" />
      </>,
    );
    expect(screen.getByTestId("select").props.accessibilityRole).toBe("combobox");
    await fireEvent.press(screen.getByTestId("select"));
    found("select-sheet", "select-search", "select-oat", "soy-own");
    await fireEvent.press(screen.getByTestId("date"));
    found("date-sheet", "date-picker");
  });
});
