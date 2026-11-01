import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { HeadingAnchor } from "../modules/navigation/HeadingAnchor";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const withToasts = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

const stubClipboard = (writeText = vi.fn().mockResolvedValue(undefined)) => {
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  return writeText;
};

/** jsdom has no execCommand, the copy path on plain http where there is no clipboard. */
const stubExecCommand = (result: boolean) => {
  const execCommand = vi.fn(() => result);
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    writable: true,
    value: execCommand,
  });
  return execCommand;
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete (document as { execCommand?: unknown }).execCommand;
});

const sectionUrl = (id: string) => `${window.location.origin}${window.location.pathname}#${id}`;

/**
 * The copy-link anchor beside a heading: a named link to `#id` that copies
 * the section URL from a click or Enter, and reports success or failure in a
 * toast when there is a provider.
 */
describe("HeadingAnchor", () => {
  it("renders a named link to the section and passes axe", async () => {
    const { container } = render(<HeadingAnchor id="install" label="Install" />, { wrapper });
    const link = screen.getByRole("link", { name: "Copy link to Install" });
    expect(link).toHaveAttribute("href", "#install");
    await expectNoAxeViolations(container);
  });

  it("falls back to a generic name for an empty label", () => {
    render(<HeadingAnchor id="install" label="" />, { wrapper });
    expect(screen.getByRole("link", { name: "Copy link to this section" })).toBeInTheDocument();
  });

  it("copies the section URL on Enter", async () => {
    const user = userEvent.setup();
    const writeText = stubClipboard();
    render(<HeadingAnchor id="install" label="Install" />, { wrapper });
    await user.tab();
    expect(screen.getByRole("link", { name: "Copy link to Install" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(writeText).toHaveBeenCalledExactlyOnceWith(sectionUrl("install"));
  });

  it("shows a success toast after copying", async () => {
    const user = userEvent.setup();
    stubClipboard();
    render(<HeadingAnchor id="install" label="Install" />, { wrapper: withToasts });
    await user.click(screen.getByRole("link", { name: "Copy link to Install" }));
    expect(await screen.findByText("Link copied to clipboard.")).toBeInTheDocument();
  });

  it("shows a failure toast when the clipboard refuses", async () => {
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<HeadingAnchor id="install" label="Install" />, { wrapper: withToasts });
    await user.click(screen.getByRole("link", { name: "Copy link to Install" }));
    expect(await screen.findByText("Failed to copy link.")).toBeInTheDocument();
  });

  // Plain http (a dev server opened from a phone on the LAN) has no clipboard API.
  it("copies through a textarea without a clipboard, and says so", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    const execCommand = stubExecCommand(true);
    render(<HeadingAnchor id="install" label="Install" />, { wrapper: withToasts });
    await user.click(screen.getByRole("link", { name: "Copy link to Install" }));
    expect(execCommand).toHaveBeenCalledExactlyOnceWith("copy");
    expect(await screen.findByText("Link copied to clipboard.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Copy link to Install" })).toHaveFocus();
  });

  it("shows a failure toast, and does not throw, when nothing can copy", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    render(<HeadingAnchor id="install" label="Install" />, { wrapper: withToasts });
    await user.click(screen.getByRole("link", { name: "Copy link to Install" }));
    expect(await screen.findByText("Failed to copy link.")).toBeInTheDocument();
    expect(screen.queryByText("Link copied to clipboard.")).not.toBeInTheDocument();
  });

  it("shows its tooltip on focus", async () => {
    const user = userEvent.setup();
    render(<HeadingAnchor id="install" label="Install" className="extra" />, { wrapper });
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Copy link");
    expect(screen.getByRole("link", { name: "Copy link to Install" })).toHaveClass("extra");
  });
});
