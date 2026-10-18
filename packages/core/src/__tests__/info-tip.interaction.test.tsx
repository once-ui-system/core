import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "../components/Tooltip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

const text = "Shown on invoices and receipts.";
const icon = () => screen.getByRole("button", { name: "More information" });
const tip = () => screen.queryByRole("tooltip");

/**
 * InfoTip beyond its focus contract (infotip-hovercard.test.tsx): it opens
 * for the pointer too, its layout props reach the tip box rather than the
 * icon, its description exists only while the tip does, and several on one
 * page each describe their own icon.
 */
describe("InfoTip", () => {
  it("renders a named icon with no tip, and no axe violations, by default", async () => {
    const { container } = render(<Tooltip content={text} />, { wrapper: wrap });
    expect(icon()).toHaveAttribute("tabindex", "0");
    expect(tip()).toBeNull();
    expect(icon()).not.toHaveAccessibleDescription(text);
    await expectNoAxeViolations(container);
  });

  it("opens on hover and closes on unhover", async () => {
    const user = userEvent.setup();
    render(<Tooltip content={text} />, { wrapper: wrap });
    await user.hover(icon());
    expect(await screen.findByRole("tooltip")).toHaveTextContent(text);
    expect(icon()).toHaveAccessibleDescription(text);
    await user.unhover(icon());
    await waitFor(() => expect(tip()).toBeNull());
  });

  it("puts layout props on the tip box", async () => {
    const user = userEvent.setup();
    render(<Tooltip maxWidth="30rem" data-testid="box" content={text} />, { wrapper: wrap });
    await user.hover(icon());
    const box = await screen.findByRole("tooltip");
    expect(box).toHaveAttribute("data-testid", "box");
    expect(icon()).not.toHaveAttribute("data-testid");
  });

  it("gives each InfoTip its own tip id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip aria-label="About names" content="Your legal name." />
        <Tooltip aria-label="About emails" content="Where receipts go." />
      </>,
      { wrapper: wrap },
    );
    const names = screen.getByRole("button", { name: "About names" });
    const emails = screen.getByRole("button", { name: "About emails" });
    expect(names.getAttribute("aria-describedby")).not.toBe(
      emails.getAttribute("aria-describedby"),
    );

    await user.tab();
    await user.tab();
    expect(emails).toHaveFocus();
    await waitFor(() => expect(emails).toHaveAccessibleDescription("Where receipts go."));
    await waitFor(() => expect(screen.queryByText("Your legal name.")).toBeNull());
  });

  it("toggles the tip on Enter and Space, as a button should", async () => {
    const user = userEvent.setup();
    render(<Tooltip content={text} />, { wrapper: wrap });
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    await user.keyboard(" ");
    expect(await screen.findByRole("tooltip")).toHaveTextContent(text);
    expect(icon()).toHaveFocus();
  });
});
