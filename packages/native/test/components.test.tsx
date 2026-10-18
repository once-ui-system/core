import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dimensions } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Column,
  createTheme,
  defaultSettings,
  Feedback,
  flexStyle,
  Heading,
  Input,
  Line,
  Row,
  Skeleton,
  Spinner,
  Switch,
  Tag,
  Text,
  Textarea,
  ThemeProvider,
} from "../src";

afterEach(cleanup);

const light = createTheme(
  { ...defaultSettings, theme: "light", solid: "color" },
  Dimensions.get("window").width,
);

/** react-native-web writes colours as rgb(); tokens are hex. */
function rgb(hex: string) {
  const h = hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
  if (h.length === 8) {
    return `rgba(${r}, ${g}, ${b}, ${+(Number.parseInt(h.slice(6), 16) / 255).toFixed(2)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

const inLight = (ui: React.ReactNode) =>
  render(
    <ThemeProvider theme="light" solid="color">
      {ui}
    </ThemeProvider>,
  );

describe("components", () => {
  it("Button paints the brand solid and calls onPress", () => {
    const onPress = vi.fn();
    inLight(<Button label="Save" onPress={onPress} />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(getComputedStyle(button).backgroundColor).toBe(rgb(light.color("brand-solid-medium")));
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("a disabled Button does not fire", () => {
    const onPress = vi.fn();
    inLight(<Button label="Save" disabled onPress={onPress} />);
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });

  it("Text resolves its variant and colour from the theme", () => {
    inLight(
      <Text variant="body-strong-l" onBackground="brand-medium">
        Hello
      </Text>,
    );
    const style = getComputedStyle(screen.getByText("Hello"));
    // body-l is 1.125rem; rem is the device's root size (15px on a phone).
    expect(style.fontSize).toBe(`${1.125 * light.rem}px`);
    expect(style.color).toBe(rgb(light.color("brand-on-background-medium")));
  });

  it("Heading is announced as a heading", () => {
    inLight(<Heading>Title</Heading>);
    expect(screen.getByRole("heading", { name: "Title" })).toBeTruthy();
  });

  it("Row and Column map spacing tokens and core's axis rules", () => {
    inLight(
      <Column testID="col" gap="16" padding="m" horizontal="center" background="surface">
        <Row testID="row" horizontal="between" vertical="center" />
      </Column>,
    );
    const col = getComputedStyle(screen.getByTestId("col"));
    expect(col.flexDirection).toBe("column");
    expect(col.alignItems).toBe("center");
    expect(col.paddingTop).toBe(`${light.space("m")}px`);
    const row = getComputedStyle(screen.getByTestId("row"));
    expect(row.flexDirection).toBe("row");
    expect(row.justifyContent).toBe("space-between");
  });

  it("Switch and Checkbox toggle, controlled or not", () => {
    const onToggle = vi.fn();
    inLight(
      <>
        <Switch label="Wi-Fi" onToggle={onToggle} />
        <Checkbox label="Accept" defaultChecked />
      </>,
    );
    const sw = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(sw);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(sw.getAttribute("aria-checked")).toBe("true");
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(box);
    expect(box.getAttribute("aria-checked")).toBe("false");
  });

  it("Input shows its label, error and description", () => {
    inLight(
      <Input
        label="Email"
        error
        errorMessage="Enter a valid email"
        description="We never share it"
      />,
    );
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByText("Enter a valid email")).toBeTruthy();
    expect(screen.getByText("We never share it")).toBeTruthy();
  });

  it("Feedback is an alert", () => {
    inLight(<Feedback variant="danger" title="Payment failed" description="Try another card" />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Payment failed")).toBeTruthy();
  });

  it("renders every component without a provider", () => {
    vi.useFakeTimers();
    const { container } = render(
      <Column>
        <Card onPress={() => {}}>
          <Text>Card</Text>
        </Card>
        <Line />
        <Tag scheme="success" label="Paid" />
        <Avatar value="LT" statusIndicator={{ color: "green" }} />
        <Avatar loading />
        <Textarea label="Notes" lines={4} />
        <Spinner size="l" />
        <Skeleton shape="circle" />
      </Column>,
    );
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
    expect(container.textContent).toContain("Paid");
    expect(container.textContent).toContain("LT");
  });
});

describe("polish", () => {
  it("wraps bare text in Flex and Card, which React Native would reject", () => {
    render(
      <ThemeProvider theme="light">
        <Row>Hello {3}</Row>
        <Card>Inside a card</Card>
      </ThemeProvider>,
    );
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByText("Inside a card")).toBeTruthy();
  });

  it("does not clip a rounded Flex unless asked, so its shadow shows on iOS", () => {
    expect(flexStyle(light, { radius: "l", shadow: "m" }).style.overflow).toBeUndefined();
    expect(flexStyle(light, { radius: "l", overflow: "hidden" }).style.overflow).toBe("hidden");
  });

  it("keeps the label floating after an uncontrolled Input loses focus", () => {
    render(
      <ThemeProvider theme="light">
        <Input label="Name" />
      </ThemeProvider>,
    );
    const field = screen.getByLabelText("Name") as HTMLInputElement;
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "Ada" } });
    fireEvent.blur(field);
    // A resting label hides the control behind it; a floating one leaves it visible.
    expect(getComputedStyle(field).opacity).not.toBe("0");
  });
});
