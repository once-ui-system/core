import { describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { RefreshControl, StyleSheet, Text } from "react-native";
import {
  Button,
  generateColorScheme,
  Row,
  Scroller,
  Skeleton,
  ThemeProvider,
  type ThemeProviderProps,
  useTheme,
} from "../src";

const wrap = (node: ReactNode, props: Partial<ThemeProviderProps> = {}) =>
  render(
    <ThemeProvider theme="dark" {...props}>
      {node}
    </ThemeProvider>,
  );

function Probe({ token }: { token: string }) {
  const theme = useTheme();
  return <Text testID="probe">{`${theme.settings.brand} ${theme.color(token)}`}</Text>;
}

// Gaps the Tavilio venue app ran into, under the real React Native renderer.
describe("Tavilio feedback", () => {
  it("builds a custom brand from a seed, as core's brandSeed", async () => {
    await wrap(<Probe token="brand-border-strong" />, { brandSeed: "#b87333" });
    const [brand, color] = screen.getByTestId("probe").props.children.split(" ");
    expect(brand).toBe("custom");
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.values(generateColorScheme("#b87333") ?? {})).toContain(color);
  });

  it("takes a custom brand scale step by step, in hex or oklch", async () => {
    const scale = Object.fromEntries(
      [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200].map((step, i) => [
        step,
        `#${(0x101010 * (i + 1)).toString(16).slice(-6)}`,
      ]),
    );
    await wrap(<Probe token="brand-border-strong" />, {
      brand: "custom",
      brandScale: scale,
    });
    const [, color] = screen.getByTestId("probe").props.children.split(" ");
    // brand-border-strong is step 400 in the dark theme.
    expect(color).toBe(scale[400]);

    // React Native can't parse oklch(), so a step given that way arrives as hex.
    await wrap(<Probe token="brand-border-strong" />, {
      brandScale: { ...scale, 400: "oklch(0.6 0.1 50)" },
    });
    const [brand, converted] = screen.getByTestId("probe").props.children.split(" ");
    expect(brand).toBe("custom");
    expect(converted).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("sizes Skeleton in rem like Flex, with fillWidth", async () => {
    let rem = 0;
    function Rem() {
      rem = useTheme().rem;
      return null;
    }
    await wrap(
      <>
        <Rem />
        <Skeleton testID="a" shape="block" width={2} height={4.5} />
        <Skeleton testID="b" shape="block" height={4.5} fillWidth />
      </>,
    );
    const a = StyleSheet.flatten(screen.getByTestId("a").props.style);
    const b = StyleSheet.flatten(screen.getByTestId("b").props.style);
    expect(a.width).toBe(2 * rem);
    expect(a.height).toBe(4.5 * rem);
    expect(b.width).toBe("100%");
  });

  it("lets fillWidth Buttons share a row", async () => {
    await wrap(
      <Row gap="8">
        <Button fillWidth label="Approve" />
        <Button fillWidth label="Decline" />
      </Row>,
    );
    for (const name of ["Approve", "Decline"]) {
      const style = StyleSheet.flatten(screen.getByRole("button", { name }).props.style);
      expect(style.width).toBe("100%");
      expect(style.flexShrink).toBe(1);
    }
  });

  it("scrolls a column with themed pull to refresh and safe-area padding", async () => {
    let resolve = () => {};
    const onRefresh = jest.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    await wrap(
      <Scroller
        testID="list"
        direction="column"
        padding="16"
        safeArea={["bottom"]}
        onRefresh={onRefresh}
      >
        <Text>Bookings</Text>
      </Scroller>,
      { insets: { top: 0, right: 0, bottom: 34, left: 0 } },
    );
    const list = screen.getByTestId("list");
    const content = StyleSheet.flatten(list.props.contentContainerStyle);
    expect(content.paddingBottom).toBeGreaterThan(34);
    expect(content.flexGrow).toBe(1);

    const control = () => screen.getByTestId("list").props.refreshControl;
    expect(control().type).toBe(RefreshControl);
    expect(control().props.refreshing).toBe(false);
    await act(async () => control().props.onRefresh());
    expect(onRefresh).toHaveBeenCalled();
    expect(control().props.refreshing).toBe(true);
    await act(async () => resolve());
    expect(control().props.refreshing).toBe(false);
  });
});

describe("Buttons in a row", () => {
  it("follow the row's vertical alignment and keep their width in a column", async () => {
    await wrap(
      <>
        <Row vertical="center">
          <Button label="Edit" />
        </Row>
        <Button label="Alone" />
      </>,
    );
    const inRow = StyleSheet.flatten(screen.getByRole("button", { name: "Edit" }).props.style);
    const alone = StyleSheet.flatten(screen.getByRole("button", { name: "Alone" }).props.style);
    expect(inRow.alignSelf).toBeUndefined();
    expect(alone.alignSelf).toBe("flex-start");
  });
});
