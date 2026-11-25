import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../components/Field";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { RichTextEditor } from "../modules/richtext";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const editorFor = (name: string) => screen.findByRole("textbox", { name });

describe("RichTextEditor", () => {
  it("renders an empty frame on the server", () => {
    const html = renderToString(
      <LayoutProvider>
        <RichTextEditor aria-label="Notes" />
      </LayoutProvider>,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("contenteditable");
  });

  it("loads the editor, named by its label, with the starting document", async () => {
    render(<RichTextEditor label="Notes" defaultValue="<p>Hello <strong>there</strong></p>" />, {
      wrapper,
    });
    const editor = await editorFor("Notes");
    expect(editor.getAttribute("contenteditable")).toBe("true");
    expect(editor.getAttribute("aria-multiline")).toBe("true");
    expect(editor.innerHTML).toContain("<strong>there</strong>");
  });

  it("takes its name, hint and error from a Field", async () => {
    render(
      <Field label="Description" hint="Shown on the listing" error="Too short">
        <RichTextEditor />
      </Field>,
      { wrapper },
    );
    const editor = await editorFor("Description");
    expect(editor.getAttribute("aria-invalid")).toBe("true");
    expect(editor.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("follows a controlled value", async () => {
    function Controlled() {
      const [value, setValue] = useState("<p>One</p>");
      return (
        <>
          <RichTextEditor aria-label="Body" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue("<p>Two</p>")}>
            Replace
          </button>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />, { wrapper });
    const editor = await editorFor("Body");
    expect(editor.textContent).toBe("One");
    await user.click(screen.getByRole("button", { name: "Replace" }));
    await waitFor(() => expect(editor.textContent).toBe("Two"));
  });

  it("presses a mark button and reports the change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RichTextEditor aria-label="Body" defaultValue="<p>Text</p>" onValueChange={onValueChange} />,
      { wrapper },
    );
    await editorFor("Body");
    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(toolbar.contains(bold)).toBe(true);
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    // Select the whole document, then make it bold.
    await act(async () => {
      const editor = screen.getByRole("textbox", { name: "Body" });
      editor.focus();
      document.getSelection()?.selectAllChildren(editor);
      document.dispatchEvent(new Event("selectionchange"));
    });
    await user.click(bold);
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("<p><strong>Text</strong></p>"));
    expect(screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("hides the toolbar with tools={false} and when read-only", async () => {
    const { rerender } = render(<RichTextEditor aria-label="Body" tools={false} />, { wrapper });
    await editorFor("Body");
    expect(screen.queryByRole("toolbar")).toBeNull();
    rerender(<RichTextEditor aria-label="Body" readOnly />);
    const editor = await editorFor("Body");
    expect(screen.queryByRole("toolbar")).toBeNull();
    await waitFor(() => expect(editor.getAttribute("contenteditable")).toBe("false"));
    expect(editor.getAttribute("aria-readonly")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<RichTextEditor label="Notes" placeholder="Write something" />, {
      wrapper,
    });
    await editorFor("Notes");
    await expectNoAxeViolations(container);
  });

  it("takes its parent's height with fillHeight, so opening the link row never grows it", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RichTextEditor
        aria-label="Journal"
        fillHeight
        minHeight="17rem"
        maxHeight="17rem"
        tools={["bold", "link"]}
        defaultValue="<p>Tea is free.</p>"
      />,
      { wrapper },
    );
    const editor = await editorFor("Journal");
    const area = editor.parentElement?.parentElement as HTMLElement;
    // No fixed height for a caller to measure and feed back: the frame flexes
    // and the writing area takes what the toolbar leaves.
    expect(area.style.minHeight).toBe("");
    expect(area.style.maxHeight).toBe("");
    expect(editor.style.minHeight).toBe("");

    // jsdom has no layout; ProseMirror scrolls the selection into view on focus.
    const rects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] });
    const restore = [Range.prototype, Element.prototype].map((proto) => {
      const own = Object.getOwnPropertyDescriptor(proto, "getClientRects");
      Object.defineProperty(proto, "getClientRects", { configurable: true, value: rects });
      Range.prototype.getBoundingClientRect ??= () => new DOMRect();
      return () =>
        own
          ? Object.defineProperty(proto, "getClientRects", own)
          : delete (proto as { getClientRects?: unknown }).getClientRects;
    });
    await user.click(screen.getByRole("button", { name: "Link" }));
    expect(screen.getByRole("textbox", { name: "Link address" })).toBeInTheDocument();
    expect(area.style.minHeight).toBe("");
    expect(container.querySelectorAll("[style*='17rem']")).toHaveLength(0);
    for (const undo of restore) undo();
  });
});
