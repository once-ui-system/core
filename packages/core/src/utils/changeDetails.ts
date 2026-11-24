/**
 * What every value change reports beside the new value: who made it and a
 * way to refuse it. `onValueChange(value, details)`, `onCheckedChange(checked,
 * details)` and the other `onXChange` callbacks pass one.
 *
 * An app tells an agent's edit from a person's with `details.source`, and
 * keeps the current value with `details.cancel()`.
 */

/**
 * Who made a change.
 *
 * - `pointer`: a mouse, pen or touch.
 * - `keyboard`: typing, or a key that pressed a control (Enter, Space, arrows).
 * - `agent`: an assistant, through `withChangeSource("agent", …)`.
 * - `programmatic`: the app's own code, such as a change after an `await`.
 */
export type ChangeSource = "pointer" | "keyboard" | "agent" | "programmatic";

export interface ChangeDetails {
  /** Who made the change. */
  source: ChangeSource;
  /** The DOM event behind the change, when there was one. */
  event?: Event;
  /**
   * Keep the current value. Uncontrolled, the component stays as it was;
   * controlled, the parent's `value` already decides, so this only marks it.
   */
  cancel: () => void;
  /** Whether a callback called `cancel()`. */
  readonly canceled: boolean;
}

let forced: ChangeSource | null = null;

/**
 * Run `fn` with every change it makes reported as `source`. An agent bridge
 * wraps its actions in `"agent"`; an app passes a press's source on to a
 * change it makes after an `await`. Synchronous: changes in a later task
 * report as usual.
 */
export function withChangeSource<T>(source: ChangeSource, fn: () => T): T {
  const previous = forced;
  forced = source;
  try {
    return fn();
  } finally {
    forced = previous;
  }
}

const POINTER = /^(pointer|mouse|touch|drag|drop|wheel|dblclick|contextmenu)/;

/**
 * The last thing a person did, kept from the capture phase. A change that
 * only sees a relayed event (a visual that calls `input.click()`, a
 * checkbox's `change`) takes its source from here.
 */
let lastInput: { source: "pointer" | "keyboard"; at: number } | null = null;
const RECENT_MS = 1000;
if (typeof document !== "undefined") {
  const note = (source: "pointer" | "keyboard") => () => {
    lastInput = { source, at: Date.now() };
  };
  document.addEventListener("pointerdown", note("pointer"), { capture: true, passive: true });
  document.addEventListener("keydown", note("keyboard"), { capture: true, passive: true });
}

function recentInput(): "pointer" | "keyboard" | null {
  return lastInput && Date.now() - lastInput.at < RECENT_MS ? lastInput.source : null;
}

/** The source an event implies, or `programmatic` when there is none. */
export function changeSourceOf(event?: Event | { nativeEvent: Event } | null): ChangeSource {
  if (forced) return forced;
  const native =
    event && typeof event === "object" && "nativeEvent" in event
      ? event.nativeEvent
      : (event ??
        (typeof window !== "undefined" ? (window as Window & { event?: Event }).event : undefined));
  // A setter handed straight to a callback can receive a value that is no event.
  const type = (native as { type?: unknown } | undefined)?.type;
  if (typeof type !== "string") return "programmatic";
  if (type.startsWith("key")) return "keyboard";
  if (POINTER.test(type)) return "pointer";
  // A click with no pointer behind it is Enter or Space on a control, a
  // relayed `input.click()`, or a script: the last input tells them apart.
  if (type === "click") {
    return (native as MouseEvent).detail > 0 ? "pointer" : (recentInput() ?? "programmatic");
  }
  if (type === "input" || type === "change" || type === "beforeinput" || type === "paste") {
    return recentInput() ?? "keyboard";
  }
  return "programmatic";
}

/** A fresh details object for one change. */
export function createChangeDetails(event?: Event | { nativeEvent: Event } | null): ChangeDetails {
  let canceled = false;
  const candidate =
    event && typeof event === "object" && "nativeEvent" in event ? event.nativeEvent : event;
  const native =
    candidate && typeof (candidate as { type?: unknown }).type === "string" ? candidate : undefined;
  return {
    source: changeSourceOf(event),
    event: native,
    cancel: () => {
      canceled = true;
    },
    get canceled() {
      return canceled;
    },
  };
}

/**
 * Tell `callback` about a change and say whether it stands: false when the
 * callback called `cancel()`. For components that keep their own state
 * outside `useControllableState`.
 */
export function reportChange<T>(
  callback: ((value: T, details?: ChangeDetails) => void) | undefined,
  value: T,
  event?: Event | { nativeEvent: Event } | null,
): boolean {
  if (!callback) return true;
  const details = createChangeDetails(event);
  callback(value, details);
  return !details.canceled;
}
