import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import {
  Avatar,
  Feedback,
  IconButton,
  Input,
  ProgressBar,
  SegmentedControl,
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
});
