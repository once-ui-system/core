import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorInput } from "../components/ColorInput";
import { DateInput } from "../components/DateInput";
import { DatePicker } from "../components/DatePicker";
import { Input } from "../components/Input";
import { NumberInput } from "../components/NumberInput";
import { OTPInput } from "../components/OTPInput";
import { Select } from "../components/Select";
import { TagInput } from "../components/TagInput";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * 3.0's one value contract for fields and pickers: state `X` is `X` /
 * `defaultX` / `onXChange(next)`, controlled only when `X` is set, and
 * `onChange` is the native event of the real <input>, so a form library's
 * `register()` spread works on every field that has one.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);

/** A native change event, as `register()` would read it. */
const nativeEvent = expect.objectContaining({ target: expect.any(HTMLInputElement) });

afterEach(() => {
  vi.useRealTimers();
});

describe("Input, Textarea and PasswordInput onValueChange", () => {
  it("Input reports the text after the native onChange", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const onChange = vi.fn(() => calls.push("native"));
    const onValueChange = vi.fn(() => calls.push("value"));
    render(<Input id="n" label="Name" onChange={onChange} onValueChange={onValueChange} />, {
      wrapper,
    });

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Al");
    expect(onChange).toHaveBeenLastCalledWith(nativeEvent);
    expect(onValueChange).toHaveBeenLastCalledWith("Al");
    expect(calls).toEqual(["native", "value", "native", "value"]);
  });

  it("Textarea reports the text", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Textarea id="bio" label="Bio" onValueChange={onValueChange} />, { wrapper });

    await user.type(screen.getByRole("textbox", { name: "Bio" }), "Hi");
    expect(onValueChange).toHaveBeenLastCalledWith("Hi");
  });

  it("PasswordInput reports the text", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Input type="password" id="pw" label="Password" onValueChange={onValueChange} />, {
      wrapper,
    });

    await user.type(screen.getByLabelText("Password"), "s3cret");
    expect(onValueChange).toHaveBeenLastCalledWith("s3cret");
  });

  it("validates an uncontrolled Input", () => {
    vi.useFakeTimers();
    render(
      <Input
        id="email"
        label="Email"
        defaultValue="x"
        validate={(value) => (String(value).includes("@") ? null : "Enter a valid email")}
      />,
      { wrapper },
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "a@b.co" },
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();
  });

  it("validates an uncontrolled Textarea", () => {
    vi.useFakeTimers();
    render(
      <Textarea
        id="bio"
        label="Bio"
        validate={(value) => (String(value).length > 3 ? "Too long" : null)}
      />,
      { wrapper },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
      target: { value: "abcdef" },
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("counts the characters of an uncontrolled Input", async () => {
    const user = userEvent.setup();
    render(<Input id="n" label="Name" maxLength={20} characterCount defaultValue="abc" />, {
      wrapper,
    });
    expect(screen.getByText("17")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "de");
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});

describe("NumberInput", () => {
  it("starts from defaultValue and keeps its own number", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput id="n" label="Amount" defaultValue={3} onValueChange={onValueChange} />, {
      wrapper,
    });
    const field = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(field.value).toBe("3");

    await user.click(screen.getByRole("button", { name: "Increment value" }));
    expect(field.value).toBe("4");
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("forwards the native onChange to the input, and reports the number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <NumberInput id="n" label="Amount" onChange={onChange} onValueChange={onValueChange} />,
      { wrapper },
    );

    await user.type(screen.getByRole("spinbutton"), "7");
    expect(onChange).toHaveBeenCalledWith(nativeEvent);
    expect(onValueChange).toHaveBeenLastCalledWith(7);
  });
});

describe("ColorInput", () => {
  it("starts from defaultValue, uncontrolled", () => {
    render(<ColorInput id="c" label="Colour" defaultValue="#336699" />, { wrapper });
    expect((screen.getByLabelText("Colour") as HTMLInputElement).value).toBe("#336699");
    expect(screen.getByText("#336699")).toBeInTheDocument();
  });

  it("keeps a pick of its own and reports it after the native onChange", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<ColorInput id="c" label="Colour" onChange={onChange} onValueChange={onValueChange} />, {
      wrapper,
    });
    const field = screen.getByLabelText("Colour") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "#ff8800" } });

    expect(onChange).toHaveBeenCalledWith(nativeEvent);
    expect(onValueChange).toHaveBeenLastCalledWith("#ff8800");
    expect(field.value).toBe("#ff8800");
  });
});

describe("TagInput", () => {
  it("forwards the native onChange of its text field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<TagInput id="t" label="Tags" onChange={onChange} onValueChange={onValueChange} />, {
      wrapper,
    });

    await user.type(screen.getByRole("textbox", { name: "Tags" }), "vue{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(nativeEvent);
    expect(onValueChange).toHaveBeenLastCalledWith(["vue"]);
  });

  it("runs the caller's onKeyDown and still adds the tag", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onValueChange = vi.fn();
    render(<TagInput id="t" label="Tags" onKeyDown={onKeyDown} onValueChange={onValueChange} />, {
      wrapper,
    });

    await user.type(screen.getByRole("textbox", { name: "Tags" }), "go{Enter}");
    expect(onKeyDown).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith(["go"]);
  });
});

describe("DateInput", () => {
  const field = () => screen.getByRole("combobox", { name: "Start" }) as HTMLInputElement;

  it("shows defaultValue, uncontrolled", () => {
    render(<DateInput id="d" label="Start" defaultValue={jan(5)} />, { wrapper });
    expect(field().value).toBe("Jan 5, 2026");
  });

  it("keeps a picked date of its own", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateInput id="d" label="Start" defaultValue={jan(5)} onValueChange={onValueChange} />, {
      wrapper,
    });
    await user.click(field());
    const day = await waitFor(() => {
      const button = document.querySelector<HTMLButtonElement>(
        `button[data-value="${jan(9).toISOString()}"]`,
      );
      if (!button) throw new Error("no day");
      return button;
    });
    await user.click(day);
    expect(onValueChange).toHaveBeenLastCalledWith(jan(9));
    expect(field().value).toBe("Jan 9, 2026");
  });

  it("clears when a controlled value is cleared from outside", () => {
    const { rerender } = render(<DateInput id="d" label="Start" value={jan(5)} />, { wrapper });
    expect(field().value).toBe("Jan 5, 2026");
    rerender(<DateInput id="d" label="Start" value={undefined} />);
    expect(field().value).toBe("");
  });

  it("opens from defaultOpen and reports open changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DateInput id="d" label="Start" defaultOpen onOpenChange={onOpenChange} />, {
      wrapper,
    });
    expect(field()).toHaveAttribute("aria-expanded", "true");

    act(() => field().focus());
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("stays where a controlled open puts it", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DateInput id="d" label="Start" open={false} onOpenChange={onOpenChange} />, {
      wrapper,
    });
    await user.click(field());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("forwards the native onChange to the field", () => {
    const onChange = vi.fn();
    render(<DateInput id="d" label="Start" onChange={onChange} />, { wrapper });
    fireEvent.change(field(), { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledWith(nativeEvent);
  });
});

describe("DateInput range", () => {
  it("shows defaultValue and opens from defaultOpen", () => {
    render(
      <DateInput
        range
        id="r"
        startLabel="From"
        endLabel="To"
        defaultValue={{ startDate: jan(5), endDate: jan(9) }}
        defaultOpen
      />,
      { wrapper },
    );
    const from = screen.getByRole("combobox", { name: "From" }) as HTMLInputElement;
    const to = screen.getByRole("combobox", { name: "To" }) as HTMLInputElement;
    expect(from.value).toBe("Jan 5, 2026");
    expect(to.value).toBe("Jan 9, 2026");
    expect(from).toHaveAttribute("aria-expanded", "true");
  });

  it("reports open changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DateInput range id="r" startLabel="From" endLabel="To" onOpenChange={onOpenChange} />, {
      wrapper,
    });
    await user.click(screen.getByRole("combobox", { name: "From" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });
});

describe("DatePicker and DatePicker range defaultValue", () => {
  const selectedDays = () =>
    Array.from(document.querySelectorAll('[role="gridcell"][aria-selected="true"]')).map(
      (cell) => cell.textContent,
    );

  it("DatePicker starts on defaultValue's month with that day selected", async () => {
    render(<DatePicker defaultValue={jan(12)} />, { wrapper });
    await screen.findByRole("grid", { name: "January 2026" });
    expect(selectedDays()).toEqual(["12"]);
  });

  it("DatePicker keeps a pick of its own", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue={jan(12)} onValueChange={onValueChange} />, { wrapper });
    const day = await waitFor(() => {
      const button = document.querySelector<HTMLButtonElement>(
        `button[data-value="${jan(20).toISOString()}"]`,
      );
      if (!button) throw new Error("no day");
      return button;
    });
    await user.click(day);
    expect(onValueChange).toHaveBeenLastCalledWith(jan(20));
    await waitFor(() => expect(selectedDays()).toEqual(["20"]));
  });

  it("DatePicker range starts on defaultValue", async () => {
    render(<DatePicker range defaultValue={{ startDate: jan(5), endDate: undefined }} />, {
      wrapper,
    });
    await screen.findByRole("grid", { name: "January 2026" });
    expect(selectedDays()).toEqual(["5"]);
  });
});

describe("Select", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Bravo" },
  ];
  const field = () => screen.getByRole("combobox", { name: "Pick" }) as HTMLInputElement;

  it("starts from defaultValue and keeps a pick of its own", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        id="s"
        label="Pick"
        options={options}
        defaultValue="a"
        onValueChange={onValueChange}
      />,
      { wrapper },
    );
    expect(field().value).toBe("Alpha");

    await user.click(field());
    await user.click(await screen.findByRole("option", { name: "Bravo" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(field().value).toBe("Bravo");
  });

  it("starts a multiple Select from defaultValue", () => {
    render(<Select id="s" label="Pick" options={options} multiple defaultValue={["a", "b"]} />, {
      wrapper,
    });
    expect(field().value).toBe("2 options selected");
  });

  it("opens from defaultOpen and reports open changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Select id="s" label="Pick" options={options} defaultOpen onOpenChange={onOpenChange} />,
      { wrapper },
    );
    expect(field()).toHaveAttribute("aria-expanded", "true");
    await user.click(await screen.findByRole("option", { name: "Alpha" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("follows a controlled open", () => {
    const Controlled = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
          <Select id="s" label="Pick" options={options} open={open} onOpenChange={setOpen} />
        </>
      );
    };
    render(<Controlled />, { wrapper });
    expect(field()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("OTPInput", () => {
  const digit = (n: number) =>
    screen.getByRole("textbox", { name: `OTP digit ${n} of 4` }) as HTMLInputElement;

  it("starts from defaultValue and reports each change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<OTPInput defaultValue="12" onValueChange={onValueChange} />, { wrapper });
    expect([1, 2, 3, 4].map((n) => digit(n).value)).toEqual(["1", "2", "", ""]);

    await user.click(digit(3));
    await user.keyboard("3");
    expect(onValueChange).toHaveBeenLastCalledWith("123");
  });

  it("follows a controlled value", () => {
    const { rerender } = render(<OTPInput value="1234" />, { wrapper });
    expect(digit(4).value).toBe("4");
    rerender(<OTPInput value="" />);
    expect([1, 2, 3, 4].map((n) => digit(n).value)).toEqual(["", "", "", ""]);
  });

  it("puts className and div props on the root, not on every digit", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <OTPInput className="mine" data-testid="otp" onKeyDown={onKeyDown} onComplete={onComplete} />,
      { wrapper },
    );
    const root = screen.getByTestId("otp");
    expect(root).toHaveClass("mine");
    expect(container.querySelectorAll('[data-testid="otp"]')).toHaveLength(1);

    await user.click(digit(1));
    await user.keyboard("1234");
    // The caller's handler hears the keys (bubbled to the root) without
    // replacing the digits' own.
    expect(onKeyDown).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith("1234");
  });
});
