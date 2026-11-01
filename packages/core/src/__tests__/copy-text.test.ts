import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "../internal/copyText";

const stubClipboard = (writeText: ReturnType<typeof vi.fn> | undefined) =>
  vi.stubGlobal("navigator", { ...navigator, clipboard: writeText ? { writeText } : undefined });

/** jsdom has no execCommand; stand one in that records what was selected when it ran. */
const stubExecCommand = (result: boolean | Error = true) => {
  const seen: { command: string; value?: string; focused: boolean }[] = [];
  const execCommand = vi.fn((command: string) => {
    const active = document.activeElement;
    seen.push({
      command,
      value: active instanceof HTMLTextAreaElement ? active.value : undefined,
      focused: active instanceof HTMLTextAreaElement,
    });
    if (result instanceof Error) throw result;
    return result;
  });
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    writable: true,
    value: execCommand,
  });
  return { execCommand, seen };
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete (document as { execCommand?: unknown }).execCommand;
  document.body.innerHTML = "";
});

/**
 * copyText: the Clipboard API where the page has it, a hidden textarea and
 * execCommand("copy") where it does not (plain http) or refuses, and a
 * boolean saying whether anything was copied.
 */
describe("copyText", () => {
  it("writes through the Clipboard API when there is one", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const { execCommand } = stubExecCommand();
    await expect(copyText("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("hello");
    expect(execCommand).not.toHaveBeenCalled();
  });

  it("copies through a selected textarea without a Clipboard API", async () => {
    stubClipboard(undefined);
    const { seen } = stubExecCommand();
    await expect(copyText("http://192.168.1.20:3000/docs#install")).resolves.toBe(true);
    expect(seen).toEqual([
      { command: "copy", value: "http://192.168.1.20:3000/docs#install", focused: true },
    ]);
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("gives focus and the selection back afterwards", async () => {
    stubClipboard(undefined);
    stubExecCommand();
    document.body.innerHTML = "<p>Some text</p><button type='button'>Copy</button>";
    const button = document.querySelector("button") as HTMLButtonElement;
    const paragraph = document.querySelector("p") as HTMLParagraphElement;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    button.focus();
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    await copyText("x");

    expect(button).toHaveFocus();
    // Selection.toString() is empty in jsdom while a button has focus; read the range.
    const selection = document.getSelection() as Selection;
    expect(selection.rangeCount).toBe(1);
    expect(selection.getRangeAt(0).toString()).toBe("Some text");
  });

  it("falls back to the textarea when the Clipboard API refuses", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    const { execCommand } = stubExecCommand();
    await expect(copyText("hello")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledExactlyOnceWith("copy");
  });

  it("reports failure when nothing can copy", async () => {
    stubClipboard(undefined);
    await expect(copyText("hello")).resolves.toBe(false);

    stubExecCommand(false);
    await expect(copyText("hello")).resolves.toBe(false);

    stubExecCommand(new Error("not allowed"));
    await expect(copyText("hello")).resolves.toBe(false);
    expect(document.querySelector("textarea")).toBeNull();
  });
});
