import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { DateInput } from "../components/DateInput";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * An empty DateInput's label floated on after a click away from its picker.
 * Dropdown handed focus back to the field whenever the panel closed with
 * focus on <body>, and a click on anything that takes no focus leaves it
 * there, so the field was focused again and its label stayed up over
 * nothing. A click outside now leaves focus where the click put it, as any
 * other click does; Escape and a pick still bring focus back to the field.
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

const labelOf = (id: string) => document.querySelector(`label[for="${id}"]`)?.className ?? "";
const isOpen = () => document.querySelector('[role="dialog"]') !== null;

const Page = () => (
  <>
    <DateInput id="due" label="Due" />
    <p data-testid="outside">Outside</p>
  </>
);

describe("DateInput label", () => {
  it("rests while the field is empty and unfocused", () => {
    render(<Page />, { wrapper: wrap });
    expect(labelOf("due")).not.toMatch(/floating/);
  });

  it("floats when the field holds a date", () => {
    render(<DateInput id="due" label="Due" defaultValue={new Date(2026, 0, 5)} />, {
      wrapper: wrap,
    });
    expect(labelOf("due")).toMatch(/floating/);
  });

  it("rests again after a click away from the open picker", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper: wrap });
    const field = screen.getByRole("combobox", { name: "Due" });

    await user.click(field);
    await waitFor(() => expect(isOpen()).toBe(true));
    await settle();

    await user.click(screen.getByTestId("outside"));
    await waitFor(() => expect(isOpen()).toBe(false));
    await settle();

    expect(field).not.toHaveFocus();
    expect(labelOf("due")).not.toMatch(/floating/);
  });

  it("still returns focus to the field on Escape, label floating while it is focused", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper: wrap });
    const field = screen.getByRole("combobox", { name: "Due" });

    await user.click(field);
    await waitFor(() => expect(isOpen()).toBe(true));
    await settle();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await waitFor(() => expect(field).toHaveFocus());
    expect(labelOf("due")).toMatch(/floating/);

    await user.tab();
    expect(labelOf("due")).not.toMatch(/floating/);
  });
});

describe("Dropdown click outside", () => {
  it("leaves focus off a Select's field after a click away", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select
          id="fruit"
          label="Fruit"
          options={[
            { label: "Apple", value: "apple" },
            { label: "Pear", value: "pear" },
          ]}
        />
        <p data-testid="outside">Outside</p>
      </>,
      { wrapper: wrap },
    );
    const field = screen.getByRole("combobox", { name: "Fruit" });

    await user.click(field);
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    await user.click(screen.getByTestId("outside"));
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    await settle();

    expect(field).not.toHaveFocus();
  });
});
