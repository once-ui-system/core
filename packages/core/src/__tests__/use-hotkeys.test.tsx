import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type UseHotkeysOptions, useHotkeys } from "../hooks/useHotkeys";
import { parseHotkey } from "../internal/hotkeys";

const setPlatform = (platform: string) =>
  vi.spyOn(window.navigator, "platform", "get").mockReturnValue(platform);

const press = (init: KeyboardEventInit, target: EventTarget = document.body) => {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
};

const listen = (keys: string | string[], options?: UseHotkeysOptions, callback = vi.fn()) => {
  const hook = renderHook(() => useHotkeys(keys, callback, options));
  return { callback, ...hook };
};

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Shorty's studio, Stack's editor and Kinetic each wire a window keydown by
 * hand, with their own "is the user typing?" guard and their own idea of
 * which modifier `mod` is.
 */
describe("hotkey syntax", () => {
  it("parses modifiers, named keys, the plus key and sequences", () => {
    expect(parseHotkey("mod+shift+k")).toEqual([
      { key: "k", mod: true, meta: false, ctrl: false, alt: false, shift: true },
    ]);
    expect(parseHotkey("Esc")[0].key).toBe("escape");
    expect(parseHotkey("space")[0].key).toBe(" ");
    expect(parseHotkey("ctrl++")[0]).toMatchObject({ key: "+", ctrl: true });
    expect(parseHotkey("cmd+up")[0]).toMatchObject({ key: "arrowup", meta: true });
    expect(parseHotkey("g i").map((step) => step.key)).toEqual(["g", "i"]);
  });
});

describe("useHotkeys", () => {
  it("treats mod as Ctrl off Apple platforms", () => {
    setPlatform("Win32");
    const { callback } = listen("mod+k");
    press({ key: "k", metaKey: true });
    expect(callback).not.toHaveBeenCalled();
    press({ key: "k", ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][1]).toBe("mod+k");
  });

  it("treats mod as Command on Apple platforms", () => {
    setPlatform("MacIntel");
    const { callback } = listen("mod+k");
    press({ key: "k", ctrlKey: true });
    expect(callback).not.toHaveBeenCalled();
    press({ key: "k", metaKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("requires the modifiers to match exactly", () => {
    setPlatform("Win32");
    const undo = listen("mod+z").callback;
    const redo = listen("mod+shift+z").callback;
    press({ key: "Z", ctrlKey: true, shiftKey: true });
    expect(undo).not.toHaveBeenCalled();
    expect(redo).toHaveBeenCalledTimes(1);
    press({ key: "z", ctrlKey: true });
    expect(undo).toHaveBeenCalledTimes(1);
    press({ key: "z" });
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it("matches a shifted character with or without shift written", () => {
    const plain = listen("?").callback;
    const shifted = listen("shift+?").callback;
    press({ key: "?", shiftKey: true });
    expect(plain).toHaveBeenCalledTimes(1);
    expect(shifted).toHaveBeenCalledTimes(1);
  });

  it("matches a named key, case-insensitively", () => {
    const { callback } = listen("Escape");
    press({ key: "Escape" });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("falls back to the physical key when Option changes the character", () => {
    setPlatform("MacIntel");
    const { callback } = listen("alt+k");
    press({ key: "˚", code: "KeyK", altKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not take the physical key over a Latin letter (AZERTY)", () => {
    const { callback } = listen("q");
    press({ key: "a", code: "KeyQ" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("registers alternatives from an array", () => {
    const { callback } = listen(["j", "down"]);
    press({ key: "j" });
    press({ key: "ArrowDown" });
    expect(callback.mock.calls.map(([, hotkey]) => hotkey)).toEqual(["j", "down"]);
  });

  it("prevents the browser's default for a match, unless told not to", () => {
    listen("mod+s");
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(press({ key: "p", ctrlKey: true }).defaultPrevented).toBe(false);
  });

  it("leaves the default alone with preventDefault: false", () => {
    const { callback } = listen("/", { preventDefault: false });
    const event = press({ key: "/" });
    expect(callback).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores a modifier pressed on its own, and mid-composition keys", () => {
    const { callback } = listen("shift");
    press({ key: "Shift", shiftKey: true });
    expect(callback).not.toHaveBeenCalled();

    const typed = listen("k").callback;
    press({ key: "k", isComposing: true });
    expect(typed).not.toHaveBeenCalled();
  });
});

describe("useHotkeys while typing", () => {
  const Fields = () => (
    <>
      <input aria-label="Text" />
      <textarea aria-label="Notes" />
      <select aria-label="Pick">
        <option>One</option>
      </select>
      <div contentEditable suppressContentEditableWarning>
        <p data-testid="paragraph">Draft</p>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: a custom editor's role is what is under test */}
      <div role="textbox" aria-label="Custom" tabIndex={0} />
      <input type="checkbox" aria-label="Check" />
      <button type="button">Button</button>
    </>
  );

  it("skips keys typed into fields and editable regions", () => {
    render(<Fields />);
    const { callback } = listen("c");
    for (const field of [
      screen.getByLabelText("Text"),
      screen.getByLabelText("Notes"),
      screen.getByLabelText("Pick"),
      screen.getByTestId("paragraph"),
      screen.getByRole("textbox", { name: "Custom" }),
    ]) {
      press({ key: "c" }, field);
    }
    expect(callback).not.toHaveBeenCalled();
  });

  it("still fires from controls that do not take text", () => {
    render(<Fields />);
    const { callback } = listen("c");
    press({ key: "c" }, screen.getByLabelText("Check"));
    press({ key: "c" }, screen.getByRole("button", { name: "Button" }));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("fires in a field with allowWhileTyping", () => {
    render(<Fields />);
    const { callback } = listen("mod+s", { allowWhileTyping: true });
    press({ key: "s", ctrlKey: true }, screen.getByLabelText("Notes"));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("useHotkeys sequences", () => {
  it("fires after each step in order", () => {
    const { callback } = listen("g i");
    press({ key: "g" });
    expect(callback).not.toHaveBeenCalled();
    press({ key: "i" });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("starts over on a wrong key, which may begin it again", () => {
    const { callback } = listen("g i");
    press({ key: "g" });
    press({ key: "x" });
    press({ key: "i" });
    expect(callback).not.toHaveBeenCalled();

    press({ key: "g" });
    press({ key: "g" });
    press({ key: "i" });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("forgets a half-typed sequence after the timeout", () => {
    vi.useFakeTimers();
    const { callback } = listen("g i", { sequenceTimeout: 500 });
    press({ key: "g" });
    act(() => vi.advanceTimersByTime(501));
    press({ key: "i" });
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("useHotkeys lifecycle", () => {
  it("stops listening on unmount", () => {
    const { callback, unmount } = listen("k");
    unmount();
    press({ key: "k" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("does nothing while disabled, and resumes when enabled", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useHotkeys("k", callback, { enabled }), {
      initialProps: { enabled: false },
    });
    press({ key: "k" });
    expect(callback).not.toHaveBeenCalled();
    rerender({ enabled: true });
    press({ key: "k" });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the latest callback without rebinding", () => {
    const add = vi.spyOn(window, "addEventListener");
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ fn }) => useHotkeys(["k", "j"], fn), {
      initialProps: { fn: first },
    });
    const bound = add.mock.calls.filter(([type]) => type === "keydown").length;
    rerender({ fn: second });
    expect(add.mock.calls.filter(([type]) => type === "keydown").length).toBe(bound);
    press({ key: "k" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("listens only inside a target element", () => {
    const Scoped = ({ onKey }: { onKey: () => void }) => {
      const ref = useRef<HTMLDivElement>(null);
      useHotkeys("arrowright", onKey, { target: ref });
      return (
        <>
          <div ref={ref} data-testid="timeline" tabIndex={-1} />
          <button type="button">Outside</button>
        </>
      );
    };
    const onKey = vi.fn();
    render(<Scoped onKey={onKey} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Outside" }), { key: "ArrowRight" });
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByTestId("timeline"), { key: "ArrowRight" });
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("renders on the server without touching the window", () => {
    const Component = () => {
      useHotkeys("mod+k", () => {});
      return <span>Ready</span>;
    };
    expect(renderToString(<Component />)).toContain("Ready");
  });
});
