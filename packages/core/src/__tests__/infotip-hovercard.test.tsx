import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { HoverCard } from "../components/HoverCard";
import { Tooltip } from "../components/Tooltip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const tipText = "Shown on invoices and receipts.";

/**
 * Hover content reachable and dismissible from the keyboard (ROADMAP W3,
 * WCAG 2.1.1 and 1.4.13): the info icon of a childless Tooltip (2.x InfoTip) takes focus and opens its tip, and
 * Escape closes any HoverCard without moving the pointer or focus.
 */
describe("Tooltip with content and no children (2.x InfoTip): accessibility", () => {
  it("is a named tab stop whose tip opens on focus and describes it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Tooltip content={tipText} />, { wrapper: wrap });

    await user.tab();
    const trigger = screen.getByRole("button", { name: "More information" });
    expect(trigger).toHaveFocus();

    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent(tipText);
    expect(trigger).toHaveAccessibleDescription(tipText);
    await expectNoAxeViolations(container);
    await expectNoAxeViolations(tip);
  });

  it("takes its name from aria-label", () => {
    render(<Tooltip content={tipText} aria-label="About billing names" />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "About billing names" })).toBeInTheDocument();
  });

  it("closes on Escape while focus stays on the icon, and on blur", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content={tipText} />
        <button type="button">Next</button>
      </>,
      { wrapper: wrap },
    );

    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText(tipText)).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "More information" })).toHaveFocus();

    await user.tab({ shift: true });
    await user.tab();
    await screen.findByRole("tooltip");
    await user.tab();
    await waitFor(() => expect(screen.queryByText(tipText)).not.toBeInTheDocument());
  });
});

describe("HoverCard", () => {
  it("dismisses on Escape while still hovered, and opens again on the next hover", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>}>
        <span>Card body</span>
      </HoverCard>,
      { wrapper: wrap },
    );

    const trigger = screen.getByText("Hover me");
    await user.hover(trigger);
    expect(await screen.findByText("Card body")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Card body")).not.toBeInTheDocument());

    await user.unhover(trigger);
    await user.hover(trigger);
    expect(await screen.findByText("Card body")).toBeInTheDocument();
  });
});
