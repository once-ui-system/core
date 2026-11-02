import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { createRef, type ReactNode } from "react";
import { TextInput } from "react-native";
import { Avatar } from "../src/components/Avatar";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import type { TextInputRef } from "../src/components/refs";
import { SearchInput } from "../src/components/SearchInput";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

describe("Button wrap", () => {
  it("cuts a label to one line by default", async () => {
    await wrap(<Button label="Book a table for the whole party" />);
    expect(screen.getByText("Book a table for the whole party").props.numberOfLines).toBe(1);
  });

  it("lets the label wrap and the button grow with wrap", async () => {
    await wrap(<Button testID="book" wrap label="Book a table for the whole party" />);
    expect(
      screen.getByText("Book a table for the whole party").props.numberOfLines,
    ).toBeUndefined();
    const style = [screen.getByTestId("book").props.style].flat(Number.POSITIVE_INFINITY);
    expect(style.some((s) => s && typeof s === "object" && "height" in s)).toBe(false);
  });
});

describe("Input", () => {
  it("focuses its text control when the field around it is tapped", async () => {
    const focus = jest.spyOn(TextInput.prototype, "focus").mockImplementation(() => {});
    await wrap(<Input label="Email" testID="email" />);
    // The label lies beside the text control, so a tap on it lands on the field.
    await fireEvent.press(screen.getByText("Email"));
    expect(focus).toHaveBeenCalled();
    focus.mockRestore();
  });

  it("still hands the text control to a ref", async () => {
    const ref = createRef<TextInputRef>();
    await wrap(<Input ref={ref} label="Email" />);
    expect(ref.current).toBeTruthy();
  });
});

describe("SearchInput", () => {
  it("searches on the keyboard's key and clears once there is text", async () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    await wrap(<SearchInput testID="search" onChangeText={onChangeText} onClear={onClear} />);
    const field = screen.getByTestId("search");
    expect(field.props.returnKeyType).toBe("search");
    expect(screen.getByPlaceholderText("Search")).toBeTruthy();
    expect(screen.queryByTestId("search-clear")).toBeNull();
    await fireEvent.changeText(field, "pasta");
    await fireEvent.press(screen.getByTestId("search-clear"));
    expect(onChangeText).toHaveBeenLastCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("search-clear")).toBeNull();
  });
});

describe("Avatar ring", () => {
  const width = () =>
    [screen.getByTestId("me").props.style].flat().find((s) => s && "width" in s)?.width;

  it("grows by a ring in the brand colour", async () => {
    await wrap(<Avatar testID="me" value="LO" />);
    const plain = width();
    await wrap(<Avatar testID="me" value="LO" ring />);
    expect(width()).toBeGreaterThan(plain);
    expect(screen.getByLabelText("Avatar LO")).toBeTruthy();
    // The ring is a border two points or wider; the avatar's own edge is one.
    const borders: number[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      const el = node as { props?: { style?: unknown }; children?: unknown[] };
      for (const s of [el.props?.style].flat(Number.POSITIVE_INFINITY)) {
        if (s && typeof s === "object" && "borderWidth" in s) borders.push(Number(s.borderWidth));
      }
      el.children?.forEach(walk);
    };
    walk(screen.toJSON());
    expect(Math.max(...borders)).toBeGreaterThanOrEqual(2);
  });
});
