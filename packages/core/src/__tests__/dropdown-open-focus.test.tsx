import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArrowNavigation, Option } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const at = (el: HTMLElement | null, value: string) => el?.closest(`[data-value="${value}"]`);

/**
 * A list opens on the value it is already showing, the way a native select
 * does. Opening a 51-row year picker on 2001 with the chosen 2025 scrolled out
 * of sight is the same list told from the wrong end.
 *
 * `aria-selected` is the marker. It used to be unusable for this, because
 * `applyHighlightedState` overwrote it from `focusedIndex` on every keystroke:
 * a screen reader announced whichever option the arrow keys had reached as the
 * selected one, and the real selection as unselected. Highlighting is
 * `data-highlighted` and the class; selection is the consumer's to author.
 *
 * What jsdom does and does not establish here: it runs the effects, the focus
 * calls and the attribute writes, which is the whole of the logic under test,
 * so these fail without the change. It says nothing about the scroll — how far
 * to scroll depends on live layout, and the panel is still scaling through its
 * open animation while the first pass runs, which is why the scrolling is
 * measured in a browser instead (apps/dev/.../dropdown-check).
 */
describe("where an arrow-navigable list opens", () => {
  it("opens on the selected option, not the first", () => {
    const { getByText } = render(
      <ArrowNavigation layout="column" itemCount={3} autoFocus>
        <Option value="a" label="Alpha" />
        <Option value="b" label="Bravo" selected />
        <Option value="c" label="Charlie" />
      </ArrowNavigation>,
      { wrapper: wrap },
    );

    expect(document.activeElement).toBe(at(getByText("Bravo"), "b"));
  });

  it("opens on the first enabled option when nothing is selected", () => {
    const { getByText } = render(
      <ArrowNavigation layout="column" itemCount={3} autoFocus>
        <Option value="a" label="Alpha" disabled />
        <Option value="b" label="Bravo" />
        <Option value="c" label="Charlie" />
      </ArrowNavigation>,
      { wrapper: wrap },
    );

    expect(document.activeElement).toBe(at(getByText("Bravo"), "b"));
  });

  it("skips a selected option that is disabled", () => {
    const { getByText } = render(
      <ArrowNavigation layout="column" itemCount={3} autoFocus>
        <Option value="a" label="Alpha" />
        <Option value="b" label="Bravo" selected disabled />
        <Option value="c" label="Charlie" />
      </ArrowNavigation>,
      { wrapper: wrap },
    );

    expect(document.activeElement).toBe(at(getByText("Alpha"), "a"));
  });

  it("leaves aria-selected to the consumer as focus moves", () => {
    const { getByText, container } = render(
      <ArrowNavigation layout="column" itemCount={3} autoFocus>
        <Option value="a" label="Alpha" />
        <Option value="b" label="Bravo" selected />
        <Option value="c" label="Charlie" />
      </ArrowNavigation>,
      { wrapper: wrap },
    );

    const selected = () =>
      Array.from(container.querySelectorAll('[role="option"][aria-selected="true"]')).map(
        (el) => el.getAttribute("data-value"),
      );
    const highlighted = () =>
      Array.from(container.querySelectorAll('[role="option"][data-highlighted="true"]')).map(
        (el) => el.getAttribute("data-value"),
      );

    expect(selected()).toEqual(["b"]);
    expect(highlighted()).toEqual(["b"]);

    fireEvent.keyDown(at(getByText("Bravo"), "b") as HTMLElement, { key: "ArrowDown" });

    // The chosen option is still b; only the highlight moved.
    expect(selected()).toEqual(["b"]);
    expect(highlighted()).toEqual(["c"]);
  });
});
