import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateInput } from "../components/DateInput";
import { DatePicker } from "../components/DatePicker";
import { EmojiPickerDropdown } from "../components/EmojiPickerDropdown";
import { Flex } from "../components/Flex";
import { Heading } from "../components/Heading";
import { Input } from "../components/Input";
import { NumberInput } from "../components/NumberInput";
import { Text } from "../components/Text";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * Fields that only worked controlled, found by the 3.0 audit: DatePicker
 * ignored `defaultDate`, NumberInput and DateInput passed the native
 * `defaultValue` to an input that also had a `value`, DateInput could not be
 * cleared from outside, Input and Textarea validated only a controlled
 * `value`, and EmojiPickerDropdown closed after a pick only when controlled.
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);

const day = (date: Date) =>
  waitFor(() => {
    const button = document.querySelector<HTMLButtonElement>(
      `button[data-value="${date.toISOString()}"]`,
    );
    if (!button) throw new Error(`No day button for ${date.toDateString()}`);
    return button;
  });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("DatePicker defaultDate", () => {
  it("starts on and selects defaultDate when there is no value", async () => {
    render(<DatePicker defaultDate={jan(5)} />, { wrapper: wrap });
    expect(await screen.findByRole("grid", { name: "January 2026" })).toBeInTheDocument();
    expect((await day(jan(5))).closest('[role="gridcell"]')).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("lets a value win over defaultDate", async () => {
    render(<DatePicker value={jan(9)} defaultDate={jan(5)} />, { wrapper: wrap });
    expect((await day(jan(9))).closest('[role="gridcell"]')).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect((await day(jan(5))).closest('[role="gridcell"]')).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});

describe("NumberInput defaultValue", () => {
  it("shows defaultValue without a controlled-and-uncontrolled warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<NumberInput id="n" label="Amount" defaultValue={5} />, { wrapper: wrap });
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("5");
    expect(screen.getByRole("spinbutton")).not.toHaveAttribute("defaultValue");
    expect(error).not.toHaveBeenCalled();
  });
});

describe("DateInput", () => {
  it("shows defaultValue without a controlled-and-uncontrolled warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<DateInput id="d" label="Date" defaultValue={jan(5)} />, { wrapper: wrap });
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toContain("2026");
    expect(error).not.toHaveBeenCalled();
  });

  it("clears when its value is cleared from outside", () => {
    const { rerender } = render(<DateInput id="d" label="Date" value={jan(5)} />, {
      wrapper: wrap,
    });
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toContain("2026");
    rerender(<DateInput id="d" label="Date" value={undefined} />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
  });
});

describe("validate on an uncontrolled field", () => {
  it.each([
    ["Input", Input],
    ["Textarea", Textarea],
  ] as const)("%s runs validate on what was typed", async (_name, Field) => {
    const user = userEvent.setup();
    const validate = (value: React.ReactNode) =>
      String(value).includes("@") ? null : "Enter an email address";
    render(<Field id="email" label="Email" validate={validate} />, { wrapper: wrap });

    await user.type(screen.getByLabelText("Email"), "nope");
    expect(await screen.findByText("Enter an email address", {}, { timeout: 2500 })).toBeVisible();
  });
});

describe("EmojiPickerDropdown uncontrolled", () => {
  it("closes after a pick without open or onOpenChange", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<EmojiPickerDropdown trigger={<span>Pick an emoji</span>} onSelect={onSelect} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByText("Pick an emoji"));
    const emoji = (await screen.findAllByRole("button", { name: "grinning face" }))[0];
    await user.click(emoji);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryAllByRole("gridcell")).toHaveLength(0));
  });
});

describe("prop-misuse warnings", () => {
  it("stay out of production renders", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(
      <>
        <Text
          variant="body-default-m"
          size="l"
          onBackground="neutral-strong"
          onSolid="neutral-strong"
        >
          a
        </Text>
        <Heading variant="display-default-m" weight="strong">
          b
        </Heading>
        <Flex background="page" solid="brand-strong" />
      </>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("still show in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(
      <Text variant="body-default-m" size="l">
        a
      </Text>,
    );
    expect(warn).toHaveBeenCalled();
  });
});
