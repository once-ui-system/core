import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Feedback } from "../components/Feedback";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

/**
 * Feedback is an inline message: danger and warning are alerts, info and
 * success a polite status. Headed by its title, and dismissible from a named
 * close button when asked to be.
 */
describe("Feedback", () => {
  it("renders a polite status with minimal props", async () => {
    const { container } = render(<Feedback description="Checkout cancelled." />, {
      wrapper: wrap,
    });
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent("Checkout cancelled.");
    expect(screen.queryByRole("heading")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it.each(["info", "success", "warning", "danger"] as const)(
    "renders the %s variant with its title as a level-2 heading, cleanly",
    async (variant) => {
      const { container } = render(
        <Feedback tone={variant} title="Heads up" description="Details here." />,
        { wrapper: wrap },
      );
      expect(screen.getByRole("heading", { level: 2, name: "Heads up" })).toBeInTheDocument();
      const role = variant === "danger" || variant === "warning" ? "alert" : "status";
      expect(screen.getByRole(role)).toHaveTextContent("Details here.");
      await expectNoAxeViolations(container);
    },
  );

  it("hides its icon from assistive tech", () => {
    render(<Feedback description="Saved." />, { wrapper: wrap });
    const svg = screen.getByRole("status").querySelector("svg");
    expect(svg?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("has no close button unless asked", () => {
    render(<Feedback title="Saved" />, { wrapper: wrap });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is dismissed from its named close button, by pointer and keyboard", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Feedback title="Saved" description="All good." showCloseButton onClose={onClose} />,
      { wrapper: wrap },
    );
    const close = screen.getByRole("button", { name: "Close alert" });
    await user.tab();
    expect(close).toHaveFocus();
    await user.click(close);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClose).toHaveBeenCalledTimes(3);
    await expectNoAxeViolations(container);
  });

  /** Questionable (see report): the close button lives in the title row only. */
  it("shows no close button without a title, even with showCloseButton", () => {
    render(<Feedback description="Only text." showCloseButton onClose={() => {}} />, {
      wrapper: wrap,
    });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders children under the description, interactive ones included", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(
      <Feedback title="Failed" description="Upload stopped.">
        <button type="button" onClick={retry}>
          Retry
        </button>
      </Feedback>,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("forwards its ref, className and other props to the alert", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Feedback ref={ref} className="mine" data-testid="fb" description="x" />, {
      wrapper: wrap,
    });
    const alert = screen.getByRole("status");
    expect(ref.current).toBe(alert);
    expect(alert).toHaveClass("mine");
    expect(alert).toHaveAttribute("data-testid", "fb");
  });
});
