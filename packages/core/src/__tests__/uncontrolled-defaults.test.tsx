import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { RadioButton } from "../components/RadioButton";
import { Switch } from "../components/Switch";
import { TagInput } from "../components/TagInput";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const formValues = (container: HTMLElement, name: string) =>
  new FormData(container.querySelector("form") as HTMLFormElement).getAll(name);

/**
 * Switch required `checked` and `onCheckedChange`, and TagInput required `value` and
 * `onChange`, so a settings form that only reads the values on submit still
 * had to hold state for every control. Each now takes a starting value and
 * keeps its own state when the controlled prop is left out.
 */
describe("Switch defaultChecked", () => {
  it("starts from defaultChecked and flips on its own", async () => {
    const user = userEvent.setup();
    render(<Switch label="Wi-Fi" defaultChecked />, { wrapper: wrap });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control).toBeChecked();
    await user.click(control);
    expect(control).not.toBeChecked();
    await user.keyboard(" ");
    expect(control).toBeChecked();
  });

  it("starts off when given nothing", () => {
    render(<Switch label="Wi-Fi" />, { wrapper: wrap });
    expect(screen.getByRole("switch", { name: "Wi-Fi" })).not.toBeChecked();
  });

  it("still reports each change to onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Wi-Fi" defaultChecked onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByText("Wi-Fi"));
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("switch", { name: "Wi-Fi" })).not.toBeChecked();
  });

  it("submits its current state with a form", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Switch label="Newsletter" name="newsletter" value="yes" />
      </form>,
      { wrapper: wrap },
    );

    expect(formValues(container, "newsletter")).toEqual([]);
    await user.click(screen.getByRole("switch", { name: "Newsletter" }));
    expect(formValues(container, "newsletter")).toEqual(["yes"]);
  });

  it("ignores defaultChecked once checked is set", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch label="Wi-Fi" checked={false} defaultChecked onCheckedChange={onCheckedChange} />,
      {
        wrapper: wrap,
      },
    );

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control).not.toBeChecked();
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control).not.toBeChecked();
  });
});

describe("Checkbox and RadioButton defaultChecked", () => {
  it("Checkbox starts ticked and keeps its own state while reporting it", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Remember me" defaultChecked onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });

    const checkbox = screen.getByRole("checkbox", { name: "Remember me" });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(checkbox).toBeChecked();
  });

  it("Checkbox submits its starting state with a form", () => {
    const { container } = render(
      <form>
        <Checkbox label="Remember me" name="remember" value="1" defaultChecked />
      </form>,
      { wrapper: wrap },
    );
    expect(formValues(container, "remember")).toEqual(["1"]);
  });

  it("a controlled Checkbox stays where checked puts it", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Locked" checked onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });

    const checkbox = screen.getByRole("checkbox", { name: "Locked" });
    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(checkbox).toBeChecked();
  });

  it("RadioButton starts chosen from defaultChecked", () => {
    render(<RadioButton label="Monthly" defaultChecked />, { wrapper: wrap });
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
  });
});

describe("TagInput defaultValue", () => {
  const field = () => screen.getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

  it("starts from defaultValue and keeps its own list", async () => {
    const user = userEvent.setup();
    render(<TagInput id="tags" label="Tags" defaultValue={["react"]} />, { wrapper: wrap });

    expect(screen.getByText("react")).toBeInTheDocument();
    await user.type(field(), "svelte{Enter}");
    expect(screen.getByText("svelte")).toBeInTheDocument();
    // The first remove button belongs to the first tag. Matched by element
    // rather than name: Chip's naming of it is being reworked separately.
    const [removeReact] = screen.getAllByRole("button").filter((el) => el.tagName === "BUTTON");
    await user.click(removeReact);
    expect(screen.queryByText("react")).not.toBeInTheDocument();
    expect(screen.getByText("svelte")).toBeInTheDocument();
  });

  it("reports each change to onChange while uncontrolled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput id="tags" label="Tags" defaultValue={["react"]} onValueChange={onChange} />, {
      wrapper: wrap,
    });

    await user.type(field(), "vue{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["react", "vue"]);
  });

  it("does not pass the tag list to the text field", () => {
    render(<TagInput id="tags" label="Tags" defaultValue={["react"]} />, { wrapper: wrap });
    expect(field().value).toBe("");
  });

  it("ignores defaultValue once value is set", () => {
    render(<TagInput id="tags" label="Tags" value={["vue"]} defaultValue={["react"]} />, {
      wrapper: wrap,
    });
    expect(screen.getByText("vue")).toBeInTheDocument();
    expect(screen.queryByText("react")).not.toBeInTheDocument();
  });
});
