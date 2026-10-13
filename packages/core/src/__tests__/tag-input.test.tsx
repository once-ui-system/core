import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TagInput } from "../components/TagInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * TagInput is controlled: `value` is the tag list and every change goes
 * through `onChange`. Enter or a comma commits the trimmed text as a tag and
 * clears the field; blank text commits nothing; each tag has a remove button.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const ControlledTagInput = ({
  initial = [],
  onChange,
  ...props
}: { initial?: string[] } & Partial<React.ComponentProps<typeof TagInput>>) => {
  const [tags, setTags] = useState(initial);
  return (
    <TagInput
      id="tags"
      label="Tags"
      value={tags}
      onChange={(next) => {
        setTags(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
};

const field = () => screen.getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

describe("TagInput", () => {
  it("renders a labelled text field and the current tags", () => {
    render(<ControlledTagInput initial={["react", "vue"]} />, { wrapper });
    expect(field()).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("vue")).toBeInTheDocument();
  });

  it("commits the trimmed text as a tag on Enter and clears the field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTagInput initial={["react"]} onChange={onChange} />, { wrapper });

    await user.type(field(), "  svelte  {Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["react", "svelte"]);
    expect(field().value).toBe("");
    expect(screen.getByText("svelte")).toBeInTheDocument();
  });

  it("commits on a comma, which never reaches the field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTagInput onChange={onChange} />, { wrapper });

    await user.type(field(), "solid,qwik,");
    expect(onChange).toHaveBeenNthCalledWith(1, ["solid"]);
    expect(onChange).toHaveBeenNthCalledWith(2, ["solid", "qwik"]);
    expect(field().value).toBe("");
  });

  it("commits nothing for blank text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTagInput onChange={onChange} />, { wrapper });

    await user.type(field(), "   {Enter},");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not submit the surrounding form on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ControlledTagInput />
      </form>,
      { wrapper },
    );
    await user.type(field(), "astro{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("removes the tag whose remove button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTagInput initial={["react", "vue", "svelte"]} onChange={onChange} />, {
      wrapper,
    });

    expect(screen.getAllByRole("button", { name: /^Remove tag / })).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Remove tag vue" }));
    expect(onChange).toHaveBeenLastCalledWith(["react", "svelte"]);
    expect(screen.queryByText("vue")).toBeNull();
  });

  it("only changes through onChange: without a state update the tags stay as given", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput id="tags" label="Tags" value={["react"]} onChange={onChange} />, {
      wrapper,
    });
    await user.type(field(), "vue{Enter}");
    expect(onChange).toHaveBeenCalledWith(["react", "vue"]);
    expect(screen.queryByText("vue")).toBeNull();
  });

  it("disables the field", () => {
    render(<ControlledTagInput disabled />, { wrapper });
    expect(field()).toBeDisabled();
  });

  it("forwards its ref to the text field", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TagInput ref={ref} id="tags" label="Tags" value={[]} onChange={vi.fn()} />, {
      wrapper,
    });
    expect(ref.current).toBe(field());
  });

  // Each tag's `aria-label="Remove tag …"` used to be spread onto the Chip's
  // role="button" root, which does nothing when pressed, while the button that
  // removes the tag was named by its tooltip, "Remove", the same for every tag.
  it("names each remove button after its tag", () => {
    render(<ControlledTagInput initial={["react", "vue"]} />, { wrapper });
    expect(screen.getByRole("button", { name: "Remove tag vue" }).tagName).toBe("BUTTON");
    expect(screen.getByRole("button", { name: "Remove tag react" }).tagName).toBe("BUTTON");
    expect(screen.queryByRole("button", { name: "Remove" })).toBeNull();
  });

  // The field used to claim `aria-haspopup="listbox"` and `aria-expanded`, but
  // there is no listbox, and a plain textbox may not carry `aria-expanded`
  // (axe: "aria-allowed-attr"). The tags also inherited Chip's nested remove
  // button ("nested-interactive").
  it("has no axe violations", async () => {
    const { container } = render(<ControlledTagInput initial={["react"]} />, { wrapper });
    await expectNoAxeViolations(container);
  });

  it("does not claim a popup on the field, focused or not", async () => {
    const user = userEvent.setup();
    render(<ControlledTagInput />, { wrapper });
    await user.click(field());
    expect(field()).not.toHaveAttribute("aria-haspopup");
    expect(field()).not.toHaveAttribute("aria-expanded");
  });
});
