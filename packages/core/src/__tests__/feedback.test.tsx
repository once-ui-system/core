import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "../components/Icon";
import { Feedback } from "../components/Feedback";

/**
 * The root Flex used to hardcode `vertical="start"`, which is right when there
 * is a heading for the icon to line up with and wrong for a bare one-line
 * message: the icon and the text column then share only their 16px top padding
 * and sit top-flush rather than centred on each other.
 *
 * `vertical` reaches the DOM as `align-start` / `align-center`, so that is what
 * these assert. Children count as a reason to top-align too — a rich body wraps
 * like a heading does.
 */
const rootClass = (c: HTMLElement) => c.firstElementChild?.className ?? "";

describe("Feedback alignment", () => {
  it("centres the icon when there is only a description", () => {
    const { container } = render(<Feedback description="Checkout cancelled." />);
    expect(rootClass(container)).toContain("align-center");
    expect(rootClass(container)).not.toContain("align-start");
  });

  it("top-aligns when there is a title", () => {
    const { container } = render(<Feedback title="Cancelled" description="Nothing was charged." />);
    expect(rootClass(container)).toContain("align-start");
  });

  it("top-aligns when there are children but no title", () => {
    const { container } = render(
      <Feedback description="Nothing was charged.">
        <button type="button">Retry</button>
      </Feedback>,
    );
    expect(rootClass(container)).toContain("align-start");
  });

  it("still lets the caller override the alignment", () => {
    // `{...rest}` is spread last on the root Flex, so an explicit prop wins
    // over the computed default. Worth pinning: it is the escape hatch for
    // any layout this heuristic gets wrong.
    const { container } = render(<Feedback description="One line." vertical="start" />);
    expect(rootClass(container)).toContain("align-start");
  });
});

describe("Feedback icon", () => {
  it("renders the variant's icon by default", () => {
    const { container } = render(<Feedback variant="success" description="Saved." />);
    const { container: reference } = render(<Icon name="check" />);
    expect(container.querySelector("svg")?.innerHTML).toBe(
      reference.querySelector("svg")?.innerHTML,
    );
  });

  it("renders a named icon instead when one is given", () => {
    const { container } = render(<Feedback description="Saved." icon="check" />);
    const { container: variantDefault } = render(<Feedback description="Saved." />);
    const { container: reference } = render(<Icon name="check" />);

    expect(container.querySelector("svg")?.innerHTML).toBe(
      reference.querySelector("svg")?.innerHTML,
    );
    // And it is genuinely not the "info" glyph the variant would have used.
    expect(container.querySelector("svg")?.innerHTML).not.toBe(
      variantDefault.querySelector("svg")?.innerHTML,
    );
  });

  it("still honours showIcon={false}", () => {
    const { container } = render(<Feedback description="Saved." icon="check" showIcon={false} />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
