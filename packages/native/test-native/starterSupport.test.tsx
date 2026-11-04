import { describe, expect, it } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import { useEffect } from "react";
import { Text } from "react-native";
import { ToastProvider, useToast } from "../src/components/Toast";
import { ThemeProvider, useTheme } from "../src/theme";

function ThemeName() {
  return <Text testID="theme">{useTheme().settings.theme}</Text>;
}

describe("ThemeProvider takes a web app's style config", () => {
  it("accepts defaultTheme and transition, so the web config spreads in", async () => {
    const style = {
      theme: "dark",
      defaultTheme: "dark",
      transition: "all",
      brand: "orange",
      solid: "color",
    } as const;
    await render(
      <ThemeProvider {...style}>
        <ThemeName />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").props.children).toBe("dark");
  });
});

function Saver({ offset }: { offset: number }) {
  const { addToast, setBottomOffset } = useToast();
  useEffect(() => {
    setBottomOffset(offset);
    addToast({ tone: "success", message: "Saved", testID: "toast" });
  }, [addToast, setBottomOffset, offset]);
  return null;
}

describe("ToastProvider setBottomOffset", () => {
  it("stacks toasts above a bottom bar", async () => {
    await render(
      <ThemeProvider theme="dark">
        <ToastProvider>
          <Saver offset={90} />
        </ToastProvider>
      </ThemeProvider>,
    );
    await act(async () => {});
    let host = screen.getByTestId("toast").parent;
    let bottom: number | undefined;
    while (host && bottom === undefined) {
      const style = [host.props.style].flat(Number.POSITIVE_INFINITY);
      bottom = style.find((s) => s && typeof s === "object" && "bottom" in s)?.bottom;
      host = host.parent;
    }
    expect(bottom).toBeGreaterThan(90);
  });
});
