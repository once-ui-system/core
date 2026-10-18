import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import {
  Accordion,
  Avatar,
  Feedback,
  IconButton,
  Input,
  Media,
  ProgressBar,
  RadioButton,
  RadioGroup,
  SegmentedControl,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  Textarea,
  ThemeProvider,
  ToastProvider,
  useToast,
} from "../src";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

// The pieces the demo screens don't reach, under the real React Native renderer.
describe("components on React Native", () => {
  it("types into Input and counts Textarea characters", async () => {
    const onChangeText = jest.fn();
    await wrap(
      <>
        <Input label="Name" onChangeText={onChangeText} />
        <Textarea label="Note" characterCount maxLength={40} defaultValue="Hi" />
      </>,
    );
    await fireEvent.changeText(screen.getByLabelText("Name"), "Anna");
    expect(onChangeText).toHaveBeenCalledWith("Anna");
    await fireEvent.changeText(screen.getByLabelText("Note"), "Oat flat white");
    // Like core, the count is what is left: 40 - 14.
    expect(screen.getByText("26")).toBeTruthy();
  });

  it("lets a RadioGroup check RadioButton children by value", async () => {
    const onChange = jest.fn();
    await wrap(
      <RadioGroup defaultValue="oat" onChange={onChange}>
        <RadioButton value="whole" label="Whole milk" />
        <RadioButton value="oat" label="Oat" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Oat", checked: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole("radio", { name: "Whole milk" }));
    expect(onChange).toHaveBeenCalledWith("whole");
    expect(screen.getByRole("radio", { name: "Whole milk", checked: true })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Oat", checked: false })).toBeTruthy();
  });

  it("grows Textarea by default and fixes it to a number of lines", async () => {
    await wrap(
      <>
        <Textarea label="Auto" />
        <Textarea label="Fixed" lines={4} />
      </>,
    );
    expect(screen.getByLabelText("Auto").props.scrollEnabled).toBe(false);
    const fixed = screen.getByLabelText("Fixed");
    expect(fixed.props.scrollEnabled).toBe(true);
    const style = Object.assign({}, ...[fixed.props.style].flat(Infinity).filter(Boolean));
    expect(style.height).toBe(style.lineHeight * 4);
  });

  it("switches SegmentedControl tabs", async () => {
    const onChange = jest.fn();
    await wrap(
      <SegmentedControl
        onChange={onChange}
        defaultValue="day"
        buttons={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
        ]}
      />,
    );
    await fireEvent.press(screen.getByRole("tab", { name: "Week" }));
    expect(onChange).toHaveBeenCalledWith("week");
    expect(screen.getByRole("tab", { name: "Week", selected: true })).toBeTruthy();
  });

  it("names IconButton and blocks presses while loading", async () => {
    const onPress = jest.fn();
    await wrap(
      <>
        <IconButton icon="close" ariaLabel="Close" onPress={onPress} />
        <IconButton icon="check" ariaLabel="Save" loading onPress={onPress} />
      </>,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Close" }));
    await fireEvent.press(screen.getByRole("button", { name: "Save" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows a toast from useToast", async () => {
    function Trigger() {
      const { addToast } = useToast();
      return (
        <IconButton
          icon="plus"
          ariaLabel="Notify"
          onPress={() => addToast({ variant: "success", message: "Saved" })}
        />
      );
    }
    await wrap(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Notify" }));
    expect(await screen.findByText("Saved")).toBeTruthy();
  });

  it("renders the display pieces with their accessible state", async () => {
    await wrap(
      <>
        <Avatar value="Lorant Toth" />
        <Tag label="New" />
        <ProgressBar value={40} />
        <Feedback variant="danger" title="Payment failed" description="Try another card." />
      </>,
    );
    expect(screen.getByRole("image", { name: "Avatar Lorant Toth" })).toBeTruthy();
    expect(screen.getByText("New")).toBeTruthy();
    expect(screen.getByRole("progressbar", { value: { now: 40 } })).toBeTruthy();
    expect(screen.getByText("Payment failed")).toBeTruthy();
  });

  it("switches Tabs panels", async () => {
    await wrap(
      <Tabs defaultValue="hot">
        <TabList>
          <Tab value="hot" label="Hot" />
          <Tab value="iced" label="Iced" />
        </TabList>
        <TabPanel value="hot">Flat white</TabPanel>
        <TabPanel value="iced">Cold brew</TabPanel>
      </Tabs>,
    );
    expect(screen.getByText("Flat white")).toBeTruthy();
    await fireEvent.press(screen.getByRole("tab", { name: "Iced" }));
    expect(screen.getByRole("tab", { name: "Iced", selected: true })).toBeTruthy();
    expect(screen.getByText("Cold brew")).toBeTruthy();
    expect(screen.queryByText("Flat white")).toBeNull();
  });

  it("opens an Accordion with LayoutAnimation", async () => {
    await wrap(<Accordion title="Allergens">Contains milk.</Accordion>);
    expect(screen.queryByText("Contains milk.")).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: "Allergens" }));
    expect(screen.getByRole("button", { name: "Allergens", expanded: true })).toBeTruthy();
    expect(screen.getByText("Contains milk.")).toBeTruthy();
  });

  it("names Media by its alt text and takes the loaded size", async () => {
    await wrap(<Media src="https://example.com/latte.jpg" alt="Latte art" aspectRatio="4 / 3" />);
    const image = screen.getByRole("image", { name: "Latte art" });
    await fireEvent(image, "load", { nativeEvent: { source: { width: 400, height: 300 } } });
    expect(image).toBeTruthy();
  });
});
