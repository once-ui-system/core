import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { CodeBlock } from "../modules/code/CodeBlock";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const codes = [
  { code: "const a = 1;", language: "ts", label: "TypeScript" },
  { code: "body { color: red; }", language: "css", label: "CSS" },
];

// CodeBlock is React.lazy: warm the module so the first render is not a cold import.
beforeAll(async () => {
  await import("../modules/code/CodeBlock.impl");
});

const ready = (text: string) => screen.findByText(text, {}, { timeout: 5000 });
/** The code element's text: Prism splits it into token spans once it loads. */
const codeShows = (text: string) =>
  waitFor(
    () =>
      expect(
        Array.from(document.querySelectorAll("code")).some((el) => el.textContent === text),
      ).toBe(true),
    { timeout: 5000 },
  );

/**
 * CodeBlock: tabs switch between code instances (reporting the index), the
 * copy button writes the current code to the clipboard, fullscreen opens a
 * portal that Escape closes, and a collapsible block expands on "View code".
 */
describe("CodeBlock interaction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("switches instances from their tabs and reports the index", async () => {
    const user = userEvent.setup();
    const onInstanceChange = vi.fn();
    render(<CodeBlock codes={codes} onInstanceChange={onInstanceChange} />, { wrapper });
    await codeShows("const a = 1;");
    await user.click(screen.getByRole("button", { name: "CSS" }));
    expect(onInstanceChange).toHaveBeenCalledWith(1);
    await codeShows("body { color: red; }");
  });

  it("switches instances from the keyboard", async () => {
    const user = userEvent.setup();
    render(<CodeBlock codes={codes} />, { wrapper });
    await codeShows("const a = 1;");
    screen.getByRole("button", { name: "CSS" }).focus();
    await user.keyboard("{Enter}");
    await codeShows("body { color: red; }");
  });

  it("copies the current code", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<CodeBlock codes={codes} />, { wrapper });
    await codeShows("const a = 1;");
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("const a = 1;");
  });

  it("copies from the compact block's named button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<CodeBlock compact codes={[codes[1]]} />, { wrapper });
    await codeShows("body { color: red; }");
    // getByLabelText and fireEvent: jsdom throws resolving this block's
    // calc(var()) styles, which role queries and user-event both compute.
    fireEvent.click(screen.getByLabelText("Copy code"));
    expect(writeText).toHaveBeenCalledWith("body { color: red; }");
  });

  it("does not throw when the clipboard is unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      errors.push(event.error);
      event.preventDefault();
    };
    window.addEventListener("error", onError);
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CodeBlock codes={[codes[0]]} />, { wrapper });
    await codeShows("const a = 1;");
    await user.click(screen.getByRole("button", { name: "Copy" }));
    window.removeEventListener("error", onError);
    expect(errors).toEqual([]);
  });

  it("copies through a textarea without a clipboard (plain http)", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    const copied: string[] = [];
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: vi.fn(() => {
        copied.push((document.activeElement as HTMLTextAreaElement).value);
        return true;
      }),
    });
    try {
      render(<CodeBlock codes={[codes[0]]} />, { wrapper });
      await codeShows("const a = 1;");
      await user.click(screen.getByRole("button", { name: "Copy" }));
      expect(copied).toEqual(["const a = 1;"]);
    } finally {
      delete (document as { execCommand?: unknown }).execCommand;
    }
  });

  it("hides the copy button with copyButton={false}", async () => {
    render(<CodeBlock codes={[codes[0]]} copyButton={false} />, { wrapper });
    await codeShows("const a = 1;");
    expect(screen.queryByRole("button", { name: "Copy" })).toBeNull();
  });

  it("opens fullscreen in a portal and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<CodeBlock codes={[codes[0]]} fullscreenButton />, { wrapper });
    await codeShows("const a = 1;");
    await user.click(screen.getByRole("button", { name: "Fullscreen" }));
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getAllByRole("button", { name: "Exit fullscreen" }).length).toBeGreaterThan(0);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryAllByRole("button", { name: "Exit fullscreen" })).toHaveLength(0),
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("expands a collapsed block on View code", async () => {
    const user = userEvent.setup();
    const long = Array.from({ length: 10 }, (_, i) => `line ${i}`).join("\n");
    render(
      <CodeBlock
        compact
        isCollapsible
        maxLines={3}
        codes={[{ code: long, language: "ts", label: "Long" }]}
      />,
      { wrapper },
    );
    await user.click(await ready("View code"));
    expect(screen.queryByText("View code")).toBeNull();
  });

  it("renders the preview and remounts it on reload", async () => {
    const user = userEvent.setup();
    let mounts = 0;
    const Counter = () => {
      mounts++;
      return <span>Preview</span>;
    };
    render(<CodeBlock codes={[codes[0]]} preview={<Counter />} reloadButton />, { wrapper });
    await ready("Preview");
    const before = mounts;
    await user.click(screen.getByRole("button", { name: "Reload" }));
    expect(mounts).toBeGreaterThan(before);
  });

  it("has no axe violations", async () => {
    const { container } = render(<CodeBlock codes={codes} />, { wrapper });
    await codeShows("const a = 1;");
    await act(async () => {});
    await expectNoAxeViolations(container);
  });
});
