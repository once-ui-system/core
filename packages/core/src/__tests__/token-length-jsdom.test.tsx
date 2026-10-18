import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Column } from "../components/Column";
import { Dialog } from "../components/Dialog";
import { Dropdown } from "../components/Dropdown";
import { Media } from "../components/Media";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { Table } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { CodeBlock } from "../modules/code/CodeBlock";
import { HeadingNav } from "../modules/navigation/HeadingNav";
import { resetDialogState } from "../test/dialogTestUtils";

/**
 * A number between the token steps (300, 13, 37…) is n/16 rem times
 * `--scaling`. jsdom (30) throws from `getComputedStyle` ("object null is not
 * iterable", in `resolveLengthInPixels`) on a length property whose inline
 * value is math holding a `var()`, such as `max-width: calc(18.75rem *
 * var(--scaling, 1))`, and testing-library's role queries call it on every
 * element they walk. So the length is a bare `var(--ou-n-300)` and the
 * element declares `--ou-n-300` itself: an app that tests with jsdom can pass
 * any number and still query by role.
 *
 * Each case renders components with such numbers, queries by role, reads
 * every computed property of every element, and checks that each
 * `var(--ou-n-*)` an element's style reads is declared on that element.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

/** Reads every computed property of every element in the document. */
function computeEverything() {
  for (const element of document.querySelectorAll("*")) {
    const computed = getComputedStyle(element);
    for (const property of computed) computed.getPropertyValue(property);
  }
}

/** Every `var(--ou-n-*)` an inline style reads, declared beside it. */
function expectTokenLengthsDeclared() {
  let references = 0;
  for (const element of document.querySelectorAll<HTMLElement>("[style]")) {
    const { style } = element;
    for (let i = 0; i < style.length; i++) {
      const value = style.getPropertyValue(style.item(i));
      for (const [, name] of value.matchAll(/var\((--ou-n-[-\d_]+)\)/g)) {
        references++;
        expect(style.getPropertyValue(name), `${name} on <${element.tagName}>`).toMatch(
          /^calc\(-?[\d.]+rem \* var\(--scaling, 1\)\)$/,
        );
      }
    }
  }
  return references;
}

function expectSafe() {
  expect(() => computeEverything()).not.toThrow();
  expect(expectTokenLengthsDeclared()).toBeGreaterThan(0);
}

describe("numbers between the steps keep jsdom's getComputedStyle working", () => {
  it("Column maxWidth={300} padding={13}, and a button inside", () => {
    render(
      <Column maxWidth={300} padding={13} gap={7} top={3} translateY={-5} blur={3}>
        <button type="button">Go</button>
      </Column>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expectSafe();
  });

  it("a breakpoint object, written on the client", () => {
    render(
      <Column data-testid="c" m={{ maxWidth: 300, padding: 13 }} maxWidth={300}>
        <button type="button">Go</button>
      </Column>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expectSafe();
  });

  it("Avatar size={37}: the box, its empty icon, and the image", () => {
    render(
      <>
        <Avatar size={37} />
        <Avatar size={37} src="/a.png" />
        <button type="button">Go</button>
      </>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expectSafe();
    // The image hint stays in device pixels.
    const img = document.querySelector("img");
    if (img?.getAttribute("sizes")) expect(img.getAttribute("sizes")).toBe("37px");
  });

  it("Media height={300}", () => {
    render(
      <>
        <Media src="/a.png" alt="A" aspectRatio="" height={300} />
        <button type="button">Go</button>
      </>,
      { wrapper },
    );
    expect(screen.getByRole("img", { name: "A" })).toBeInTheDocument();
    expectSafe();
  });

  it("Dialog minHeight={300}", () => {
    vi.useFakeTimers();
    try {
      render(
        <Dialog open onClose={() => {}} title="Title" minHeight={300}>
          <button type="button">Primary</button>
        </Dialog>,
        { wrapper },
      );
      act(() => vi.advanceTimersByTime(0));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
      expectSafe();
    } finally {
      vi.useRealTimers();
    }
  });

  it("Dropdown minWidth={300} maxWidth={420} minHeight={60}, open", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown minWidth={300} maxWidth={420} minHeight={60} trigger={<Button>Options</Button>}>
        <Column padding={6}>
          <Option value="rename" label="Rename" />
        </Column>
      </Dropdown>,
      { wrapper },
    );
    const trigger = screen.getByRole("button", { name: "Options" });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    expect(await screen.findByRole("option", { name: "Rename" })).toBeInTheDocument();
    expectSafe();
  });

  it("Table with three row actions (a 96 column)", () => {
    render(
      <Table
        columns={[{ key: "name", header: "Name" }]}
        rows={[{ name: "Ada" }]}
        actions={[
          { icon: "edit", label: "Edit", onClick: () => {} },
          { icon: "copy", label: "Copy", onClick: () => {} },
          { icon: "delete", label: "Delete", onClick: () => {} },
        ]}
      />,
      { wrapper },
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expectSafe();
  });

  it("CodeBlock codeHeight={300}", async () => {
    render(
      <CodeBlock
        codeHeight={300}
        codes={[{ code: "const a = 1;", language: "ts", label: "a.ts" }]}
      />,
      { wrapper },
    );
    // Found by its element: the highlighter loads asynchronously.
    await waitFor(() => expect(document.querySelector("pre")).not.toBeNull());
    const pre = document.querySelector("pre") as HTMLElement;
    expect(pre.style.maxHeight).toBe("var(--ou-n-300)");
    // The whole block: the border overlay's `calc(100% + 2px)` (a percentage
    // in math, which jsdom cannot compute either) is a custom property now.
    expectSafe();
  });

  it("CodeBlock collapsed, with its fade", async () => {
    render(
      <CodeBlock
        isCollapsible
        maxLines={2}
        codeHeight={300}
        codes={[{ code: "a\nb\nc\nd\ne", language: "ts", label: "a.ts" }]}
      />,
      { wrapper },
    );
    await screen.findByText("View code", {}, { timeout: 5000 });
    expectSafe();
  });
});

describe("other inline math keeps jsdom's getComputedStyle working", () => {
  it("HeadingNav: the indicator's offset and each link's indent", async () => {
    render(
      <>
        <h2 id="one">One</h2>
        <h3 id="two">Two</h3>
        <HeadingNav />
      </>,
      { wrapper },
    );
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(() => computeEverything()).not.toThrow();
    await userEvent.click(screen.getByRole("link", { name: "Two" }));
    expect(() => computeEverything()).not.toThrow();
  });
});
