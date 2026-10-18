import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "../components/Input";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Input is a native text field with a floating label, a description, an error
 * line and an optional live character count. What it owns: the label names
 * the field, the description and the error are read out with it, typing is
 * reported, and it works both controlled and uncontrolled.
 */
describe("Input: rendering", () => {
  it("renders a text field named by its label", async () => {
    const { container } = render(<Input id="name" label="Name" />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Name" });
    expect(field).toHaveAttribute("id", "name");
    expect(field).toHaveAttribute("aria-invalid", "false");
    await expectNoAxeViolations(container);
  });

  it("renders prefix, suffix and placeholder", () => {
    render(
      <Input
        id="price"
        label="Price"
        placeholder="0.00"
        prefix={<span>$</span>}
        suffix={<span>USD</span>}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("textbox", { name: "Price" })).toHaveAttribute("placeholder", "0.00");
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("shows a spinner in place of the suffix while loading", () => {
    render(<Input id="q" label="Search" loading suffix={<span>Go</span>} />, { wrapper: wrap });
    expect(screen.queryByText("Go")).not.toBeInTheDocument();
  });

  it("forwards its ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input id="name" label="Name" ref={ref} />, { wrapper: wrap });
    expect(ref.current).toBe(screen.getByRole("textbox"));
  });

  it("does not leak `span` to the DOM", () => {
    render(<Input id="name" label="Name" span={2} />, { wrapper: wrap });
    expect(screen.getByRole("textbox")).not.toHaveAttribute("span");
  });
});

/**
 * The description used to render under the field with an id that nothing
 * pointed at, so a screen reader never read it with the field.
 */
describe("Input: description and error", () => {
  it("describes the field with its description", async () => {
    const { container } = render(
      <Input id="email" label="Email" description="We never share it" />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription(
      "We never share it",
    );
    await expectNoAxeViolations(container);
  });

  it("reads the caller's description, the error and the description, in that order", () => {
    render(
      <>
        <span id="own">Own note</span>
        <Input
          id="email"
          label="Email"
          aria-describedby="own"
          error
          errorMessage="Required"
          description="Work address"
        />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription(
      "Own note Required Work address",
    );
  });

  it("marks the field invalid with an error message", async () => {
    const { container } = render(
      <Input id="email" label="Email" error errorMessage="Enter an email address" />,
      { wrapper: wrap },
    );
    const field = screen.getByRole("textbox", { name: "Email" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Enter an email address");
    await expectNoAxeViolations(container);
  });
});

describe("Input: typing", () => {
  it("is uncontrolled from defaultValue and reports each keystroke", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input id="name" label="Name" defaultValue="Ada" onChange={onChange} />, {
      wrapper: wrap,
    });
    const field = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    await user.type(field, "!");
    expect(field.value).toBe("Ada!");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as React.ChangeEvent<HTMLInputElement>).target.value).toBe(
      "Ada!",
    );
  });

  it("is controlled: shows `value` until the parent changes it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input id="name" label="Name" value="Ada" onChange={onChange} />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    await user.type(field, "x");
    expect(onChange).toHaveBeenCalled();
    expect(field.value).toBe("Ada");
  });

  it("follows its parent's state", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState("");
      return (
        <>
          <Input id="name" label="Name" value={value} onChange={(e) => setValue(e.target.value)} />
          <output>{value}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Grace");
    expect(screen.getByRole("status")).toHaveTextContent("Grace");
  });

  it("calls the caller's focus and blur handlers", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Input id="name" label="Name" onFocus={onFocus} onBlur={onBlur} />, { wrapper: wrap });
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("is skipped by Tab and takes no typing while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Input id="name" label="Name" disabled onChange={onChange} />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "x");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("submits its value with a form", () => {
    const { container } = render(
      <form>
        <Input id="name" name="name" label="Name" defaultValue="Ada" />
      </form>,
      { wrapper: wrap },
    );
    expect(new FormData(container.querySelector("form") as HTMLFormElement).get("name")).toBe(
      "Ada",
    );
  });
});

describe("Input: validate", () => {
  it("shows the validation message a second after typing, and clears it once valid", async () => {
    vi.useFakeTimers();
    const validate = (value: React.ReactNode) =>
      String(value).includes("@") ? null : "Enter an email address";
    render(<Input id="email" label="Email" validate={validate} />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Email" });

    fireEvent.change(field, { target: { value: "ada" } });
    expect(screen.queryByText("Enter an email address")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Enter an email address")).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Enter an email address");

    fireEvent.change(field, { target: { value: "ada@x.io" } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Enter an email address")).not.toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "false");
  });
});

/**
 * The count read `value` only, so on an uncontrolled field it stayed at
 * `maxLength` whatever was typed.
 */
describe("Input: characterCount", () => {
  it("counts down the characters left on a controlled field", () => {
    render(
      <Input
        id="bio"
        label="Bio"
        characterCount
        maxLength={20}
        value="Hello"
        onChange={() => {}}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("counts down as an uncontrolled field is typed in", async () => {
    const user = userEvent.setup();
    render(<Input id="bio" label="Bio" characterCount maxLength={20} defaultValue="Hi" />, {
      wrapper: wrap,
    });
    expect(screen.getByText("18")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Bio" }), "!!!");
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders no count without maxLength", () => {
    const { container } = render(<Input id="bio" label="Bio" characterCount value="x" readOnly />, {
      wrapper: wrap,
    });
    expect(container.textContent).toBe("Bio");
  });
});
