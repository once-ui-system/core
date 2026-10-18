import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "../components/IconButton";
import { Tooltip } from "../components/Tooltip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

const tooltip = () => screen.queryByRole("tooltip");

/**
 * Tooltip in the place it is used most: an IconButton's `tooltip`. A plain
 * text tooltip names the button, and the bubble comes up on hover and on
 * keyboard focus and goes on unhover, blur and Escape, without the button
 * losing focus or its click.
 */
describe("Tooltip on an IconButton", () => {
  it("names the button with its text, and shows nothing until asked", () => {
    render(<IconButton icon="close" tooltip="Close panel" onClick={() => {}} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("button", { name: "Close panel" })).toBeInTheDocument();
    expect(tooltip()).toBeNull();
  });

  it("shows on hover and hides on unhover", async () => {
    const user = userEvent.setup();
    render(<IconButton icon="close" tooltip="Close panel" onClick={() => {}} />, {
      wrapper: wrap,
    });

    await user.hover(screen.getByRole("button", { name: "Close panel" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Close panel");
    await user.unhover(screen.getByRole("button", { name: "Close panel" }));
    await waitFor(() => expect(tooltip()).toBeNull());
  });

  it("shows on keyboard focus, and Escape hides it without moving focus", async () => {
    const user = userEvent.setup();
    render(
      <>
        <IconButton
          icon="close"
          tooltip="Close panel"
          tooltipPosition="bottom"
          onClick={() => {}}
        />
        <button type="button">Next</button>
      </>,
      { wrapper: wrap },
    );

    await user.tab();
    const button = screen.getByRole("button", { name: "Close panel" });
    expect(button).toHaveFocus();
    await screen.findByRole("tooltip");
    await expectNoAxeViolations(document.body);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(tooltip()).toBeNull());
    expect(button).toHaveFocus();

    await user.tab({ shift: true });
    await user.tab();
    await screen.findByRole("tooltip");
    await user.tab();
    await waitFor(() => expect(tooltip()).toBeNull());
  });

  it("still clicks, from the pointer and the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="close" tooltip="Close panel" onClick={onClick} />, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("button", { name: "Close panel" }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("lets an explicit aria-label name the button, with the tooltip as its bubble only", async () => {
    const user = userEvent.setup();
    render(
      <IconButton icon="close" aria-label="Dismiss" tooltip="Close panel" onClick={() => {}} />,
      { wrapper: wrap },
    );
    const button = screen.getByRole("button", { name: "Dismiss" });
    await user.hover(button);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Close panel");
  });
});

describe("Tooltip props", () => {
  it("renders a node label with its icons, and passes layout props through", async () => {
    const { container } = render(
      <Tooltip
        label={<strong>Bold</strong>}
        prefixIcon="info"
        suffixIcon="check"
        id="tip"
        data-testid="tip"
      />,
      { wrapper: wrap },
    );
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveAttribute("id", "tip");
    expect(tip).toHaveAttribute("data-testid", "tip");
    expect(tip.querySelector("strong")).toHaveTextContent("Bold");
    expect(tip.querySelectorAll("svg")).toHaveLength(2);
    await expectNoAxeViolations(container);
  });
});
