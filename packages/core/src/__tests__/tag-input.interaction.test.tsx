import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TagInput } from "../components/TagInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const field = () => screen.getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

/**
 * TagInput end to end: tags are added with Enter or a comma and removed with
 * their own buttons, from the keyboard alone; it keeps its own list or drives
 * a parent's; and a caller's onKeyDown still sees the keys without taking
 * Enter away from the field.
 */
describe("TagInput: interaction", () => {
  it("adds and removes tags from the keyboard alone", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput id="tags" label="Tags" onValueChange={onChange} />, { wrapper: wrap });
    await user.tab();
    expect(field()).toHaveFocus();
    await user.keyboard("react{Enter}vue,svelte{Enter}");
    expect(onChange.mock.calls.map(([tags]) => tags)).toEqual([
      ["react"],
      ["react", "vue"],
      ["react", "vue", "svelte"],
    ]);
    expect(field().value).toBe("");

    const remove = screen.getByRole("button", { name: "Remove tag vue" });
    remove.focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["react", "svelte"]);
    expect(screen.queryByRole("button", { name: "Remove tag vue" })).not.toBeInTheDocument();
  });

  it("removes the right one of two identical tags", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TagInput id="tags" label="Tags" defaultValue={["a", "b", "a"]} onValueChange={onChange} />,
      {
        wrapper: wrap,
      },
    );
    const removes = screen.getAllByRole("button", { name: "Remove tag a" });
    await user.click(removes[1]);
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("drives a parent's list as a controlled field", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [tags, setTags] = useState<string[]>(["one"]);
      return (
        <>
          <TagInput id="tags" label="Tags" value={tags} onValueChange={setTags} />
          <output>{tags.join("|")}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.type(field(), "two{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("one|two");
    await user.click(screen.getByRole("button", { name: "Remove tag one" }));
    expect(screen.getByRole("status")).toHaveTextContent("two");
  });

  // The caller's props were spread over the field's own handler, so passing
  // `onKeyDown` (to log, or to handle Escape) silently stopped Enter adding tags.
  it("still adds tags with a caller's onKeyDown, which sees every key", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onChange = vi.fn();
    render(<TagInput id="tags" label="Tags" onKeyDown={onKeyDown} onValueChange={onChange} />, {
      wrapper: wrap,
    });
    await user.type(field(), "x{Enter}");
    expect(onChange).toHaveBeenCalledWith(["x"]);
    expect(onKeyDown.mock.calls.map(([event]) => event.key)).toEqual(["x", "Enter"]);
  });

  it("lets a caller's onKeyDown cancel the commit with preventDefault", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TagInput
        id="tags"
        label="Tags"
        onValueChange={onChange}
        onKeyDown={(event) => {
          if (event.key === ",") event.preventDefault();
        }}
      />,
      { wrapper: wrap },
    );
    await user.type(field(), "a,b{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["ab"]);
  });

  it("keeps typing text in the field while it is not committed", async () => {
    const user = userEvent.setup();
    render(<TagInput id="tags" label="Tags" />, { wrapper: wrap });
    await user.type(field(), "draft");
    expect(field().value).toBe("draft");
    await user.tab();
    expect(field().value).toBe("draft");
  });

  it("has no axe violations with tags", async () => {
    const { container } = render(
      <TagInput id="tags" label="Tags" defaultValue={["design", "code"]} />,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);
  });
});
