import { render, screen } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../components/Dialog";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { resetDialogState } from "../test/dialogTestUtils";

/**
 * Booleans that toggle visibility read `showX` (MIGRATING.md), and `Drawer`
 * shipped with `showClose`. Dialog's inverted `hideClose` was removed in 3.0.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const renderDialog = (props: Partial<React.ComponentProps<typeof Dialog>> = {}) =>
  render(
    <Dialog open onClose={vi.fn()} title="Settings" {...props}>
      <button type="button">Save</button>
    </Dialog>,
    { wrapper: wrap },
  );

const closeButton = () => screen.queryByRole("button", { name: "Close" });

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

describe("Dialog showClose", () => {
  it("shows the close button by default", () => {
    renderDialog();
    expect(closeButton()).toBeInTheDocument();
  });

  it("hides it with showClose={false}", () => {
    renderDialog({ showClose: false });
    expect(closeButton()).toBeNull();
  });

  it("hides the floating one on a flush dialog too", () => {
    const { unmount } = renderDialog({ flush: true });
    expect(closeButton()).toBeInTheDocument();
    unmount();
    renderDialog({ flush: true, showClose: false });
    expect(closeButton()).toBeNull();
  });
});
