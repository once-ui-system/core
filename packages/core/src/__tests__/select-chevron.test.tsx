import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
];

const field = () => screen.getByRole("combobox", { name: "Pick" });
const isOpen = () => field().getAttribute("aria-expanded") === "true";

/**
 * Without a chevron a closed Select read as a text field. It draws one by
 * default, a press on it works like a press on the field, and a suffix the
 * caller passes takes its place.
 */
describe("Select chevron", () => {
  it("draws a chevron by default", () => {
    const { container } = render(
      <LayoutProvider>
        <Select id="s" label="Pick" options={options} />
      </LayoutProvider>,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("opens and closes the list from the chevron", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <LayoutProvider>
        <Select id="s" label="Pick" options={options} />
      </LayoutProvider>,
    );
    const chevron = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(chevron);
    await waitFor(() => expect(isOpen()).toBe(true));
    expect(field()).toHaveFocus();
    await user.click(chevron);
    await waitFor(() => expect(isOpen()).toBe(false));
  });

  it("lets a suffix replace the chevron", () => {
    render(
      <LayoutProvider>
        <Select id="s" label="Pick" options={options} suffix={<span>custom</span>} />
      </LayoutProvider>,
    );
    expect(screen.getByText("custom")).toBeTruthy();
    expect(document.querySelector('[aria-hidden="true"] svg')).toBeNull();
  });
});
