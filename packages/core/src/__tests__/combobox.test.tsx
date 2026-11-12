import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../components/Combobox";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const cities = [
  { value: "bud", label: "Budapest" },
  { value: "ber", label: "Berlin" },
  { value: "bern", label: "Bern" },
  { value: "osl", label: "Oslo", disabled: true },
];

const field = () => screen.getByRole("combobox", { name: "City" });
const isOpen = () => field().getAttribute("aria-expanded") === "true";
const wrap = (ui: React.ReactElement) => render(<LayoutProvider>{ui}</LayoutProvider>);

describe("Combobox", () => {
  it("keeps typed text that matches no suggestion", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    wrap(<Combobox id="c" label="City" options={cities} onValueChange={onValueChange} />);
    await user.type(field(), "Szeged");
    expect(field()).toHaveValue("Szeged");
    expect(onValueChange).toHaveBeenLastCalledWith("Szeged");
    // Nothing matches and there is no emptyState: the list stays shut.
    expect(isOpen()).toBe(false);
    await user.keyboard("{Enter}");
    expect(field()).toHaveValue("Szeged");
  });

  it("filters as you type and picks with the arrows and Enter", async () => {
    const user = userEvent.setup();
    const onOptionSelect = vi.fn();
    wrap(<Combobox id="c" label="City" options={cities} onOptionSelect={onOptionSelect} />);
    await user.type(field(), "ber");
    await waitFor(() => expect(isOpen()).toBe(true));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Berlin", "Bern"]);
    // Typing highlights nothing, so Enter alone would keep "ber".
    expect(field().getAttribute("aria-activedescendant")).toBeNull();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    const active = field().getAttribute("aria-activedescendant");
    expect(document.getElementById(active ?? "")?.textContent).toBe("Bern");
    await user.keyboard("{Enter}");
    expect(field()).toHaveValue("Bern");
    expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "bern" }));
    expect(isOpen()).toBe(false);
    expect(field()).toHaveFocus();
  });

  it("picks a suggestion with a click and keeps focus in the field", async () => {
    const user = userEvent.setup();
    wrap(<Combobox id="c" label="City" options={cities} />);
    await user.type(field(), "b");
    await waitFor(() => expect(isOpen()).toBe(true));
    await user.click(screen.getByRole("option", { name: "Budapest" }));
    expect(field()).toHaveValue("Budapest");
    expect(field()).toHaveFocus();
  });

  it("closes on Escape, then clears on a second Escape", async () => {
    const user = userEvent.setup();
    wrap(<Combobox id="c" label="City" options={cities} />);
    await user.type(field(), "be");
    await waitFor(() => expect(isOpen()).toBe(true));
    await user.keyboard("{Escape}");
    expect(isOpen()).toBe(false);
    expect(field()).toHaveValue("be");
    await user.keyboard("{Escape}");
    expect(field()).toHaveValue("");
  });

  it("shows server results as given, with a loading row and an empty state", async () => {
    const user = userEvent.setup();
    function Search() {
      const [text, setText] = useState("");
      const results = text === "zz" ? [] : cities.slice(0, 2);
      return (
        <Combobox
          id="c"
          label="City"
          value={text}
          onValueChange={setText}
          options={results}
          filter={false}
          loading={text === "lo"}
          emptyState="No city by that name"
        />
      );
    }
    wrap(<Search />);
    await user.type(field(), "zz");
    await waitFor(() => expect(screen.getByText("No city by that name")).toBeTruthy());
    await user.clear(field());
    await user.type(field(), "lo");
    await waitFor(() => expect(screen.getByText("Loading…")).toBeTruthy());
    // filter={false}: both options show although neither contains "lo".
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("has no axe violations open or closed", async () => {
    const user = userEvent.setup();
    const { container } = wrap(<Combobox id="c" label="City" options={cities} />);
    await expectNoAxeViolations(container);
    await user.type(field(), "b");
    await waitFor(() => expect(isOpen()).toBe(true));
    await expectNoAxeViolations(document.body);
  });
});
