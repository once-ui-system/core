import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Banner } from "../src/components/Banner";
import { BlockQuote } from "../src/components/BlockQuote";
import { Breadcrumbs } from "../src/components/Breadcrumbs";
import { Grid } from "../src/components/Grid";
import { InfoTip } from "../src/components/InfoTip";
import { NumberInput } from "../src/components/NumberInput";
import { OTPInput } from "../src/components/OTPInput";
import { Pagination } from "../src/components/Pagination";
import { PasswordInput } from "../src/components/PasswordInput";
import { RangeSlider } from "../src/components/RangeSlider";
import { Slider } from "../src/components/Slider";
import { Text } from "../src/components/Text";
import { Timeline } from "../src/components/Timeline";
import { Tooltip } from "../src/components/Tooltip";
import { User } from "../src/components/User";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

const flat = (style: unknown) => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

type Host = { props: Record<string, unknown>; parent: Host | null };

/** The nearest view, from `element` up, that takes responder events: a slider's track. */
function track(element: Host): Host {
  let node: Host | null = element;
  while (node && !node.props.onResponderGrant) node = node.parent;
  if (!node) throw new Error("no responder above this element");
  return node;
}

/**
 * A one-finger drag along a 200pt track, from `from` through each of `to`, as
 * the responder system reports it: PanResponder reads `touchHistory`.
 */
async function drag(element: Host, from: number, ...to: number[]) {
  const view = track(element) as unknown as Parameters<typeof fireEvent>[0];
  let time = 0;
  let previous = from;
  const event = (x: number) => {
    time += 10;
    const touch = {
      touchActive: true,
      startPageX: from,
      startPageY: 0,
      startTimeStamp: 0,
      currentPageX: x,
      currentPageY: 0,
      currentTimeStamp: time,
      previousPageX: previous,
      previousPageY: 0,
      previousTimeStamp: time - 10,
    };
    previous = x;
    return {
      nativeEvent: { locationX: x, pageX: x, touches: [{}], changedTouches: [{}] },
      touchHistory: {
        numberActiveTouches: 1,
        indexOfSingleActiveTouch: 0,
        mostRecentTimeStamp: time,
        touchBank: [touch],
      },
    };
  };
  await fireEvent(view, "layout", { nativeEvent: { layout: { width: 200, height: 40 } } });
  await fireEvent(view, "startShouldSetResponderCapture", event(from));
  await fireEvent(view, "responderGrant", event(from));
  for (const x of to) await fireEvent(view, "responderMove", event(x));
  await fireEvent(view, "responderRelease", event(to[to.length - 1] ?? from));
}

describe("extra components on React Native", () => {
  it("lays Grid children out in equal columns and reflows at a breakpoint", async () => {
    await wrap(
      <>
        <Grid columns={3} gap="16">
          <Text>A</Text>
          <Text>B</Text>
          <Text>C</Text>
        </Grid>
        {/* The test screen is 750pt wide: inside `s`, outside `xs`. */}
        <Grid columns={4} s={{ columns: 2 }} xs={{ columns: 1 }}>
          <Text>D</Text>
        </Grid>
      </>,
    );
    const cell = flat(screen.getByText("A").parent?.props.style);
    expect(cell.width).toBe(`${100 / 3}%`);
    expect(cell.paddingHorizontal).toBe(
      flat(screen.getByText("B").parent?.props.style).paddingHorizontal,
    );
    expect(flat(screen.getByText("D").parent?.props.style).width).toBe("50%");
  });

  it("fits as many Grid columns as minColumnWidth allows", async () => {
    await wrap(
      <Grid minColumnWidth="10rem" gap="0">
        <Text>Cell</Text>
      </Grid>,
    );
    const row = screen.getByText("Cell").parent?.parent as unknown as Parameters<
      typeof fireEvent
    >[0];
    await fireEvent(row, "layout", { nativeEvent: { layout: { width: 400, height: 40 } } });
    // 10rem is 150 or 160pt: two fit in 400.
    expect(flat(screen.getByText("Cell").parent?.props.style).width).toBe("50%");
  });

  it("drags a Slider by step and adjusts it from a screen reader", async () => {
    const onChange = jest.fn();
    await wrap(<Slider label="Volume" step={10} showValue onValueChange={onChange} />);
    const slider = screen.getByRole("adjustable", { name: "Volume" });
    await drag(slider as unknown as Host, 50, 104);
    // 50 of 200 is 25, snapped to 30; then 104 of 200 is 52, snapped to 50.
    expect(onChange).toHaveBeenNthCalledWith(1, 30);
    expect(onChange).toHaveBeenLastCalledWith(50);
    expect(screen.getByText("50")).toBeTruthy();
    await fireEvent(slider, "accessibilityAction", { nativeEvent: { actionName: "increment" } });
    expect(onChange).toHaveBeenLastCalledWith(60);
    expect(screen.getByRole("adjustable", { name: "Volume" }).props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 60,
    });
  });

  it("follows a controlled Slider and ignores a disabled one", async () => {
    const onChange = jest.fn();
    await wrap(
      <>
        <Slider aria-label="Fixed" value={20} onValueChange={onChange} />
        <Slider aria-label="Off" disabled onValueChange={onChange} />
      </>,
    );
    const fixed = screen.getByRole("adjustable", { name: "Fixed" });
    await fireEvent(fixed, "accessibilityAction", { nativeEvent: { actionName: "decrement" } });
    expect(onChange).toHaveBeenCalledWith(19);
    // Controlled: it stays where the host put it.
    expect(screen.getByRole("adjustable", { name: "Fixed" }).props.accessibilityValue.now).toBe(20);
    const off = screen.getByRole("adjustable", { name: "Off" });
    await fireEvent(off, "accessibilityAction", { nativeEvent: { actionName: "increment" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("moves the nearer RangeSlider thumb and keeps the two apart", async () => {
    const onChange = jest.fn();
    await wrap(
      <RangeSlider
        label="Price"
        defaultValue={[20, 80]}
        minDistance={10}
        showValue
        formatValue={(v) => `$${v}`}
        onValueChange={onChange}
      />,
    );
    expect(screen.getByText("$20 – $80")).toBeTruthy();
    const min = screen.getByRole("adjustable", { name: "Minimum" });
    // A press at 140 of 200 (70) is nearer 80: the end thumb comes, then drags towards the start.
    await drag(min as unknown as Host, 140, 100, 20);
    expect(onChange).toHaveBeenNthCalledWith(1, [20, 70]);
    // It stops 10 above the start thumb.
    expect(onChange).toHaveBeenLastCalledWith([20, 30]);
    const max = screen.getByRole("adjustable", { name: "Maximum" });
    expect(max.props.accessibilityValue).toMatchObject({ min: 30, max: 100, now: 30, text: "$30" });
    // The start thumb can't come closer either, but it can move away.
    await fireEvent(min, "accessibilityAction", { nativeEvent: { actionName: "increment" } });
    const calls = onChange.mock.calls.length;
    await fireEvent(min, "accessibilityAction", { nativeEvent: { actionName: "decrement" } });
    expect(onChange).toHaveBeenCalledTimes(calls + 1);
    expect(onChange).toHaveBeenLastCalledWith([19, 30]);
  });

  it("splits two stacked RangeSlider thumbs by the first move", async () => {
    const onChange = jest.fn();
    await wrap(<RangeSlider defaultValue={[50, 50]} onValueChange={onChange} />);
    await drag(screen.getByRole("adjustable", { name: "Minimum" }) as unknown as Host, 100, 60);
    expect(onChange).toHaveBeenLastCalledWith([30, 50]);
  });

  it("steps NumberInput with its buttons inside min and max", async () => {
    const onChange = jest.fn();
    await wrap(
      <NumberInput label="Guests" defaultValue={1} min={1} max={2} onValueChange={onChange} />,
    );
    const decrement = screen.getByRole("button", { name: "Decrement value" });
    expect(decrement.props.accessibilityState?.disabled ?? decrement.props["aria-disabled"]).toBe(
      true,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Increment value" }));
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByLabelText("Guests").props.value).toBe("2");
    await fireEvent.changeText(screen.getByLabelText("Guests"), "1.");
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByLabelText("Guests").props.value).toBe("1.");
  });

  it("rounds NumberInput steps and follows a controlled value", async () => {
    const { rerender } = await wrap(<NumberInput label="Rate" value={0.1} step={0.2} />);
    await fireEvent.press(screen.getByRole("button", { name: "Increment value" }));
    expect(screen.getByLabelText("Rate").props.value).toBe("0.3");
    await rerender(
      <ThemeProvider theme="dark">
        <NumberInput label="Rate" value={7} padStart={2} step={0.2} />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("Rate").props.value).toBe("07");
  });

  it("shows and hides a PasswordInput", async () => {
    await wrap(<PasswordInput label="Password" />);
    expect(screen.getByLabelText("Password").props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password").props.secureTextEntry).toBe(false);
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
  });

  it("draws a Tooltip and opens an InfoTip on press", async () => {
    await wrap(
      <>
        <Tooltip label="Copy" prefixIcon="copy" />
        <InfoTip>Shown on your receipt.</InfoTip>
      </>,
    );
    expect(screen.getByText("Copy")).toBeTruthy();
    const icon = screen.getByRole("button", { name: "More information" });
    expect(icon.props.accessibilityHint).toBe("Shown on your receipt.");
    expect(screen.queryByText("Shown on your receipt.")).toBeNull();
    await fireEvent.press(icon);
    expect(screen.getByText("Shown on your receipt.")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Close"));
    expect(screen.queryByText("Shown on your receipt.")).toBeNull();
  });

  it("renders User with a tag, and skeletons while loading", async () => {
    await wrap(
      <>
        <User
          name="Lorant Toth"
          subline="Barista"
          tagProps={{ label: "Admin" }}
          avatarProps={{ value: "LT" }}
        />
        <User name="Hidden" subline="Hidden too" loading />
      </>,
    );
    expect(screen.getByText("Lorant Toth")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByText("Barista")).toBeTruthy();
    expect(screen.getByLabelText("Avatar LT")).toBeTruthy();
    expect(screen.queryByText("Hidden")).toBeNull();
    expect(screen.queryByText("Hidden too")).toBeNull();
  });

  it("puts Banner text on the brand's solid colour", async () => {
    await wrap(<Banner>Free delivery today</Banner>);
    const text = screen.getByText("Free delivery today");
    const banner = flat(text.parent?.props.style);
    expect(banner.backgroundColor).not.toBe("transparent");
    expect(flat(text.props.style).color).not.toBe(banner.backgroundColor);
  });

  it("renders a BlockQuote with its author and source", async () => {
    await wrap(
      <BlockQuote
        preline="On coffee"
        author={{ name: "Ada" }}
        link={{ href: "example.com", label: "Source" }}
      >
        Good coffee takes time.
      </BlockQuote>,
    );
    expect(screen.getByText("On coffee")).toBeTruthy();
    expect(screen.getByText("Good coffee takes time.")).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByRole("link")).toBeTruthy();
  });

  it("collapses Breadcrumbs and navigates from a crumb", async () => {
    const onNavigate = jest.fn();
    const onPress = jest.fn();
    await wrap(
      <Breadcrumbs
        maxItems={3}
        onNavigate={onNavigate}
        items={[
          { label: "Home", href: "/", prefixIcon: "home" },
          { label: "Shop", href: "/shop" },
          { label: "Coffee", href: "/shop/coffee" },
          { label: "Beans", onPress },
          { label: "Ethiopia" },
        ]}
      />,
    );
    expect(screen.queryByText("Shop")).toBeNull();
    expect(screen.queryByText("Coffee")).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: "Show 2 more" }));
    await fireEvent.press(screen.getByText("Coffee"));
    expect(onNavigate).toHaveBeenCalledWith(
      "/shop/coffee",
      expect.objectContaining({ label: "Coffee" }),
    );
    await fireEvent.press(screen.getByText("Beans"));
    expect(onPress).toHaveBeenCalled();
    // The current crumb is plain text.
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("pages through Pagination with ellipses and arrows", async () => {
    const onChange = jest.fn();
    await wrap(<Pagination total={10} defaultPage={5} onPageChange={onChange} />);
    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Page 5" }).props.accessibilityState).toMatchObject({
      selected: true,
    });
    await fireEvent.press(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenLastCalledWith(6);
    await fireEvent.press(screen.getByRole("button", { name: "Page 10" }));
    expect(onChange).toHaveBeenLastCalledWith(10);
    // Already there: the next arrow is disabled and pressing it does nothing.
    await fireEvent.press(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("keeps the first item on screen when the Pagination page size changes", async () => {
    const onChange = jest.fn();
    const onPerPageChange = jest.fn();
    await wrap(
      <Pagination
        count={100}
        defaultPage={3}
        perPageOptions={[10, 25]}
        onPageChange={onChange}
        onPerPageChange={onPerPageChange}
      />,
    );
    await fireEvent.press(screen.getByRole("combobox", { name: "Per page" }));
    await fireEvent.press(screen.getByRole("menuitem", { name: "25" }));
    expect(onPerPageChange).toHaveBeenCalledWith(25);
    // Item 21 was first on screen: at 25 a page it is on page 1.
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button", { name: "Page 4" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Page 5" })).toBeNull();
  });

  it("renders Timeline steps with the active one selected", async () => {
    await wrap(
      <Timeline
        items={[
          { label: "Ordered", state: "success", marker: "1" },
          { label: "Brewing", description: "About 4 minutes", state: "active" },
          { label: "Ready" },
        ]}
      />,
    );
    expect(screen.getByText("Ordered")).toBeTruthy();
    expect(screen.getByText("About 4 minutes")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    // A step is a list item but not one accessibility element, so its contents stay reachable.
    const step = (label: string) => {
      let node = screen.getByText(label) as unknown as Host | null;
      while (node && node.props.role !== "listitem") node = node.parent;
      return node;
    };
    expect(step("Brewing")?.props.accessibilityState).toMatchObject({ selected: true });
    expect(step("Ready")?.props.accessibilityState).toMatchObject({ selected: false });
    expect(step("Ready")?.parent?.props.role).toBe("list");
  });

  it("fills OTPInput digit by digit, pasted, and back with backspace", async () => {
    const onComplete = jest.fn();
    await wrap(<OTPInput length={4} onComplete={onComplete} />);
    const field = (n: number) => screen.getByLabelText(`OTP digit ${n} of 4`);
    await fireEvent.changeText(field(1), "1");
    await fireEvent.changeText(field(2), "x");
    expect(field(2).props.value).toBe("");
    await fireEvent(field(2), "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(field(1).props.value).toBe("");
    await fireEvent.changeText(field(1), "4821");
    expect([1, 2, 3, 4].map((n) => field(n).props.value)).toEqual(["4", "8", "2", "1"]);
    expect(onComplete).toHaveBeenCalledWith("4821");
    await fireEvent.changeText(field(3), "27");
    expect(field(3).props.value).toBe("7");
    expect(onComplete).toHaveBeenLastCalledWith("4871");
  });
});
