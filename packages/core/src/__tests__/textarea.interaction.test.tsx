import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Textarea is Input's multi-line sibling: the same floating label, error line,
 * description and character count, plus auto-growing height. What it owns:
 * the label names it, the description and error are read with it, Enter makes
 * a new line rather than submitting, and it works controlled and uncontrolled.
 */
describe("Textarea: rendering", () => {
  it("renders a multi-line text field named by its label", async () => {
    const { container } = render(<Textarea id="bio" label="Bio" />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Bio" });
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("aria-invalid", "false");
    await expectNoAxeViolations(container);
  });

  it("forwards its ref to the native textarea, as an object or a function", () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { unmount } = render(<Textarea id="bio" label="Bio" ref={ref} />, { wrapper: wrap });
    expect(ref.current).toBe(screen.getByRole("textbox"));
    unmount();

    let node: HTMLTextAreaElement | null = null;
    render(
      <Textarea
        id="bio"
        label="Bio"
        ref={(el) => {
          node = el;
        }}
      />,
      { wrapper: wrap },
    );
    expect(node).toBe(screen.getByRole("textbox"));
  });

  it("is described by its description", async () => {
    const { container } = render(
      <Textarea id="bio" label="Bio" description="Shown on your profile" />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("textbox", { name: "Bio" })).toHaveAccessibleDescription(
      "Shown on your profile",
    );
    await expectNoAxeViolations(container);
  });

  it("is invalid and described by its error, before the description", async () => {
    const { container } = render(
      <Textarea id="bio" label="Bio" error errorMessage="Too short" description="Min 10 chars" />,
      { wrapper: wrap },
    );
    const field = screen.getByRole("textbox", { name: "Bio" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Too short Min 10 chars");
    await expectNoAxeViolations(container);
  });
});

describe("Textarea: typing", () => {
  it("is uncontrolled from defaultValue, and Enter adds a line", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea id="bio" label="Bio" defaultValue="Hi" onChange={onChange} />, {
      wrapper: wrap,
    });
    const field = screen.getByRole("textbox", { name: "Bio" }) as HTMLTextAreaElement;
    await user.type(field, "{Enter}there");
    expect(field.value).toBe("Hi\nthere");
    expect(onChange).toHaveBeenCalledTimes(6);
  });

  it("does not submit the surrounding form on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Textarea id="bio" label="Bio" />
      </form>,
      { wrapper: wrap },
    );
    await user.type(screen.getByRole("textbox", { name: "Bio" }), "a{Enter}b");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("is controlled: follows its parent's state", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState("");
      return (
        <>
          <Textarea id="bio" label="Bio" value={value} onChange={(e) => setValue(e.target.value)} />
          <output>{value.length}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.type(screen.getByRole("textbox", { name: "Bio" }), "hello");
    expect(screen.getByRole("status")).toHaveTextContent("5");
  });

  it("keeps a controlled value until the parent changes it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea id="bio" label="Bio" value="fixed" onChange={onChange} />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Bio" }) as HTMLTextAreaElement;
    await user.type(field, "x");
    expect(onChange).toHaveBeenCalled();
    expect(field.value).toBe("fixed");
  });

  it("calls the caller's focus and blur handlers and is reachable with Tab", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Textarea id="bio" label="Bio" onFocus={onFocus} onBlur={onBlur} />, {
      wrapper: wrap,
    });
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Bio" })).toHaveFocus();
    await user.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("is skipped by Tab and takes no typing while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Textarea id="bio" label="Bio" disabled onChange={onChange} />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    const field = screen.getByRole("textbox", { name: "Bio" });
    expect(field).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.type(field, "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("submits its value with a form", () => {
    const { container } = render(
      <form>
        <Textarea id="bio" name="bio" label="Bio" defaultValue={"one\ntwo"} />
      </form>,
      { wrapper: wrap },
    );
    expect(new FormData(container.querySelector("form") as HTMLFormElement).get("bio")).toBe(
      "one\ntwo",
    );
  });
});

describe("Textarea: validate", () => {
  it("shows the validation message a second after typing, and clears it once valid", () => {
    vi.useFakeTimers();
    const validate = (value: React.ReactNode) =>
      String(value).length >= 5 ? null : "At least 5 characters";
    render(<Textarea id="bio" label="Bio" validate={validate} />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Bio" });

    fireEvent.change(field, { target: { value: "abc" } });
    expect(screen.queryByText("At least 5 characters")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("At least 5 characters");

    fireEvent.change(field, { target: { value: "abcdef" } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("At least 5 characters")).not.toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "false");
  });
});

/** The count read `value` only, so uncontrolled it never moved. */
describe("Textarea: characterCount", () => {
  it("counts down on a controlled field", () => {
    render(
      <Textarea
        id="bio"
        label="Bio"
        characterCount
        maxLength={100}
        value="Hello"
        onChange={() => {}}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("counts down as an uncontrolled field is typed in", async () => {
    const user = userEvent.setup();
    render(<Textarea id="bio" label="Bio" characterCount maxLength={50} />, { wrapper: wrap });
    expect(screen.getByText("50")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Bio" }), "abcd");
    expect(screen.getByText("46")).toBeInTheDocument();
  });
});
