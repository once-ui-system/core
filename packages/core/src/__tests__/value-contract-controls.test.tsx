import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Accordion } from "../components/Accordion";
import { AccordionGroup } from "../components/AccordionGroup";
import { Checkbox } from "../components/Checkbox";
import { NavGroup } from "../components/NavGroup";
import { Pagination } from "../components/Pagination";
import { RadioButton } from "../components/RadioButton";
import { resetScrollLockState } from "../components/ScrollLock";
import { SegmentedControl } from "../components/SegmentedControl";
import { Slider } from "../components/Slider";
import { Switch } from "../components/Switch";
import { AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Kbar } from "../modules/navigation/Kbar";
import { resetDialogState } from "../test/dialogTestUtils";

/**
 * 3.0's one value contract on controls, groups and disclosure: state `X` is
 * `X` / `defaultX` / `onXChange(next)`, controlled means `X` is set, and
 * `onChange` is only ever the native event of a real `<input>`.
 */

const adapters = { useNavigate: () => vi.fn(), usePathname: () => "/" };
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <AdapterProvider adapters={adapters}>{children}</AdapterProvider>
  </LayoutProvider>
);

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

/**
 * What react-hook-form's `register()` hands a field: a name, a ref, and
 * handlers that read `event.target` (its name and checked state).
 */
const fakeRegister = (name: string) => {
  const seen: { type: string; name: string; checked: boolean }[] = [];
  let node: HTMLInputElement | null = null;
  const handler = (event: { type: string; target: EventTarget }) => {
    const target = event.target as HTMLInputElement;
    seen.push({ type: event.type, name: target.name, checked: target.checked });
  };
  return {
    seen,
    current: () => node,
    props: {
      name,
      ref: (el: HTMLInputElement | null) => {
        node = el;
      },
      onChange: handler,
      onBlur: handler,
    },
  };
};

describe.each([
  ["Checkbox", "checkbox", Checkbox],
  ["Switch", "switch", Switch],
] as const)("%s native input props", (_, role, Control) => {
  it("works with a register()-style spread: name, ref, onChange and onBlur", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("terms");
    render(
      <>
        <Control label="Terms" {...field.props} />
        <button type="button">Next</button>
      </>,
      { wrapper: wrap },
    );

    const control = screen.getByRole(role, { name: "Terms" });
    await user.click(control);
    expect(control).toBeChecked();
    expect(field.current()?.checked).toBe(true);
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(field.seen).toEqual([
      { type: "change", name: "terms", checked: true },
      { type: "blur", name: "terms", checked: true },
    ]);
  });

  it("lands required, form and data attributes on the input", () => {
    const { container } = render(
      <Control label="Terms" required form="signup" data-testid="terms-input" />,
      { wrapper: wrap },
    );
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toBe(screen.getByTestId("terms-input"));
    expect(input.required).toBe(true);
    expect(input.getAttribute("form")).toBe("signup");
  });

  it("starts from defaultChecked and keeps its own state, reporting each change", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Control label="Terms" defaultChecked onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });
    const control = screen.getByRole(role, { name: "Terms" });
    expect(control).toBeChecked();
    await user.click(control);
    expect(control).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("asks again when a controlled parent declined the last change", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Control label="Terms" checked={false} onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });
    const control = screen.getByRole(role, { name: "Terms" });
    await user.click(control);
    await user.click(control);
    expect(onCheckedChange.mock.calls).toEqual([[true], [true]]);
    expect(control).not.toBeChecked();
  });

  it("sends neither handler while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Control label="Terms" disabled onChange={onChange} onCheckedChange={onCheckedChange} />,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole(role, { name: "Terms" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe("RadioButton native input props", () => {
  it("sends the native change event with the radio's name and value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioButton label="Card" name="pay" value="card" onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("radio", { name: "Card" }));
    expect(onChange).toHaveBeenCalledOnce();
    const target = onChange.mock.calls[0][0].target as HTMLInputElement;
    expect([target.name, target.value, target.checked]).toEqual(["pay", "card", true]);
  });

  it("does nothing when picked again, as a native radio", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<RadioButton label="Card" defaultChecked onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });
    const radio = screen.getByRole("radio", { name: "Card" });
    await user.click(radio);
    expect(radio).toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe("Slider", () => {
  it("sends the native event to onChange and the number to onValueChange", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={10}
        onChange={onChange}
        onValueChange={onValueChange}
      />,
      { wrapper: wrap },
    );
    const input = screen.getByRole("slider", { name: "Volume" });
    fireEvent.change(input, { target: { value: "40" } });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(40);
    expect(onChange.mock.calls[0][0].target).toBe(input);
    expect(input).toHaveValue("40");
  });

  it("commits on pointer release and after a key moves the thumb", () => {
    const onValueCommit = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={10} onValueCommit={onValueCommit} />, {
      wrapper: wrap,
    });
    const input = screen.getByRole("slider", { name: "Volume" });
    fireEvent.change(input, { target: { value: "30" } });
    expect(onValueCommit).not.toHaveBeenCalled();
    fireEvent.pointerUp(input);
    expect(onValueCommit).toHaveBeenLastCalledWith(30);
    fireEvent.change(input, { target: { value: "31" } });
    fireEvent.keyUp(input, { key: "ArrowRight" });
    expect(onValueCommit).toHaveBeenLastCalledWith(31);
    fireEvent.keyUp(input, { key: "Tab" });
    expect(onValueCommit).toHaveBeenCalledTimes(2);
  });
});

describe("SegmentedControl", () => {
  const buttons = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("starts from defaultValue without a handler", async () => {
    const user = userEvent.setup();
    render(<SegmentedControl aria-label="Mode" buttons={buttons} defaultValue="b" />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "A" }));
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  });

  it("stays on the controlled value when the parent keeps it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Mode"
        buttons={buttons}
        value="a"
        onValueChange={onValueChange}
      />,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b", expect.anything());
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  });

  it("disables every button with the group's disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Mode"
        buttons={buttons}
        disabled
        onValueChange={onValueChange}
      />,
      { wrapper: wrap },
    );
    for (const tab of screen.getAllByRole("tab")) expect(tab).toBeDisabled();
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Accordion open state", () => {
  const header = () => screen.getByRole("button", { name: "Details" });

  it("starts from defaultOpen", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Accordion title="Details" defaultOpen onOpenChange={onOpenChange}>
        Body
      </Accordion>,
      { wrapper: wrap },
    );
    expect(header()).toHaveAttribute("aria-expanded", "true");
    await user.click(header());
    expect(header()).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("is controlled by open alone, with no handler", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Details" open>
        Body
      </Accordion>,
      { wrapper: wrap },
    );
    await user.click(header());
    expect(header()).toHaveAttribute("aria-expanded", "true");
  });

  it("points its header at its own content", () => {
    render(
      <>
        <Accordion title="Details">Body</Accordion>
        <Accordion title="More">Body</Accordion>
      </>,
      { wrapper: wrap },
    );
    const [a, b] = screen.getAllByRole("button");
    expect(a.getAttribute("aria-controls")).not.toBe(b.getAttribute("aria-controls"));
    expect(document.getElementById(a.getAttribute("aria-controls") as string)).not.toBeNull();
  });
});

describe("AccordionGroup", () => {
  const items = [
    { title: "One", content: "1" },
    { title: "Two", content: "2", defaultOpen: true },
    { title: "Three", content: "3" },
  ];
  const expanded = () =>
    screen.getAllByRole("button").map((button) => button.getAttribute("aria-expanded"));

  it("opens items independently without autoCollapse (they could never open in 2.x)", async () => {
    const user = userEvent.setup();
    render(<AccordionGroup items={items} autoCollapse={false} />, { wrapper: wrap });
    expect(expanded()).toEqual(["false", "true", "false"]);
    await user.click(screen.getByRole("button", { name: "One" }));
    await user.click(screen.getByRole("button", { name: "Three" }));
    expect(expanded()).toEqual(["true", "true", "true"]);
  });

  it("starts on the item marked defaultOpen and keeps one open with autoCollapse", async () => {
    const user = userEvent.setup();
    render(<AccordionGroup items={items} />, { wrapper: wrap });
    expect(expanded()).toEqual(["false", "true", "false"]);
    await user.click(screen.getByRole("button", { name: "One" }));
    expect(expanded()).toEqual(["true", "false", "false"]);
    await user.click(screen.getByRole("button", { name: "One" }));
    expect(expanded()).toEqual(["false", "false", "false"]);
  });
});

describe("NavGroup", () => {
  it("reports the next open state while uncontrolled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <NavGroup label="Settings" defaultOpen onOpenChange={onOpenChange}>
        <span>Billing</span>
      </NavGroup>,
      { wrapper: wrap },
    );
    const header = screen.getByRole("button", { name: "Settings" });
    expect(header).toHaveAttribute("aria-expanded", "true");
    await user.click(header);
    await user.click(header);
    expect(onOpenChange.mock.calls).toEqual([[false], [true]]);
  });
});

describe("Pagination", () => {
  it("reports the page through onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination total={5} defaultPage={2} onPageChange={onPageChange} />, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(3);
  });
});

describe("Kbar open state", () => {
  const items = [
    { id: "home", name: "Home", section: "Go", shortcut: [], keywords: "", href: "/" },
  ];

  it("opens from defaultOpen and reports the trigger and a dismissal", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Kbar items={items} defaultOpen onOpenChange={onOpenChange}>
        <span>Search</span>
      </Kbar>,
      { wrapper: wrap },
    );
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });

  it("follows a controlled open", async () => {
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Show
          </button>
          <Kbar items={items} open={open} onOpenChange={setOpen}>
            <span>Search</span>
          </Kbar>
        </>
      );
    };
    const user = userEvent.setup();
    render(<Host />, { wrapper: wrap });
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
  });
});
