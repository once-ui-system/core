import { DataThemeProvider, LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { StyleOverlay } from "../StyleOverlay.js";
import styles from "../StyleOverlay.module.scss";
import { expectNoAxeViolations } from "../test/axe.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

const panel = (container: HTMLElement) =>
  container.querySelector('[aria-label="Style panel"]') as HTMLElement;

/**
 * jsdom 30 throws computing any style of an element whose max-height is
 * `calc(% - var())`, which breaks every role query; a plain max-height avoids it.
 */
const jsdomSafe = { maxHeight: "100%" };

/**
 * StyleOverlay shows its children as the trigger; activating it hides the
 * trigger and opens the floating StylePanel, whose close button brings the
 * trigger back. The closed panel stays mounted, hidden by its stylesheet
 * (visibility: hidden), which jsdom does not apply.
 */
describe("StyleOverlay", () => {
  it("opens from a click on the trigger and closes from the close button", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <StyleOverlay style={jsdomSafe}>
        <button type="button">Customize</button>
      </StyleOverlay>,
      { wrapper },
    );
    expect(panel(container)).not.toHaveClass(styles.open as string);
    expect(panel(container).className).not.toMatch(/\bfalse\b/);

    await user.click(screen.getByRole("button", { name: "Customize" }));
    expect(panel(container)).toHaveClass(styles.open as string);
    expect(screen.queryByRole("button", { name: "Customize" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Close style panel" }));
    expect(panel(container)).not.toHaveClass(styles.open as string);
    expect(screen.getByRole("button", { name: "Customize" })).toBeInTheDocument();
  });

  it("opens from the keyboard on a focusable trigger", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <StyleOverlay style={jsdomSafe}>
        <button type="button">Customize</button>
      </StyleOverlay>,
      { wrapper },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Customize" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(panel(container)).toHaveClass(styles.open as string);
  });

  it("holds a working style panel", async () => {
    const user = userEvent.setup();
    render(
      <StyleOverlay style={jsdomSafe}>
        <button type="button">Customize</button>
      </StyleOverlay>,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Customize" }));
    await user.click(screen.getByRole("button", { name: "Corner style: sharp" }));
    expect(screen.getByRole("button", { name: "Corner style: sharp" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("passes iconButtonProps to the close button, and other props to the panel", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <StyleOverlay
        iconButtonProps={{ "aria-label": "Done" }}
        data-testid="overlay-panel"
        style={{ ...jsdomSafe, width: "20rem" }}
      >
        <button type="button">Customize</button>
      </StyleOverlay>,
      { wrapper },
    );
    // The closed panel is aria-hidden; open it to reach its close button.
    await user.click(screen.getByRole("button", { name: "Customize" }));
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    expect(panel(container)).toHaveAttribute("data-testid", "overlay-panel");
    // A caller style joins the panel's own instead of replacing it.
    expect(panel(container).style.width).toBe("20rem");
    expect(panel(container).style.maxWidth).toBe("28rem");
  });

  it("forwards its ref and has no axe violations when open", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <StyleOverlay ref={ref} style={jsdomSafe}>
        <button type="button">Customize</button>
      </StyleOverlay>,
      { wrapper },
    );
    expect(ref.current).toBe(container.firstElementChild);
    await user.click(screen.getByRole("button", { name: "Customize" }));
    await expectNoAxeViolations(container);
  });
});
