import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dimensions } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Button,
  Card,
  Column,
  createTheme,
  Dialog,
  defaultSettings,
  flexStyle,
  Text,
  ThemeProvider,
  ToastProvider,
  useToast,
} from "../src";

afterEach(cleanup);

const settings = { ...defaultSettings, theme: "light" as const };
const phone = createTheme(settings, 390);
const tablet = createTheme(settings, 900);
const desktop = createTheme(settings, 1600);
const notch = { top: 47, right: 0, bottom: 34, left: 0 };

describe("responsive props", () => {
  it("exposes the width and core's breakpoints on the theme", () => {
    expect(phone.width).toBe(390);
    expect(phone.breakpoints).toEqual({ xs: 480, s: 768, m: 1024, l: 1440, xl: Infinity });
    expect(phone.insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("turns a Column into a row at s and below", () => {
    const props = { direction: "column", s: { direction: "row", gap: "4" } } as const;
    const onPhone = flexStyle(phone, props).style;
    expect(onPhone.flexDirection).toBe("row");
    expect(onPhone.gap).toBe(phone.space("4"));
    const onDesktop = flexStyle(desktop, props).style;
    expect(onDesktop.flexDirection).toBe("column");
    expect(onDesktop.gap).toBeUndefined();
  });

  it("renders a Column as a row on a phone-width screen", () => {
    const spy = vi
      .spyOn(Dimensions, "get")
      .mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
    render(
      <ThemeProvider theme="light">
        <Column testID="col" s={{ direction: "row" }}>
          <Text>A</Text>
        </Column>
      </ThemeProvider>,
    );
    expect(getComputedStyle(screen.getByTestId("col")).flexDirection).toBe("row");
    spy.mockRestore();
  });

  it("applies larger breakpoints first, so the smaller one wins", () => {
    const props = { padding: "8", m: { padding: "16", gap: "8" }, s: { padding: "24" } } as const;
    expect(flexStyle(desktop, props).style.padding).toBe(desktop.space("8"));
    expect(flexStyle(tablet, props).style).toMatchObject({
      padding: tablet.space("16"),
      gap: tablet.space("8"),
    });
    // `s` overrides `m`'s padding and keeps its gap.
    expect(flexStyle(phone, props).style).toMatchObject({
      padding: phone.space("24"),
      gap: phone.space("8"),
    });
  });

  it("applies xl at every width, under the smaller breakpoints", () => {
    const props = { xl: { radius: "l", opacity: 50 }, xs: { opacity: 100 } } as const;
    expect(flexStyle(desktop, props).style).toMatchObject({ opacity: 0.5 });
    expect(flexStyle(createTheme(settings, 400), props).style).toMatchObject({ opacity: 1 });
  });

  it("re-reads alignment against a breakpoint direction", () => {
    const props = { direction: "row", horizontal: "center", s: { direction: "column" } } as const;
    expect(flexStyle(desktop, props).style.justifyContent).toBe("center");
    expect(flexStyle(phone, props).style).toMatchObject({ alignItems: "center" });
    expect(flexStyle(phone, props).style.justifyContent).toBeUndefined();
  });

  it("takes position, offsets, sizes and a style at a breakpoint", () => {
    const { style, userStyle } = flexStyle(phone, {
      style: { opacity: 0.9 },
      s: { position: "absolute", top: "16", left: 0, fillWidth: true, style: { zIndex: 3 } },
    });
    expect(style).toMatchObject({ position: "absolute", top: phone.space("16"), left: 0 });
    expect(style.width).toBe("100%");
    expect(userStyle).toEqual([{ opacity: 0.9 }, { zIndex: 3 }]);
  });

  it("keeps breakpoint objects off the view", () => {
    const { rest } = flexStyle(phone, { s: { hide: true }, testID: "x" } as never);
    expect(Object.keys(rest)).toEqual(["testID"]);
  });
});

describe("hide", () => {
  it("renders nothing for hide, on Flex and Card", () => {
    render(
      <ThemeProvider theme="light">
        <Column hide>
          <Text>Gone</Text>
        </Column>
        <Card hide>Also gone</Card>
        <Column>
          <Text>Here</Text>
        </Column>
      </ThemeProvider>,
    );
    expect(screen.queryByText("Gone")).toBeNull();
    expect(screen.queryByText("Also gone")).toBeNull();
    expect(screen.getByText("Here")).toBeTruthy();
  });

  it("hides and shows per breakpoint", () => {
    expect(flexStyle(phone, { s: { hide: true } }).hidden).toBe(true);
    expect(flexStyle(desktop, { s: { hide: true } }).hidden).toBe(false);
    // Hidden on desktop, shown again on phones, as core's `s-flex-show`.
    const desktopOnly = { hide: true, s: { hide: false } };
    expect(flexStyle(desktop, desktopOnly).hidden).toBe(true);
    expect(flexStyle(phone, desktopOnly).hidden).toBe(false);
  });

  it("shows dark and light content only in its theme", () => {
    expect(flexStyle(phone, { dark: true }).hidden).toBe(true);
    expect(flexStyle(phone, { light: true }).hidden).toBe(false);
  });
});

describe("safe areas", () => {
  const notched = createTheme(settings, 390, {}, notch);

  it("adds the insets to the padding of the edges asked for", () => {
    const { style } = flexStyle(notched, { padding: "16", safeArea: ["top", "bottom"] });
    const pad = notched.space("16");
    expect(style).toMatchObject({ padding: pad, paddingTop: pad + 47, paddingBottom: pad + 34 });
    expect(style.paddingLeft).toBeUndefined();
    expect(style.paddingRight).toBeUndefined();
  });

  it("takes the most specific padding of each edge, and true for all four", () => {
    const { style } = flexStyle(notched, {
      paddingY: "8",
      paddingTop: "20",
      paddingX: "4",
      safeArea: true,
    });
    expect(style).toMatchObject({
      paddingTop: notched.space("20") + 47,
      paddingBottom: notched.space("8") + 34,
      paddingLeft: notched.space("4"),
      paddingRight: notched.space("4"),
    });
  });

  it("adds nothing without insets", () => {
    const { style } = flexStyle(phone, { safeArea: true });
    expect(style).toMatchObject({ paddingTop: 0, paddingBottom: 0 });
  });

  it("puts ThemeProvider's insets on the theme", () => {
    render(
      <ThemeProvider theme="light" insets={notch}>
        <Column testID="screen" safeArea={["top"]} />
      </ThemeProvider>,
    );
    expect(getComputedStyle(screen.getByTestId("screen")).paddingTop).toBe("47px");
  });

  it("pads a Dialog's sheet by the bottom inset", () => {
    render(
      <ThemeProvider theme="light" insets={notch}>
        <Dialog open onClose={() => {}} title="Redeem" />
      </ThemeProvider>,
    );
    // react-native-web's Modal is a dialog too; the sheet is the inner one.
    const sheet = screen.getAllByRole("dialog").at(-1) as HTMLElement;
    expect(getComputedStyle(sheet).paddingBottom).toBe("34px");
  });

  it("stacks toasts above the bottom inset", () => {
    vi.useFakeTimers();
    function Saver() {
      const { addToast } = useToast();
      return (
        <Button label="Save" onPress={() => addToast({ variant: "info", message: "Saved" })} />
      );
    }
    render(
      <ThemeProvider theme="light" insets={notch}>
        <ToastProvider>
          <Saver />
        </ToastProvider>
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    let stack: HTMLElement | null = screen.getByText("Saved");
    while (stack && getComputedStyle(stack).position !== "absolute") stack = stack.parentElement;
    const theme = createTheme(settings, Dimensions.get("window").width);
    expect(stack && getComputedStyle(stack).bottom).toBe(`${theme.space("32") + 34}px`);
    act(() => vi.runAllTimers());
    vi.useRealTimers();
  });
});
