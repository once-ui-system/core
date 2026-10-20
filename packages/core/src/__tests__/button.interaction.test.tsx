import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Button renders a `<button>` for an action, a link for an `href`, and a plain
 * element when it is neither. The button form answers to click, Enter and
 * Space; disabled stops all three.
 */
describe("Button: element and name", () => {
  it("renders a named button for an onClick and passes axe", async () => {
    const { container } = render(<Button onClick={() => {}}>Save</Button>, { wrapper });
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    await expectNoAxeViolations(container);
  });

  it("takes its text from `label` over children", () => {
    render(
      <Button label="From label" onClick={() => {}}>
        From children
      </Button>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "From label" })).toBeInTheDocument();
    expect(screen.queryByText("From children")).not.toBeInTheDocument();
  });

  it("renders a type=button or type=submit button without a handler", () => {
    render(
      <>
        <Button type="button">Plain</Button>
        <Button type="submit">Send</Button>
      </>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Plain" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("renders an internal link for an href, an external one in a new tab", async () => {
    const { container } = render(
      <>
        <Button href="/docs">Docs</Button>
        <Button href="https://example.com">Site</Button>
      </>,
      { wrapper },
    );
    const internal = screen.getByRole("link", { name: "Docs" });
    expect(internal).toHaveAttribute("href", "/docs");
    expect(internal).not.toHaveAttribute("target");
    const external = screen.getByRole("link", { name: "Site" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noreferrer");
    await expectNoAxeViolations(container);
  });

  it("drops a javascript: href instead of rendering it", () => {
    // biome-ignore lint/security/noScriptUrl: the unsafe URL is what this test feeds in.
    render(<Button href="javascript:alert(1)">Bad</Button>, { wrapper });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Bad")).toBeInTheDocument();
  });

  it("renders neither a button nor a link with no handler, href or type", () => {
    render(<Button>Decoration</Button>, { wrapper });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("forwards the ref and native attributes", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <Button ref={ref} onClick={() => {}} aria-describedby="hint" data-testid="b">
        Save
      </Button>,
      { wrapper },
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Save" }));
    expect(ref.current).toHaveAttribute("aria-describedby", "hint");
  });

  it("shows a spinner instead of the prefix icon while loading", () => {
    const { container, rerender } = render(
      <Button prefixIcon="check" onClick={() => {}}>
        Save
      </Button>,
      { wrapper },
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    rerender(
      <Button prefixIcon="check" loading onClick={() => {}}>
        Save
      </Button>,
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
  });
});

describe("Button: interaction", () => {
  it("fires onClick from the mouse, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>, { wrapper });
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.tab();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
    expect(onClick.mock.calls[0][0]).toHaveProperty("type", "click");
  });

  it("is in the Tab order", async () => {
    const user = userEvent.setup();
    render(<Button onClick={() => {}}>Save</Button>, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("ignores clicks and keys when disabled, and says so", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
      { wrapper },
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    await user.click(button);
    await user.tab();
    expect(button).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("runs onClick on a link button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Button href="/docs" onClick={onClick}>
        Docs
      </Button>,
      { wrapper },
    );
    await user.click(screen.getByRole("link", { name: "Docs" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("submits its form when type=submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
